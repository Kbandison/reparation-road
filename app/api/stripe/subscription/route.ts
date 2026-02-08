import { NextRequest, NextResponse } from 'next/server';
import { stripe, SUBSCRIPTION_PLANS, SubscriptionPlanId } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to get period end from subscription
function getPeriodEnd(subscription: Stripe.Subscription): number {
  // Access via items for newer API versions
  const item = subscription.items.data[0];
  if (item?.current_period_end) {
    return item.current_period_end;
  }
  // Fallback to subscription level (for type safety)
  return (subscription as unknown as { current_period_end: number }).current_period_end || Date.now() / 1000;
}

// GET - Get subscription details
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_subscription_id, stripe_customer_id, subscription_status, subscription_interval, subscription_period_end, subscription_cancel_at_period_end')
      .eq('id', userId)
      .single();

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json({ subscription: null });
    }

    const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        interval: profile.subscription_interval,
        currentPeriodEnd: profile.subscription_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        priceId: subscription.items.data[0]?.price.id,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// POST - Cancel, reactivate, or switch subscription
export async function POST(request: NextRequest) {
  try {
    const { userId, action, newPlanId } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'cancel': {
        // Cancel at end of period (not immediately)
        const subscription = await stripe.subscriptions.update(
          profile.stripe_subscription_id,
          { cancel_at_period_end: true }
        );

        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        const periodEnd = getPeriodEnd(subscription);

        return NextResponse.json({
          message: 'Subscription will cancel at the end of the billing period',
          cancelAt: new Date(periodEnd * 1000).toISOString(),
        });
      }

      case 'reactivate': {
        // Reactivate a canceled subscription
        const subscription = await stripe.subscriptions.update(
          profile.stripe_subscription_id,
          { cancel_at_period_end: false }
        );

        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        return NextResponse.json({
          message: 'Subscription reactivated',
          subscription: {
            id: subscription.id,
            status: subscription.status,
          },
        });
      }

      case 'switch': {
        // Switch between monthly and yearly plans
        if (!newPlanId) {
          return NextResponse.json(
            { error: 'Missing newPlanId for switch action' },
            { status: 400 }
          );
        }

        const newPlan = SUBSCRIPTION_PLANS[newPlanId as SubscriptionPlanId];
        if (!newPlan) {
          return NextResponse.json(
            { error: 'Invalid plan ID' },
            { status: 400 }
          );
        }

        const currentSubscription = await stripe.subscriptions.retrieve(
          profile.stripe_subscription_id
        );

        // Update the subscription with the new price
        const updatedSubscription = await stripe.subscriptions.update(
          profile.stripe_subscription_id,
          {
            items: [
              {
                id: currentSubscription.items.data[0].id,
                price: newPlan.priceId,
              },
            ],
            proration_behavior: 'create_prorations',
          }
        );

        const periodEnd = getPeriodEnd(updatedSubscription);

        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_interval: newPlan.interval,
            subscription_period_end: new Date(periodEnd * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        return NextResponse.json({
          message: `Subscription switched to ${newPlan.name}`,
          subscription: {
            id: updatedSubscription.id,
            status: updatedSubscription.status,
            interval: newPlan.interval,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

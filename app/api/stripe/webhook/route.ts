import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to get period timestamps from subscription
function getSubscriptionPeriods(subscription: Stripe.Subscription): {
  periodStart: number;
  periodEnd: number;
} {
  const item = subscription.items.data[0];
  if (item?.current_period_start && item?.current_period_end) {
    return {
      periodStart: item.current_period_start,
      periodEnd: item.current_period_end,
    };
  }
  // Fallback for type safety
  const sub = subscription as unknown as {
    current_period_start: number;
    current_period_end: number;
  };
  return {
    periodStart: sub.current_period_start || Date.now() / 1000,
    periodEnd: sub.current_period_end || Date.now() / 1000,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;
  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  const interval = subscription.items.data[0]?.price.recurring?.interval;
  const periods = getSubscriptionPeriods(subscription);

  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: subscription.status === 'active' ? 'paid' : 'free',
      stripe_subscription_id: subscription.id,
      subscription_interval: interval as 'month' | 'year',
      subscription_period_start: new Date(periods.periodStart * 1000).toISOString(),
      subscription_period_end: new Date(periods.periodEnd * 1000).toISOString(),
      subscription_cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  console.log(`Subscription ${subscription.status} for user ${userId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;
  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'free',
      stripe_subscription_id: null,
      subscription_interval: null,
      subscription_period_start: null,
      subscription_period_end: null,
      subscription_cancel_at_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  console.log(`Subscription deleted for user ${userId}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`Invoice paid: ${invoice.id}`);
  // Subscription update is handled by customer.subscription.updated
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Find user by Stripe customer ID
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single();

  if (profile) {
    console.log(`Invoice payment failed for user ${profile.id} (${profile.email})`);
    // TODO: Send notification email about failed payment
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;

  if (session.mode === 'subscription' && userId) {
    // Subscription is handled by customer.subscription.created
    console.log(`Checkout completed for subscription, user ${userId}`);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Update order status
  await supabaseAdmin
    .from('orders')
    .update({
      status: 'processing',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  console.log(`Payment succeeded: ${paymentIntent.id}`);
}

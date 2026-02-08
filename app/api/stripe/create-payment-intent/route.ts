import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { CartItem } from '@/contexts/CartContext';
import { ShippingAddress } from '@/lib/supabase';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CreatePaymentIntentRequest {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  userId?: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const { items, shippingAddress, userId, email }: CreatePaymentIntentRequest = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !email) {
      return NextResponse.json(
        { error: 'Missing shipping address or email' },
        { status: 400 }
      );
    }

    // Calculate total on server side (never trust client-side amounts)
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = 5.99; // Flat rate shipping
    const total = subtotal + shipping;
    const amountInCents = Math.round(total * 100);

    // Get or create Stripe customer if user is logged in
    let stripeCustomerId: string | undefined;

    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      stripeCustomerId = profile?.stripe_customer_id;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email,
          metadata: {
            supabase_user_id: userId,
          },
          shipping: {
            name: shippingAddress.name,
            address: {
              line1: shippingAddress.line1,
              line2: shippingAddress.line2 || undefined,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.postal_code,
              country: shippingAddress.country,
            },
          },
        });
        stripeCustomerId = customer.id;

        await supabaseAdmin
          .from('profiles')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', userId);
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        user_id: userId || 'guest',
        items: JSON.stringify(items.map(i => ({ id: i.id, name: i.name, qty: i.quantity, price: i.price }))),
      },
      receipt_email: email,
      shipping: {
        name: shippingAddress.name,
        address: {
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 || undefined,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postal_code,
          country: shippingAddress.country,
        },
      },
    });

    // Create order in database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId || null,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending',
        total_amount: total,
        shipping_address: shippingAddress,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      // Continue even if order creation fails - we'll reconcile via webhook
    }

    // Create order items
    if (order) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      await supabaseAdmin.from('order_items').insert(orderItems);
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order?.id,
      total,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
});

// Price IDs for subscription plans
export const STRIPE_PRICES = {
  PREMIUM_MONTHLY: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
  PREMIUM_YEARLY: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
} as const;

// Subscription plan details (for UI display)
export const SUBSCRIPTION_PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Premium Monthly',
    price: 7.99,
    interval: 'month' as const,
    priceId: STRIPE_PRICES.PREMIUM_MONTHLY,
  },
  yearly: {
    id: 'yearly',
    name: 'Premium Yearly',
    price: 79.99,
    interval: 'year' as const,
    priceId: STRIPE_PRICES.PREMIUM_YEARLY,
    savings: '~17% savings',
  },
} as const;

export type SubscriptionInterval = 'month' | 'year';
export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS;

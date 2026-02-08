"use client";

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children, clientSecret }) => {
  const options: StripeElementsOptions = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#3a5a40',
            colorBackground: '#ffffff',
            colorText: '#5b2e00',
            colorDanger: '#df1b41',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      }
    : {
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#3a5a40',
            colorBackground: '#ffffff',
            colorText: '#5b2e00',
            colorDanger: '#df1b41',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

// Higher-order component for wrapping pages that need Stripe
export const withStripe = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return function WithStripeComponent(props: P) {
    return (
      <StripeProvider>
        <Component {...props} />
      </StripeProvider>
    );
  };
};

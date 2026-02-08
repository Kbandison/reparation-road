"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShippingForm } from './ShippingForm';
import { CartSummary } from '@/components/cart/CartSummary';
import { StripeProvider } from '@/components/stripe/StripeProvider';
import { ShippingAddress } from '@/lib/supabase';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

const CheckoutFormContent: React.FC = () => {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState(user?.email || '');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: profile?.first_name
      ? `${profile.first_name} ${profile.last_name || ''}`
      : '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate form
    if (!email || !shippingAddress.name || !shippingAddress.line1 ||
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.postal_code) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          receipt_email: email,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw confirmError;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        clearCart();
        router.push(`/order-confirmation?payment_intent=${paymentIntent.id}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(
        err instanceof Error ? err.message : 'Payment failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Forms */}
        <div className="space-y-8">
          <ShippingForm
            address={shippingAddress}
            email={email}
            onChange={setShippingAddress}
            onEmailChange={setEmail}
            disabled={loading}
          />

          <div>
            <h2 className="text-xl font-semibold text-brand-brown mb-4">
              Payment Details
            </h2>
            <PaymentElement />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={!stripe || loading || items.length === 0}
            className="w-full bg-brand-green hover:bg-brand-darkgreen text-white py-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Pay ${(subtotal + 5.99).toFixed(2)}
              </>
            )}
          </Button>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:pl-8 lg:border-l">
          <h2 className="text-xl font-semibold text-brand-brown mb-4">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                  <span className="absolute -top-1 -right-1 bg-brand-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-brown truncate">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
                <p className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <CartSummary showCheckoutButton={false} />
          </div>
        </div>
      </div>
    </form>
  );
};

export const CheckoutForm: React.FC = () => {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState(user?.email || '');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  });

  useEffect(() => {
    if (items.length === 0) {
      router.push('/shop');
      return;
    }

    // Don't create payment intent until we have required fields
    if (!email || !shippingAddress.name || !shippingAddress.line1 ||
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.postal_code) {
      setLoading(false);
      return;
    }

    createPaymentIntent();
  }, [items, email, shippingAddress]);

  const createPaymentIntent = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingAddress,
          userId: user?.id,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize checkout');
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Show shipping form first
  const isFormComplete = email && shippingAddress.name && shippingAddress.line1 &&
    shippingAddress.city && shippingAddress.state && shippingAddress.postal_code;

  if (!isFormComplete) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/shop')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <ShippingForm
              address={shippingAddress}
              email={email}
              onChange={setShippingAddress}
              onEmailChange={setEmail}
            />
            <Button
              onClick={createPaymentIntent}
              disabled={!isFormComplete}
              className="w-full mt-6 bg-brand-green hover:bg-brand-darkgreen"
            >
              Continue to Payment
            </Button>
          </div>

          <div className="lg:pl-8 lg:border-l">
            <h2 className="text-xl font-semibold text-brand-brown mb-4">
              Order Summary
            </h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-brand-brown">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <CartSummary showCheckoutButton={false} />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={createPaymentIntent}>Try Again</Button>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => router.push('/shop')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Shop
      </Button>

      <StripeProvider clientSecret={clientSecret}>
        <CheckoutFormContent />
      </StripeProvider>
    </div>
  );
};

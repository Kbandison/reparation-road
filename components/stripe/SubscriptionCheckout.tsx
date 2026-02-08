"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlanSelector } from './PlanSelector';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CreditCard, Shield } from 'lucide-react';

interface SubscriptionCheckoutProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user || !profile) {
      setError('Please sign in to subscribe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-brand-brown mb-2">
            Upgrade to Premium
          </h2>
          <p className="text-gray-600">
            Get full access to all historical collections and features
          </p>
        </div>

        <div className="mb-6">
          <PlanSelector
            selectedPlan={selectedPlan}
            onPlanChange={setSelectedPlan}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-brand-green hover:bg-brand-darkgreen text-white py-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Continue to Checkout
            </>
          )}
        </Button>

        {onCancel && (
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full mt-3"
            disabled={loading}
          >
            Cancel
          </Button>
        )}

        <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
          <Shield className="w-4 h-4 mr-2" />
          <span>Secure payment powered by Stripe</span>
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Cancel anytime. Your subscription will remain active until the end of your billing period.
        </p>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Loader2,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Calendar,
  ArrowRightLeft
} from 'lucide-react';

interface SubscriptionDetails {
  id: string;
  status: string;
  interval: 'month' | 'year';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  priceId: string;
}

export const SubscriptionManagement: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile?.subscription_status === 'paid') {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [user, profile]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/stripe/subscription?userId=${user?.id}`);
      const data = await response.json();

      if (data.subscription) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'cancel' | 'reactivate' | 'switch', newPlanId?: string) => {
    if (!user) return;

    setActionLoading(action);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action,
          newPlanId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription');
      }

      setMessage(data.message);
      await fetchSubscription();
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!profile || profile.subscription_status !== 'paid') {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isMonthly = subscription?.interval === 'month';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-brand-brown mb-6 flex items-center">
        <CreditCard className="w-6 h-6 mr-2" />
        Subscription Management
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          {message}
        </div>
      )}

      <div className="space-y-4">
        {/* Current Plan */}
        <div className="p-4 bg-brand-tan rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-brand-brown">
                Premium {isMonthly ? 'Monthly' : 'Yearly'}
              </h3>
              <p className="text-sm text-gray-600">
                ${isMonthly ? '7.99/month' : '79.99/year'}
              </p>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
        </div>

        {/* Billing Period */}
        {subscription && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                {subscription.cancelAtPeriodEnd
                  ? `Ends on ${formatDate(subscription.currentPeriodEnd)}`
                  : `Renews on ${formatDate(subscription.currentPeriodEnd)}`}
              </span>
            </div>
          </div>
        )}

        {/* Switch Plan */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-brand-brown mb-3 flex items-center">
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Switch Plan
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            {isMonthly
              ? 'Save ~17% by switching to yearly billing ($79.99/year)'
              : 'Switch to monthly billing ($7.99/month)'}
          </p>
          <Button
            onClick={() => handleAction('switch', isMonthly ? 'yearly' : 'monthly')}
            variant="outline"
            size="sm"
            disabled={actionLoading !== null}
          >
            {actionLoading === 'switch' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Switching...
              </>
            ) : (
              `Switch to ${isMonthly ? 'Yearly' : 'Monthly'}`
            )}
          </Button>
        </div>

        {/* Cancel / Reactivate */}
        <div className="p-4 border border-gray-200 rounded-lg">
          {subscription?.cancelAtPeriodEnd ? (
            <>
              <div className="flex items-center text-amber-600 mb-3">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="font-medium">Subscription ending</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Your subscription will end on {formatDate(subscription.currentPeriodEnd)}.
                You can reactivate it to continue your premium access.
              </p>
              <Button
                onClick={() => handleAction('reactivate')}
                className="bg-brand-green hover:bg-brand-darkgreen"
                disabled={actionLoading !== null}
              >
                {actionLoading === 'reactivate' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reactivating...
                  </>
                ) : (
                  'Reactivate Subscription'
                )}
              </Button>
            </>
          ) : (
            <>
              <h4 className="font-medium text-brand-brown mb-2">Cancel Subscription</h4>
              <p className="text-sm text-gray-600 mb-3">
                Cancel your subscription. You&apos;ll continue to have access until your
                current billing period ends.
              </p>
              <Button
                onClick={() => handleAction('cancel')}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                disabled={actionLoading !== null}
              >
                {actionLoading === 'cancel' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

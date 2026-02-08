"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CreditCard, Trash2, Check, Plus } from 'lucide-react';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface PaymentMethodListProps {
  onAddNew?: () => void;
}

export const PaymentMethodList: React.FC<PaymentMethodListProps> = ({ onAddNew }) => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(`/api/stripe/payment-methods?userId=${user?.id}`);
      const data = await response.json();

      if (data.paymentMethods) {
        setPaymentMethods(data.paymentMethods);
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    if (!user) return;

    setActionLoading(paymentMethodId);
    setError(null);

    try {
      const response = await fetch('/api/stripe/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'setDefault',
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set default');
      }

      await fetchPaymentMethods();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (paymentMethodId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    setActionLoading(paymentMethodId);
    setError(null);

    try {
      const response = await fetch('/api/stripe/payment-methods', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove');
      }

      await fetchPaymentMethods();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const getCardIcon = (brand: string) => {
    // In a real app, you might use brand-specific icons
    return <CreditCard className="w-8 h-8 text-gray-400" />;
  };

  const formatBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-brand-brown">Payment Methods</h3>
        {onAddNew && (
          <Button onClick={onAddNew} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add New
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {paymentMethods.length === 0 ? (
        <div className="p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No payment methods saved</p>
          {onAddNew && (
            <Button onClick={onAddNew} variant="link" className="mt-2">
              Add a payment method
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-4 border rounded-lg flex items-center justify-between ${
                method.isDefault ? 'border-brand-green bg-brand-green/5' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center">
                {getCardIcon(method.brand)}
                <div className="ml-3">
                  <p className="font-medium text-brand-brown">
                    {formatBrand(method.brand)} ending in {method.last4}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires {method.expMonth}/{method.expYear}
                  </p>
                </div>
                {method.isDefault && (
                  <span className="ml-3 text-xs bg-brand-green text-white px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {!method.isDefault && (
                  <Button
                    onClick={() => handleSetDefault(method.id)}
                    variant="ghost"
                    size="sm"
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === method.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Set Default
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={() => handleRemove(method.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  disabled={actionLoading !== null}
                >
                  {actionLoading === method.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate order confirmation loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-green mx-auto mb-4" />
          <p className="text-brand-brown">Confirming your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>

          <h1 className="text-3xl font-bold text-brand-brown mb-4">
            Order Confirmed!
          </h1>

          <p className="text-gray-600 mb-6">
            Thank you for your purchase! We&apos;ve sent a confirmation email with
            your order details.
          </p>

          {paymentIntentId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Order Reference</p>
              <p className="font-mono text-brand-brown">
                {paymentIntentId.substring(0, 20)}...
              </p>
            </div>
          )}

          <div className="border-t border-b py-6 my-6">
            <div className="flex items-center justify-center text-brand-green">
              <Package className="w-5 h-5 mr-2" />
              <span className="font-medium">Processing your order</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              You&apos;ll receive shipping updates via email
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/shop">
              <Button className="w-full bg-brand-green hover:bg-brand-darkgreen">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/collection">
              <Button variant="outline" className="w-full">
                Explore Collections
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Questions about your order?{' '}
            <Link href="/#contact" className="text-brand-green hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-beige flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-green" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}

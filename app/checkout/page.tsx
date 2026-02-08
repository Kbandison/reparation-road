"use client";

import React from 'react';
import { CheckoutForm } from '@/components/checkout';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-brand-beige py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-brand-brown mb-8 text-center">
          Checkout
        </h1>
        <CheckoutForm />
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag } from 'lucide-react';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  showCheckoutButton = true,
  onCheckout,
}) => {
  const router = useRouter();
  const { items, subtotal, closeCart } = useCart();

  const shipping = items.length > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      closeCart();
      router.push('/checkout');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium">${subtotal.toFixed(2)}</span>
      </div>

      {items.length > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">${shipping.toFixed(2)}</span>
        </div>
      )}

      <div className="border-t pt-3 flex justify-between">
        <span className="font-semibold text-brand-brown">Total</span>
        <span className="font-bold text-brand-green text-lg">
          ${total.toFixed(2)}
        </span>
      </div>

      {showCheckoutButton && items.length > 0 && (
        <Button
          onClick={handleCheckout}
          className="w-full bg-brand-green hover:bg-brand-darkgreen text-white mt-4"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Checkout
        </Button>
      )}
    </div>
  );
};

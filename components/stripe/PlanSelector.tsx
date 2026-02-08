"use client";

import React from 'react';
import { Check } from 'lucide-react';

interface PlanSelectorProps {
  selectedPlan: 'monthly' | 'yearly';
  onPlanChange: (plan: 'monthly' | 'yearly') => void;
  disabled?: boolean;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  selectedPlan,
  onPlanChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Monthly Plan */}
      <button
        type="button"
        onClick={() => onPlanChange('monthly')}
        disabled={disabled}
        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
          selectedPlan === 'monthly'
            ? 'border-brand-green bg-brand-green/5'
            : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-start justify-between">
          <div className="text-left">
            <p className="font-semibold text-brand-brown">Monthly</p>
            <p className="text-2xl font-bold text-brand-green">$7.99</p>
            <p className="text-sm text-gray-600">per month</p>
          </div>
          {selectedPlan === 'monthly' && (
            <div className="w-6 h-6 bg-brand-green rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </button>

      {/* Yearly Plan */}
      <button
        type="button"
        onClick={() => onPlanChange('yearly')}
        disabled={disabled}
        className={`flex-1 p-4 rounded-lg border-2 transition-all relative ${
          selectedPlan === 'yearly'
            ? 'border-brand-green bg-brand-green/5'
            : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="absolute -top-3 left-4">
          <span className="bg-brand-green text-white text-xs font-semibold px-2 py-1 rounded-full">
            Save ~17%
          </span>
        </div>
        <div className="flex items-start justify-between">
          <div className="text-left">
            <p className="font-semibold text-brand-brown">Yearly</p>
            <p className="text-2xl font-bold text-brand-green">$79.99</p>
            <p className="text-sm text-gray-600">per year</p>
            <p className="text-xs text-brand-green mt-1">
              $6.67/month effective rate
            </p>
          </div>
          {selectedPlan === 'yearly' && (
            <div className="w-6 h-6 bg-brand-green rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </button>
    </div>
  );
};

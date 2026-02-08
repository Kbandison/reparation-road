"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { ShippingAddress } from '@/lib/supabase';

interface ShippingFormProps {
  address: ShippingAddress;
  email: string;
  onChange: (address: ShippingAddress) => void;
  onEmailChange: (email: string) => void;
  disabled?: boolean;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({
  address,
  email,
  onChange,
  onEmailChange,
  disabled = false,
}) => {
  const handleChange = (field: keyof ShippingAddress, value: string) => {
    onChange({ ...address, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-brand-brown">Shipping Information</h2>

      <div>
        <label className="block text-sm font-medium text-brand-brown mb-1">
          Email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          disabled={disabled}
          placeholder="your@email.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-brown mb-1">
          Full Name
        </label>
        <Input
          type="text"
          value={address.name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={disabled}
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-brown mb-1">
          Address Line 1
        </label>
        <Input
          type="text"
          value={address.line1}
          onChange={(e) => handleChange('line1', e.target.value)}
          disabled={disabled}
          placeholder="123 Main St"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-brown mb-1">
          Address Line 2 (Optional)
        </label>
        <Input
          type="text"
          value={address.line2 || ''}
          onChange={(e) => handleChange('line2', e.target.value)}
          disabled={disabled}
          placeholder="Apt 4B"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-brown mb-1">
            City
          </label>
          <Input
            type="text"
            value={address.city}
            onChange={(e) => handleChange('city', e.target.value)}
            disabled={disabled}
            placeholder="New York"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-brown mb-1">
            State
          </label>
          <Input
            type="text"
            value={address.state}
            onChange={(e) => handleChange('state', e.target.value)}
            disabled={disabled}
            placeholder="NY"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-brown mb-1">
            ZIP Code
          </label>
          <Input
            type="text"
            value={address.postal_code}
            onChange={(e) => handleChange('postal_code', e.target.value)}
            disabled={disabled}
            placeholder="10001"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-brown mb-1">
            Country
          </label>
          <select
            value={address.country}
            onChange={(e) => handleChange('country', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
            required
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
          </select>
        </div>
      </div>
    </div>
  );
};

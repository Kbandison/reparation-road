"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
  onClose: () => void;
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onClose,
  onBackToLogin
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Note: This works for all users including admins
      // Supabase sends reset email to any registered user regardless of role
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage({
          type: 'error',
          text: error.message || 'Failed to send reset email. Please try again.'
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Password reset link sent! Check your email inbox.'
        });
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative rounded-2xl shadow-2xl border border-brand-green bg-brand-tan w-[90vw] max-w-md p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brand-brown">Reset Password</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-brand-green hover:bg-brand-green hover:text-brand-tan transition"
          >
            <X size={20} />
          </button>
        </div>

        {!emailSent ? (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-brand-brown mb-1">
                  Email Address
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>

              {message && (
                <div className={`text-sm p-3 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-green hover:bg-brand-darkgreen"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-brand-brown mb-2">
              Check Your Email
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>.
              Click the link in the email to reset your password.
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <p>• The link will expire in 1 hour</p>
              <p>• Check your spam folder if you don&apos;t see the email</p>
              <p>• You can close this window and check your email</p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="text-sm text-brand-green hover:text-brand-darkgreen font-medium flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

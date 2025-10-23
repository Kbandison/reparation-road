"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';

const ResetPasswordPage = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    // Handle the password reset token from the URL
    const handlePasswordRecovery = async () => {
      try {
        // Supabase automatically exchanges the token in the URL hash for a session
        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth event:', event, 'Session:', session);

          if (event === 'PASSWORD_RECOVERY') {
            // User clicked the reset link and has a valid recovery session
            setValidating(false);
          } else if (event === 'SIGNED_IN' && session) {
            // Session established after password recovery
            setValidating(false);
          } else if (event === 'SIGNED_OUT') {
            // Invalid or expired token
            setMessage({
              type: 'error',
              text: 'Invalid or expired password reset link. Please request a new one.'
            });
            setValidating(false);
          }
        });

        // Also check if we already have a session (e.g., page refresh)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setValidating(false);
        } else {
          // If no session after 3 seconds, show error
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: { session: retrySession } }) => {
              if (!retrySession) {
                setMessage({
                  type: 'error',
                  text: 'Invalid or expired password reset link. Please request a new one.'
                });
                setValidating(false);
              }
            });
          }, 3000);
        }

        // Cleanup subscription
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error during password recovery:', error);
        setMessage({
          type: 'error',
          text: 'An error occurred. Please try requesting a new password reset link.'
        });
        setValidating(false);
      }
    };

    handlePasswordRecovery();
  }, []);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate new password
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      setLoading(false);
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to reset password' });
        setLoading(false);
        return;
      }

      setMessage({ type: 'success', text: 'Password reset successfully!' });
      setResetSuccess(true);

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown">Validating reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-brand-green p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              resetSuccess ? 'bg-green-100' : 'bg-brand-green'
            }`}>
              {resetSuccess ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <Lock className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-brand-brown mb-2">
              {resetSuccess ? 'Password Reset!' : 'Reset Your Password'}
            </h1>
            <p className="text-gray-600 text-sm">
              {resetSuccess
                ? 'Your password has been successfully updated.'
                : 'Enter your new password below.'}
            </p>
          </div>

          {!resetSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-brand-brown mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter your new password"
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-brown mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your new password"
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-md text-sm ${
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
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                You can now sign in with your new password.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting you to the home page...
              </p>
              <Button
                onClick={() => router.push('/')}
                className="w-full bg-brand-green hover:bg-brand-darkgreen"
              >
                Go to Home Page
              </Button>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-brand-green hover:text-brand-darkgreen font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

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

  // Prevent navigation away from this page until password is reset
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!resetSuccess && !validating) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [resetSuccess, validating]);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    // Handle the password reset token from the URL
    const handlePasswordRecovery = async () => {
      try {
        console.log('=== PASSWORD RESET DEBUG ===');
        console.log('Full URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Hash length:', window.location.hash.length);

        // Check for hash parameters (Supabase puts the token in URL hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        console.log('Hash params:', {
          accessToken: accessToken ? `${accessToken.substring(0, 10)}...` : 'MISSING',
          refreshToken: refreshToken ? 'present' : 'MISSING',
          type: type || 'MISSING',
          error: error || 'none',
          errorDescription: errorDescription || 'none'
        });

        // If there's an error in the URL, show it
        if (error) {
          console.error('Error from Supabase:', error, errorDescription);
          setMessage({
            type: 'error',
            text: `Authentication error: ${errorDescription || error}`
          });
          setValidating(false);
          return;
        }

        // Set up auth state change listener FIRST
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth event:', event, 'Session:', session ? 'present' : 'missing');

          if (!mounted) return;

          if (event === 'PASSWORD_RECOVERY') {
            // User clicked the reset link and has a valid recovery session
            console.log('Password recovery event detected - session ready');
            setValidating(false);
          } else if (event === 'SIGNED_IN' && session) {
            // Session established after password recovery
            console.log('Signed in event detected - session ready');
            setValidating(false);
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed');
          }
        });

        subscription = authSubscription;

        // If we have recovery parameters in the URL, wait for Supabase to process them
        if (type === 'recovery' && accessToken) {
          console.log('Recovery token detected, waiting for Supabase to process...');

          // Give Supabase more time to process the token exchange
          await new Promise(resolve => setTimeout(resolve, 1500));

          if (!mounted) return;

          // Check if session was established
          const { data: { session }, error } = await supabase.auth.getSession();

          console.log('Session check after delay:', {
            hasSession: !!session,
            error: error?.message
          });

          if (session) {
            console.log('Recovery session established successfully');
            setValidating(false);
            return;
          }

          // If no session yet, wait a bit longer (sometimes takes time)
          await new Promise(resolve => setTimeout(resolve, 1500));

          if (!mounted) return;

          const { data: { session: retrySession } } = await supabase.auth.getSession();

          if (retrySession) {
            console.log('Recovery session established on retry');
            setValidating(false);
          } else {
            console.error('No session after recovery token processing');
            setMessage({
              type: 'error',
              text: 'Invalid or expired password reset link. Please request a new one.'
            });
            setValidating(false);
          }
        } else {
          // No recovery parameters in URL
          console.log('No recovery parameters found in URL');
          setMessage({
            type: 'error',
            text: 'No password reset token found. Please click the link from your email.'
          });
          setValidating(false);
        }

      } catch (error) {
        console.error('Error during password recovery:', error);
        if (!mounted) return;
        setMessage({
          type: 'error',
          text: 'An error occurred. Please try requesting a new password reset link.'
        });
        setValidating(false);
      }
    };

    handlePasswordRecovery();

    // Cleanup
    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
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
      console.log('=== ATTEMPTING PASSWORD UPDATE ===');
      console.log('Updating password...');

      // First, verify we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session ? 'valid' : 'MISSING');

      if (!session) {
        setMessage({
          type: 'error',
          text: 'Session expired. Please request a new password reset link.'
        });
        setLoading(false);
        return;
      }

      // Set up listener for USER_UPDATED event
      const updateComplete = new Promise<{ error: Error | null }>((resolve) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, updatedSession) => {
          if (event === 'USER_UPDATED') {
            console.log('USER_UPDATED event received');
            subscription.unsubscribe();
            resolve({ error: null });
          }
        });

        // Also handle the direct response
        supabase.auth.updateUser({ password: newPassword }).then((response) => {
          if (response.error) {
            console.log('Update returned with error:', response.error.message);
            subscription.unsubscribe();
            resolve({ error: response.error });
          }
          // If no error but USER_UPDATED hasn't fired yet, let the event handler resolve it
        }).catch((err) => {
          console.log('Update threw exception:', err);
          subscription.unsubscribe();
          resolve({ error: err });
        });
      });

      const timeoutPromise = new Promise<{ error: Error }>((resolve) => {
        setTimeout(() => {
          console.log('Update timed out after 15 seconds');
          resolve({ error: new Error('Password update timed out after 15 seconds') });
        }, 15000);
      });

      const { error } = await Promise.race([updateComplete, timeoutPromise]);

      console.log('Password update completed', { error: error?.message || 'none' });

      if (error) {
        console.error('Password update failed:', error);
        setMessage({ type: 'error', text: error.message || 'Failed to reset password' });
        setLoading(false);
        return;
      }

      console.log('Password reset successful!');
      setMessage({ type: 'success', text: 'Password reset successfully!' });
      setResetSuccess(true);
      setLoading(false);

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        console.log('Redirecting to home page...');
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      });
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
    <div className="fixed inset-0 bg-brand-beige flex items-center justify-center py-12 px-4 z-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-brand-green p-8">
          {/* Security Notice */}
          {!resetSuccess && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                🔒 <strong>Security Notice:</strong> You must complete the password reset to continue.
              </p>
            </div>
          )}

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

        {/* Only show "Return to Home" after successful reset */}
        {resetSuccess && (
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-brand-green hover:text-brand-darkgreen font-medium"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;

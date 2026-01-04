"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresPaid?: boolean;
  requiresAdmin?: boolean;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresPaid = false,
  requiresAdmin = false,
  fallback
}) => {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [showSlowLoadingWarning, setShowSlowLoadingWarning] = useState(false);

  // Show warning if loading takes too long
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowSlowLoadingWarning(true);
      }, 10000);

      return () => {
        clearTimeout(timer);
        setShowSlowLoadingWarning(false);
      };
    }
  }, [loading]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown mb-2">Loading...</p>

          {showSlowLoadingWarning && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-3">
                Loading is taking longer than expected. This might be due to a slow connection.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-brand-darkgreen transition-colors text-sm"
              >
                Refresh Page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-brand-brown mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to access this page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-brand-green text-white px-6 py-2 rounded-lg hover:bg-brand-darkgreen transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Requires paid subscription but user is free (admins automatically get access)
  if (requiresPaid && profile?.subscription_status !== 'paid' && profile?.role !== 'admin') {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-brand-brown mb-4">
            Premium Membership Required
          </h2>
          <p className="text-gray-600 mb-6">
            This content is available to premium members only. 
            Upgrade your membership to access all historical data.
          </p>
          <button
            onClick={() => router.push('/membership')}
            className="bg-brand-green text-white px-6 py-2 rounded-lg hover:bg-brand-darkgreen transition-colors"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  // Requires admin but user is not admin
  if (requiresAdmin && profile?.role !== 'admin') {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-brand-brown mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access this page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-brand-green text-white px-6 py-2 rounded-lg hover:bg-brand-darkgreen transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
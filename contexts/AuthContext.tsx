"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  hasPremiumAccess: boolean;
  isPasswordRecovery: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<any>;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Inactivity timeout: 30 minutes
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [inactivityTimeout, setInactivityTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('[AUTH DEBUG] Fetching profile for user:', userId);

      // Remove timeout - let Supabase handle it naturally
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AUTH ERROR] Error fetching profile:', error, {
          code: error.code,
          message: error.message,
          details: error.details
        });

        // If profile doesn't exist (PGRST116), that's okay - new user
        if (error.code === 'PGRST116') {
          console.log('[AUTH DEBUG] Profile not found for user, may need to create one');
          return;
        }

        // For other errors, don't throw - user stays logged in
        console.warn('[AUTH WARN] Profile fetch failed, user will have limited access');
        return;
      }

      if (data) {
        setProfile(data);
        console.log('[AUTH DEBUG] Profile loaded successfully:', {
          role: data.role,
          subscription: data.subscription_status,
          email: data.email
        });
      } else {
        console.warn('[AUTH WARN] Profile query succeeded but returned no data');
      }
    } catch (error: unknown) {
      console.error('[AUTH ERROR] Unexpected error in fetchProfile:', error);
      // Don't set profile to null - keep whatever we had
      // User stays logged in, just without profile data loaded
    }
  }, []);

  // Inactivity timer management - moved after signOut definition to avoid circular dependency
  const handleInactivityLogout = useCallback(async () => {
    console.log('User inactive for 30 minutes, logging out...');
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setIsPasswordRecovery(false);
      if (typeof window !== 'undefined') {
        router.push('/');
      }
    } catch (error) {
      console.error('Error during inactivity logout:', error);
    }
  }, [router]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
    }

    const timeout = setTimeout(handleInactivityLogout, INACTIVITY_TIMEOUT);

    setInactivityTimeout(timeout);
  }, [handleInactivityLogout]);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Start initial timer
    resetInactivityTimer();

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [user, resetInactivityTimer]);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        console.log('[AUTH DEBUG] Session check:', {
          hasSession: !!session,
          userEmail: session?.user?.email,
          timestamp: new Date().toISOString()
        });

        setUser(session?.user ?? null);
        // Don't set isPasswordRecovery on initial load - only set it when PASSWORD_RECOVERY event fires
        setIsPasswordRecovery(false);

        if (session?.user) {
          // Wait for profile to fully load before setting loading to false
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('[AUTH ERROR] Error getting session:', error);
      } finally {
        // Always set loading to false after everything is done
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('[AUTH DEBUG] Auth state changed:', {
            event,
            hasSession: !!session,
            timestamp: new Date().toISOString()
          });

          // ONLY set password recovery when the PASSWORD_RECOVERY event fires
          const isRecovery = event === 'PASSWORD_RECOVERY';

          if (isRecovery) {
            console.log('[AUTH DEBUG] PASSWORD_RECOVERY detected, redirecting to /reset-password');
            // Redirect immediately when PASSWORD_RECOVERY event fires
            router.push('/reset-password');
          }

          setUser(session?.user ?? null);
          setIsPasswordRecovery(isRecovery);

          if (session?.user) {
            // Wait for profile to fully load before setting loading to false
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('[AUTH ERROR] Error in auth state change:', error);
        } finally {
          // Always set loading to false after everything is done
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile, router]);

  const createProfile = async (userId: string, email: string, firstName?: string, lastName?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email,
            first_name: firstName,
            last_name: lastName,
            subscription_status: 'free',
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await createProfile(data.user.id, email, firstName, lastName);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Immediately set user and fetch profile to ensure state is updated
      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      // Clear inactivity timeout
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
        setInactivityTimeout(null);
      }

      // Sign out from Supabase (this clears auth tokens)
      await supabase.auth.signOut();

      // Clear state
      setUser(null);
      setProfile(null);
      setIsPasswordRecovery(false);

      // Explicitly clear localStorage (for any cached data)
      if (typeof window !== 'undefined') {
        // Clear any Supabase auth storage
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');

        // Clear session storage as well
        sessionStorage.clear();
      }

      console.log('User signed out successfully');

      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { data: null, error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Check if user has premium access (paid subscription OR admin role)
  const hasPremiumAccess = Boolean(
    profile && (profile.subscription_status === 'paid' || profile.role === 'admin')
  );

  const value: AuthContextType = {
    user,
    profile,
    loading,
    hasPremiumAccess,
    isPasswordRecovery,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetInactivityTimer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Database, 
  TrendingUp, 
  Settings, 
  Shield,
  Calendar,
  BookOpen,
  Star
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  totalBookings: number;
  recentSignups: number;
  collectionViews: number;
}

interface RecentUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  subscription_status: 'free' | 'paid';
  role: 'user' | 'admin';
  created_at: string;
}

const AdminDashboard = () => {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    totalBookings: 0,
    recentSignups: 0,
    collectionViews: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);

      // Fetch user stats
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, subscription_status, role, created_at');

      if (profilesError) throw profilesError;

      // Fetch bookings count
      const { count: bookingsCount, error: bookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      if (bookingsError) throw bookingsError;

      // Calculate stats
      const totalUsers = profiles?.length || 0;
      const premiumUsers = profiles?.filter(p => p.subscription_status === 'paid').length || 0;
      const freeUsers = totalUsers - premiumUsers;
      
      // Recent signups (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentSignups = profiles?.filter(p => 
        new Date(p.created_at) > weekAgo
      ).length || 0;

      setStats({
        totalUsers,
        premiumUsers,
        freeUsers,
        totalBookings: bookingsCount || 0,
        recentSignups,
        collectionViews: 0, // This would need to be tracked separately
      });

      // Get recent users (last 10)
      const recent = profiles
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10) || [];

      setRecentUsers(recent);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const updateUserSubscription = async (userId: string, newStatus: 'free' | 'paid') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Refresh data
      await fetchDashboardData();
    } catch (error) {
      console.error('Error updating user subscription:', error);
      alert('Failed to update user subscription');
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      // Prevent admin from demoting themselves
      if (userId === user?.id && newRole === 'user') {
        alert('You cannot demote yourself from admin role');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Refresh data
      await fetchDashboardData();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    change 
  }: { 
    title: string; 
    value: number; 
    icon: React.ComponentType<{ className?: string }>; 
    color: string;
    change?: number;
  }) => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-brand-brown">{value.toLocaleString()}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change} this week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-beige py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Shield className="w-8 h-8 text-brand-green mr-3" />
            <h1 className="text-4xl font-bold text-brand-brown">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Welcome back, {profile.first_name || 'Admin'}. Here&apos;s your platform overview.
          </p>
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">
              ✓ Admin Access - You have full premium access to all collections and features.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="bg-blue-500"
            change={stats.recentSignups}
          />
          <StatCard
            title="Premium Members"
            value={stats.premiumUsers}
            icon={Star}
            color="bg-green-500"
          />
          <StatCard
            title="Free Members"
            value={stats.freeUsers}
            icon={Users}
            color="bg-gray-500"
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Calendar}
            color="bg-purple-500"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-brand-brown flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Recent Users
              </h2>
              <Button
                onClick={fetchDashboardData}
                variant="outline"
                size="sm"
              >
                Refresh
              </Button>
            </div>

            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-brand-brown">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user.email.split('@')[0]
                      }
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.subscription_status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.subscription_status === 'paid' ? 'Premium' : 'Free'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => updateUserSubscription(
                          user.id, 
                          user.subscription_status === 'paid' ? 'free' : 'paid'
                        )}
                        size="sm"
                        variant="outline"
                      >
                        {user.subscription_status === 'paid' ? 'Downgrade' : 'Upgrade'}
                      </Button>
                      <Button
                        onClick={() => updateUserRole(
                          user.id, 
                          user.role === 'admin' ? 'user' : 'admin'
                        )}
                        size="sm"
                        variant="outline"
                        disabled={user.id === profile?.id}
                        title={user.id === profile?.id ? 'Cannot change your own role' : ''}
                      >
                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentUsers.length === 0 && (
                <p className="text-gray-500 text-center py-8">No users found</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-brand-brown mb-6 flex items-center">
              <Settings className="w-6 h-6 mr-2" />
              Quick Actions
            </h2>

            <div className="space-y-4">
              <div className="p-4 border border-brand-green rounded-lg">
                <h3 className="font-semibold text-brand-brown mb-2 flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Collection Management
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Manage historical collections and data.
                </p>
                <Button
                  onClick={() => router.push('/collections')}
                  className="w-full"
                  variant="outline"
                >
                  Manage Collections
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-brand-brown mb-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Content Analytics
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  View popular content and usage statistics.
                </p>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Coming Soon
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-brand-brown mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Revenue Reports
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Track subscription revenue and growth.
                </p>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Coming Soon
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-brand-brown mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Booking Management
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  View and manage consultation bookings.
                </p>
                <Button
                  onClick={() => router.push('/admin/bookings')}
                  className="w-full"
                  variant="outline"
                >
                  View Bookings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-brand-brown mb-4">System Status</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-green-800">Database</p>
                <p className="text-sm text-green-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-green-800">Authentication</p>
                <p className="text-sm text-green-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-green-800">Collections API</p>
                <p className="text-sm text-green-600">Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
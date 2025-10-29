"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  DollarSign,
  Users,
  TrendingUp,
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Target
} from 'lucide-react';

interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalPaidUsers: number;
  totalFreeUsers: number;
  conversionRate: number;
  averageRevenuePerUser: number;
  monthlyGrowth: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  newPaidUsers: number;
  churned: number;
}

const AdminRevenuePage = () => {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalPaidUsers: 0,
    totalFreeUsers: 0,
    conversionRate: 0,
    averageRevenuePerUser: 0,
    monthlyGrowth: 0
  });

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchRevenueStats();
    }
  }, [profile]);

  const fetchRevenueStats = async () => {
    try {
      setLoading(true);

      // Get all users with subscription status
      const { data: users } = await supabase
        .from('profiles')
        .select('subscription_status, created_at');

      if (!users) return;

      const paidUsers = users.filter(u => u.subscription_status === 'paid');
      const freeUsers = users.filter(u => u.subscription_status === 'free');

      // Premium subscription is $7.99/month
      const MONTHLY_PRICE = 7.99;

      // Calculate metrics
      const totalPaidUsers = paidUsers.length;
      const totalFreeUsers = freeUsers.length;
      const monthlyRevenue = totalPaidUsers * MONTHLY_PRICE;

      // Estimated yearly revenue (assumes all paid users stay for a year)
      const yearlyRevenue = monthlyRevenue * 12;

      // Conversion rate
      const conversionRate = users.length > 0
        ? (totalPaidUsers / users.length) * 100
        : 0;

      // Average revenue per user (ARPU)
      const averageRevenuePerUser = users.length > 0
        ? monthlyRevenue / users.length
        : 0;

      // Calculate monthly growth (compare last 30 days to previous 30 days)
      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const previous60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recentPaidUsers = paidUsers.filter(u =>
        new Date(u.created_at) >= last30Days
      ).length;

      const previousPaidUsers = paidUsers.filter(u =>
        new Date(u.created_at) >= previous60Days &&
        new Date(u.created_at) < last30Days
      ).length;

      const monthlyGrowth = previousPaidUsers > 0
        ? ((recentPaidUsers - previousPaidUsers) / previousPaidUsers) * 100
        : recentPaidUsers > 0 ? 100 : 0;

      setStats({
        totalRevenue: yearlyRevenue,
        monthlyRevenue,
        totalPaidUsers,
        totalFreeUsers,
        conversionRate,
        averageRevenuePerUser,
        monthlyGrowth
      });

      // Generate monthly data for last 6 months
      const monthlyStats: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthPaidUsers = paidUsers.filter(u => {
          const createdDate = new Date(u.created_at);
          return createdDate >= monthStart && createdDate <= monthEnd;
        }).length;

        monthlyStats.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthPaidUsers * MONTHLY_PRICE,
          newPaidUsers: monthPaidUsers,
          churned: 0 // Would need subscription history to calculate
        });
      }

      setMonthlyData(monthlyStats);

    } catch (error) {
      console.error('Error fetching revenue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-beige py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-brand-brown mb-2 flex items-center gap-3">
            <DollarSign className="w-10 h-10" />
            Revenue & Subscriptions
          </h1>
          <p className="text-gray-600">Track your subscription metrics and revenue performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Monthly Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                stats.monthlyGrowth >= 0 ? 'text-green-100' : 'text-red-100'
              }`}>
                {stats.monthlyGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(stats.monthlyGrowth).toFixed(1)}%
              </div>
            </div>
            <h3 className="text-sm font-medium text-white/80 mb-1">Monthly Revenue</h3>
            <p className="text-3xl font-bold">${stats.monthlyRevenue.toFixed(2)}</p>
            <p className="text-xs text-white/60 mt-2">MRR (Monthly Recurring Revenue)</p>
          </div>

          {/* Annual Revenue Projection */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-brand-green/10 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-brand-green" />
              </div>
              <Target className="w-5 h-5 text-brand-green" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Annual Projection</h3>
            <p className="text-3xl font-bold text-brand-brown">${stats.totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">ARR (Annual Recurring Revenue)</p>
          </div>

          {/* Paid Users */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-500/10 p-3 rounded-xl">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-amber-500 text-sm font-semibold">
                {stats.conversionRate.toFixed(1)}%
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Premium Members</h3>
            <p className="text-3xl font-bold text-brand-brown">{stats.totalPaidUsers}</p>
            <p className="text-xs text-gray-500 mt-2">{stats.totalFreeUsers} free users</p>
          </div>

          {/* ARPU */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/10 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Average Revenue Per User</h3>
            <p className="text-3xl font-bold text-brand-brown">${stats.averageRevenuePerUser.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">ARPU (Monthly)</p>
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Subscription Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-brand-brown mb-6">Subscription Distribution</h2>

            <div className="space-y-6">
              {/* Premium */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-brand-green rounded-full"></div>
                    <span className="font-medium text-brand-brown">Premium ($7.99/mo)</span>
                  </div>
                  <span className="text-2xl font-bold text-brand-brown">{stats.totalPaidUsers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-brand-green to-brand-darkgreen transition-all"
                    style={{ width: `${stats.conversionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.conversionRate.toFixed(1)}% conversion rate
                </p>
              </div>

              {/* Free */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="font-medium text-brand-brown">Free</span>
                  </div>
                  <span className="text-2xl font-bold text-brand-brown">{stats.totalFreeUsers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gray-400 transition-all"
                    style={{ width: `${100 - stats.conversionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Potential for upgrade
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-brand-beige rounded-lg">
              <p className="text-sm text-brand-brown">
                <strong>Total Users:</strong> {stats.totalPaidUsers + stats.totalFreeUsers}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.totalFreeUsers > 0 && (
                  <>Upgrade {stats.totalFreeUsers} free users to increase revenue by ${(stats.totalFreeUsers * 7.99).toFixed(2)}/month</>
                )}
              </p>
            </div>
          </div>

          {/* Revenue Insights */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-brand-brown mb-6">Revenue Insights</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Monthly Growth</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}%
                  </p>
                </div>
                {stats.monthlyGrowth >= 0 ? (
                  <ArrowUpRight className="w-8 h-8 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-8 h-8 text-red-600" />
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Potential Annual Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${((stats.totalPaidUsers + stats.totalFreeUsers) * 7.99 * 12).toFixed(2)}
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Average Customer Lifetime Value</p>
                  <p className="text-2xl font-bold text-amber-600">
                    ${(7.99 * 12).toFixed(2)}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-brand-brown mb-6">6-Month Revenue Trend</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-brand-brown">Month</th>
                  <th className="text-right py-3 px-4 font-semibold text-brand-brown">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-brand-brown">New Premium Users</th>
                  <th className="text-right py-3 px-4 font-semibold text-brand-brown">Growth</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month, index) => {
                  const previousMonth = index > 0 ? monthlyData[index - 1] : null;
                  const growth = previousMonth
                    ? ((month.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
                    : 0;

                  return (
                    <tr key={month.month} className="border-b border-gray-100 hover:bg-brand-beige/50 transition-colors">
                      <td className="py-4 px-4 font-medium text-brand-brown">{month.month}</td>
                      <td className="py-4 px-4 text-right text-brand-brown font-semibold">
                        ${month.revenue.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-700">
                        {month.newPaidUsers}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {index > 0 && (
                          <span className={`inline-flex items-center gap-1 ${
                            growth >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            {Math.abs(growth).toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Revenue calculations are based on active Premium subscriptions at $7.99/month.
              Churn rate data requires payment provider integration for accurate tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenuePage;

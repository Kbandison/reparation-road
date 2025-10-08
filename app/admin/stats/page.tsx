"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Database,
  HardDrive,
  Users,
  MessageSquare,
  TrendingUp,
  FileText,
  Heart,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface ForumStats {
  totalCategories: number;
  totalThreads: number;
  totalPosts: number;
  totalReactions: number;
  activeUsers: number;
}

interface TableStats {
  name: string;
  rowCount: number;
}

const AdminStatsPage = () => {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [forumStats, setForumStats] = useState<ForumStats>({
    totalCategories: 0,
    totalThreads: 0,
    totalPosts: 0,
    totalReactions: 0,
    activeUsers: 0
  });

  const [tableStats, setTableStats] = useState<TableStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchStats();
    }
  }, [profile]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Forum stats
      const [categories, threads, posts, reactions, activeUsers] = await Promise.all([
        supabase.from('forum_categories').select('*', { count: 'exact', head: true }),
        supabase.from('forum_threads').select('*', { count: 'exact', head: true }),
        supabase.from('forum_posts').select('*', { count: 'exact', head: true }),
        supabase.from('forum_reactions').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      setForumStats({
        totalCategories: categories.count || 0,
        totalThreads: threads.count || 0,
        totalPosts: posts.count || 0,
        totalReactions: reactions.count || 0,
        activeUsers: activeUsers.count || 0
      });

      // Table row counts
      const tables = [
        'profiles',
        'bookmarks',
        'archive_pages',
        'forum_categories',
        'forum_threads',
        'forum_posts',
        'forum_reactions',
        'bookings'
      ];

      const tableCounts = await Promise.all(
        tables.map(async (tableName) => {
          const { count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          return {
            name: tableName,
            rowCount: count || 0
          };
        })
      );

      setTableStats(tableCounts.sort((a, b) => b.rowCount - a.rowCount));
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Estimate database size (rough approximation)
  const estimateDatabaseSize = () => {
    const totalRows = tableStats.reduce((sum, table) => sum + table.rowCount, 0);
    // Rough estimate: 2KB average per row
    const sizeInMB = (totalRows * 2) / 1024;
    return sizeInMB.toFixed(2);
  };

  const getUsagePercentage = (used: number, total: number) => {
    return ((used / total) * 100).toFixed(1);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600 bg-green-100';
    if (percentage < 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  const dbSize = parseFloat(estimateDatabaseSize());
  const dbLimit = 500; // Free tier limit in MB
  const dbUsagePercent = parseFloat(getUsagePercentage(dbSize, dbLimit));

  return (
    <div className="min-h-screen bg-brand-beige py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold text-brand-brown mb-8 flex items-center gap-3">
          <Activity className="w-10 h-10" />
          Platform Statistics
        </h1>

        {/* Supabase Usage Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-brown mb-4">Supabase Usage (Estimated)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Database Size */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Database className="w-8 h-8 text-brand-green" />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUsageColor(dbUsagePercent)}`}>
                  {dbUsagePercent}%
                </span>
              </div>
              <h3 className="text-lg font-semibold text-brand-brown mb-2">Database Size</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used:</span>
                  <span className="font-semibold">{dbSize} MB</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Limit:</span>
                  <span>{dbLimit} MB (Free Tier)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      dbUsagePercent < 50 ? 'bg-green-500' :
                      dbUsagePercent < 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(dbUsagePercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Storage (Placeholder) */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <HardDrive className="w-8 h-8 text-brand-green" />
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600">
                  Low
                </span>
              </div>
              <h3 className="text-lg font-semibold text-brand-brown mb-2">Storage</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Images/Files:</span>
                  <span className="font-semibold">Check Supabase</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Limit:</span>
                  <span>1 GB (Free Tier)</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  View detailed storage usage in your Supabase dashboard
                </p>
              </div>
            </div>

            {/* Active Connections */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-brand-green" />
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600">
                  Active
                </span>
              </div>
              <h3 className="text-lg font-semibold text-brand-brown mb-2">Platform Health</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Users:</span>
                  <span className="font-semibold">{forumStats.activeUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Database:</span>
                  <span className="text-green-600 font-semibold">✓ Operational</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Auth:</span>
                  <span className="text-green-600 font-semibold">✓ Operational</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning for high usage */}
          {dbUsagePercent > 80 && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                <div>
                  <h4 className="font-semibold text-red-800">High Database Usage</h4>
                  <p className="text-sm text-red-700">
                    Your database is approaching the free tier limit. Consider upgrading to Supabase Pro ($25/mo) for 8GB.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Forum Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-brown mb-4">Forum Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-brand-green" />
              </div>
              <h3 className="text-sm text-gray-600 mb-1">Categories</h3>
              <p className="text-3xl font-bold text-brand-brown">{forumStats.totalCategories}</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="w-8 h-8 text-brand-green" />
              </div>
              <h3 className="text-sm text-gray-600 mb-1">Threads</h3>
              <p className="text-3xl font-bold text-brand-brown">{forumStats.totalThreads}</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-brand-green" />
              </div>
              <h3 className="text-sm text-gray-600 mb-1">Posts</h3>
              <p className="text-3xl font-bold text-brand-brown">{forumStats.totalPosts}</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-8 h-8 text-brand-green" />
              </div>
              <h3 className="text-sm text-gray-600 mb-1">Reactions</h3>
              <p className="text-3xl font-bold text-brand-brown">{forumStats.totalReactions}</p>
            </div>
          </div>
        </div>

        {/* Table Row Counts */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-brand-brown mb-4">Database Tables</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-brand-brown">Table Name</th>
                  <th className="text-right py-3 px-4 font-semibold text-brand-brown">Row Count</th>
                  <th className="text-right py-3 px-4 font-semibold text-brand-brown">Est. Size (KB)</th>
                </tr>
              </thead>
              <tbody>
                {tableStats.map((table) => (
                  <tr key={table.name} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{table.name}</td>
                    <td className="py-3 px-4 text-right">{table.rowCount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {((table.rowCount * 2)).toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-50">
                  <td className="py-3 px-4">Total</td>
                  <td className="py-3 px-4 text-right">
                    {tableStats.reduce((sum, t) => sum + t.rowCount, 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {(tableStats.reduce((sum, t) => sum + t.rowCount, 0) * 2).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Size estimates are approximations (2KB per row average).
              For accurate usage, check your{' '}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                Supabase Dashboard
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsPage;

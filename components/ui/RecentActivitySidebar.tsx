"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Bookmark, Eye, ChevronRight, History } from 'lucide-react';
import Link from 'next/link';

interface RecentActivity {
  id: string;
  type: 'view' | 'bookmark';
  recordId: string;
  recordName: string;
  collection: string;
  collectionSlug: string;
  timestamp: string;
}

interface RecentActivitySidebarProps {
  className?: string;
}

export function RecentActivitySidebar({ className = '' }: RecentActivitySidebarProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const allActivities: RecentActivity[] = [];

      try {
        // Fetch recent bookmarks
        const { data: bookmarks } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (bookmarks) {
          for (const bookmark of bookmarks) {
            allActivities.push({
              id: `bookmark-${bookmark.id}`,
              type: 'bookmark',
              recordId: bookmark.page_id,
              recordName: bookmark.page_title || 'Bookmarked Record',
              collection: bookmark.collection_name || 'Collection',
              collectionSlug: bookmark.collection_slug || '',
              timestamp: bookmark.created_at
            });
          }
        }
      } catch (err) {
        console.debug('Error fetching bookmarks:', err);
      }

      try {
        // Fetch recent views (if table exists)
        const { data: views } = await supabase
          .from('user_activity')
          .select('*')
          .eq('user_id', user.id)
          .eq('activity_type', 'view')
          .order('created_at', { ascending: false })
          .limit(5);

        if (views) {
          for (const view of views) {
            allActivities.push({
              id: `view-${view.id}`,
              type: 'view',
              recordId: view.record_id,
              recordName: view.record_name || 'Viewed Record',
              collection: view.collection_name || 'Collection',
              collectionSlug: view.collection_slug || '',
              timestamp: view.created_at
            });
          }
        }
      } catch {
        // Table may not exist, continue without views
      }

      // Sort by timestamp and take most recent
      allActivities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities.slice(0, 10));
      setLoading(false);
    };

    fetchRecentActivity();
  }, [user]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-brand-green" />
          <h3 className="font-semibold text-brand-brown">Recent Activity</h3>
        </div>
        <p className="text-sm text-gray-500 text-center py-4">
          Sign in to see your recent activity
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-brand-green" />
          <h3 className="font-semibold text-brand-brown">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-brand-green" />
          <h3 className="font-semibold text-brand-brown">Recent Activity</h3>
        </div>
        <p className="text-sm text-gray-500 text-center py-4">
          No recent activity yet. Start exploring records!
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-brand-green" />
        <h3 className="font-semibold text-brand-brown">Recent Activity</h3>
      </div>
      <div className="space-y-2">
        {activities.map((activity) => (
          <Link
            key={activity.id}
            href={activity.collectionSlug ? `/collections/${activity.collectionSlug}?record=${activity.recordId}` : '#'}
            className="block p-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                {activity.type === 'bookmark' ? (
                  <Bookmark className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Eye className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-green">
                  {activity.recordName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {activity.collection}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(activity.timestamp)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-green flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

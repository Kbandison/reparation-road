"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Plus,
  Pin,
  Lock,
  MessageSquare,
  Eye,
  Clock,
  TrendingUp
} from 'lucide-react';

interface ForumThread {
  id: string;
  title: string;
  slug: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
  };
  post_count?: number;
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
}

const CategoryPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const categorySlug = params.category as string;

  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views'>('latest');

  useEffect(() => {
    if (categorySlug) {
      fetchCategory();
      fetchThreads();
    }
  }, [categorySlug, sortBy]);

  const fetchCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (error) throw error;
      setCategory(data);
    } catch (error) {
      console.error('Error fetching category:', error);
      router.push('/forum');
    }
  };

  const fetchThreads = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('forum_threads')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            email
          )
        `);

      // Filter by category
      const { data: cat } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (!cat) return;

      query = query.eq('category_id', cat.id);

      // Sort
      if (sortBy === 'latest') {
        query = query.order('is_pinned', { ascending: false })
          .order('updated_at', { ascending: false });
      } else if (sortBy === 'views') {
        query = query.order('is_pinned', { ascending: false })
          .order('view_count', { ascending: false });
      }

      const { data: threadsData, error } = await query;

      if (error) throw error;

      // Get post counts for each thread
      const threadsWithCounts = await Promise.all(
        (threadsData || []).map(async (thread) => {
          const { count } = await supabase
            .from('forum_posts')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id);

          return {
            ...thread,
            user: Array.isArray(thread.profiles) ? thread.profiles[0] : thread.profiles,
            post_count: count || 0
          };
        })
      );

      // Sort by popularity if needed
      if (sortBy === 'popular') {
        threadsWithCounts.sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          return (b.post_count || 0) - (a.post_count || 0);
        });
      }

      setThreads(threadsWithCounts);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !category) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown">Loading threads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.push('/forum')}
            variant="outline"
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forum
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-brand-brown mb-2">{category.name}</h1>
              <p className="text-gray-600">{category.description}</p>
            </div>
            {user && (
              <Button
                onClick={() => router.push(`/forum/new?category=${categorySlug}`)}
                className="bg-brand-green hover:bg-brand-darkgreen flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Thread
              </Button>
            )}
          </div>
        </div>

        {/* Sort Options */}
        <div className="mb-6 flex gap-2">
          <Button
            onClick={() => setSortBy('latest')}
            variant={sortBy === 'latest' ? 'default' : 'outline'}
            size="sm"
          >
            <Clock className="w-4 h-4 mr-2" />
            Latest
          </Button>
          <Button
            onClick={() => setSortBy('popular')}
            variant={sortBy === 'popular' ? 'default' : 'outline'}
            size="sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Popular
          </Button>
          <Button
            onClick={() => setSortBy('views')}
            variant={sortBy === 'views' ? 'default' : 'outline'}
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Most Viewed
          </Button>
        </div>

        {/* Threads List */}
        <div className="space-y-3">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/forum/${categorySlug}/${thread.slug}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {thread.is_pinned && (
                      <Pin className="w-4 h-4 text-brand-green" />
                    )}
                    {thread.is_locked && (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                    <h3 className="text-lg font-semibold text-brand-brown truncate">
                      {thread.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {thread.content.substring(0, 200)}...
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>
                      by {thread.user?.first_name || thread.user?.email?.split('@')[0] || 'User'}
                    </span>
                    <span>•</span>
                    <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 text-sm text-gray-600 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{thread.post_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{thread.view_count}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {threads.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No threads in this category yet</p>
              {user && (
                <Button
                  onClick={() => router.push(`/forum/new?category=${categorySlug}`)}
                  className="bg-brand-green hover:bg-brand-darkgreen"
                >
                  Start the First Discussion
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  HelpCircle,
  Star,
  FileText,
  MessageCircle,
  Plus,
  Search,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  sort_order: number;
  thread_count?: number;
  post_count?: number;
  latest_thread?: {
    title: string;
    slug: string;
    updated_at: string;
    user: {
      first_name?: string;
      last_name?: string;
      email: string;
    };
  };
}

const iconMap: { [key: string]: React.ReactNode } = {
  'message-square': <MessageSquare className="w-8 h-8" />,
  'help-circle': <HelpCircle className="w-8 h-8" />,
  'star': <Star className="w-8 h-8" />,
  'file-text': <FileText className="w-8 h-8" />,
  'message-circle': <MessageCircle className="w-8 h-8" />,
};

const ForumHomePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalThreads: 0,
    totalPosts: 0,
    totalMembers: 0,
  });

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('forum_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch thread and post counts for each category
      const categoriesWithStats = await Promise.all(
        (categoriesData || []).map(async (category) => {
          // Get thread count
          const { count: threadCount } = await supabase
            .from('forum_threads')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);

          // Get post count
          const { count: postCount } = await supabase
            .from('forum_posts')
            .select('*', { count: 'exact', head: true })
            .in('thread_id',
              (await supabase
                .from('forum_threads')
                .select('id')
                .eq('category_id', category.id)
              ).data?.map(t => t.id) || []
            );

          // Get latest thread
          const { data: latestThread } = await supabase
            .from('forum_threads')
            .select(`
              title,
              slug,
              updated_at,
              profiles:user_id (
                first_name,
                last_name,
                email
              )
            `)
            .eq('category_id', category.id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...category,
            thread_count: threadCount || 0,
            post_count: postCount || 0,
            latest_thread: latestThread ? {
              title: latestThread.title,
              slug: latestThread.slug,
              updated_at: latestThread.updated_at,
              user: Array.isArray(latestThread.profiles)
                ? latestThread.profiles[0]
                : latestThread.profiles
            } : undefined
          };
        })
      );

      setCategories(categoriesWithStats);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: threadsCount } = await supabase
        .from('forum_threads')
        .select('*', { count: 'exact', head: true });

      const { count: postsCount } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true });

      const { count: membersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalThreads: threadsCount || 0,
        totalPosts: postsCount || 0,
        totalMembers: membersCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/forum/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown">Loading forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-brand-brown mb-2">Community Forum</h1>
              <p className="text-gray-600">
                Connect with fellow researchers, share discoveries, and get help with your genealogy journey
              </p>
            </div>
            {user && (
              <Button
                onClick={() => router.push('/forum/new')}
                className="bg-brand-green hover:bg-brand-darkgreen flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Thread
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search forum threads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Threads</p>
                <p className="text-3xl font-bold text-brand-brown">{stats.totalThreads}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-brand-green" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Posts</p>
                <p className="text-3xl font-bold text-brand-brown">{stats.totalPosts}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-brand-green" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Members</p>
                <p className="text-3xl font-bold text-brand-brown">{stats.totalMembers}</p>
              </div>
              <Users className="w-10 h-10 text-brand-green" />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-brand-brown">Categories</h2>

          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/forum/${category.slug}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="bg-brand-green text-white p-3 rounded-lg flex-shrink-0">
                  {iconMap[category.icon] || <MessageSquare className="w-8 h-8" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-brand-brown mb-1">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{category.description}</p>

                  {category.latest_thread && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Latest: <span className="font-medium">{category.latest_thread.title}</span></span>
                      <span>•</span>
                      <span>
                        by {category.latest_thread.user?.first_name || category.latest_thread.user?.email?.split('@')[0] || 'User'}
                      </span>
                      <span>•</span>
                      <span>{new Date(category.latest_thread.updated_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-col items-end gap-1 text-sm flex-shrink-0">
                  <div className="flex items-center gap-1 text-gray-600">
                    <MessageSquare className="w-4 h-4" />
                    <span>{category.thread_count} threads</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{category.post_count} posts</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {categories.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No categories available yet</p>
            </div>
          )}
        </div>

        {/* Call to Action for Non-logged Users */}
        {!user && (
          <div className="mt-8 bg-brand-green text-white rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Join the Conversation</h3>
            <p className="mb-4">
              Sign in to create threads, post replies, and connect with the community
            </p>
            <Button
              onClick={() => router.push('/')}
              className="bg-white text-brand-green hover:bg-gray-100"
            >
              Sign In to Participate
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumHomePage;

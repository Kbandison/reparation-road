"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Pin,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  sort_order: number;
  thread_count?: number;
}

interface RecentThread {
  id: string;
  title: string;
  slug: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  category: {
    name: string;
    slug: string;
  };
  user: {
    email: string;
  };
}

const AdminForumPage = () => {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [recentThreads, setRecentThreads] = useState<RecentThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    slug: '',
    icon: 'message-square'
  });

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchRecentThreads()]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Get thread counts
    const categoriesWithCounts = await Promise.all(
      (data || []).map(async (cat) => {
        const { count } = await supabase
          .from('forum_threads')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', cat.id);

        return { ...cat, thread_count: count || 0 };
      })
    );

    setCategories(categoriesWithCounts);
  };

  const fetchRecentThreads = async () => {
    const { data, error } = await supabase
      .from('forum_threads')
      .select('id, title, slug, is_pinned, is_locked, created_at, category_id, user_id')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Get category and user info for each thread
    const threadsWithDetails = await Promise.all(
      (data || []).map(async (thread) => {
        const { data: category } = await supabase
          .from('forum_categories')
          .select('name, slug')
          .eq('id', thread.category_id)
          .single();

        const { data: userProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', thread.user_id)
          .single();

        return {
          ...thread,
          category: category || { name: 'Unknown', slug: '' },
          user: userProfile || { email: 'Unknown' }
        };
      })
    );

    setRecentThreads(threadsWithDetails);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const maxOrder = categories.length > 0
        ? Math.max(...categories.map(c => c.sort_order))
        : 0;

      const { error } = await supabase
        .from('forum_categories')
        .insert({
          ...newCategory,
          sort_order: maxOrder + 1
        });

      if (error) throw error;

      setNewCategory({ name: '', description: '', slug: '', icon: 'message-square' });
      setShowAddCategory(false);
      await fetchCategories();
    } catch (error: any) {
      console.error('Error adding category:', error);
      alert(error.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Delete this category? All threads will be deleted.')) return;

    try {
      const { error } = await supabase
        .from('forum_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      await fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      alert(error.message || 'Failed to delete category');
    }
  };

  const handleMoveCategoryUp = async (category: ForumCategory) => {
    const index = categories.findIndex(c => c.id === category.id);
    if (index <= 0) return;

    const prevCategory = categories[index - 1];

    try {
      await Promise.all([
        supabase
          .from('forum_categories')
          .update({ sort_order: prevCategory.sort_order })
          .eq('id', category.id),
        supabase
          .from('forum_categories')
          .update({ sort_order: category.sort_order })
          .eq('id', prevCategory.id)
      ]);

      await fetchCategories();
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  const handleMoveCategoryDown = async (category: ForumCategory) => {
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= categories.length - 1) return;

    const nextCategory = categories[index + 1];

    try {
      await Promise.all([
        supabase
          .from('forum_categories')
          .update({ sort_order: nextCategory.sort_order })
          .eq('id', category.id),
        supabase
          .from('forum_categories')
          .update({ sort_order: category.sort_order })
          .eq('id', nextCategory.id)
      ]);

      await fetchCategories();
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  const handleTogglePin = async (threadId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('forum_threads')
        .update({ is_pinned: !currentState })
        .eq('id', threadId);

      if (error) throw error;
      await fetchRecentThreads();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleToggleLock = async (threadId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('forum_threads')
        .update({ is_locked: !currentState })
        .eq('id', threadId);

      if (error) throw error;
      await fetchRecentThreads();
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!confirm('Delete this thread? All posts will be deleted.')) return;

    try {
      const { error } = await supabase
        .from('forum_threads')
        .delete()
        .eq('id', threadId);

      if (error) throw error;
      await fetchRecentThreads();
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown">Loading...</p>
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
        <h1 className="text-4xl font-bold text-brand-brown mb-8 flex items-center gap-3">
          <MessageSquare className="w-10 h-10" />
          Forum Management
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Categories Management */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-brand-brown">Categories</h2>
              <Button
                onClick={() => setShowAddCategory(!showAddCategory)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </div>

            {showAddCategory && (
              <form onSubmit={handleAddCategory} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
                <Input
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="Slug (e.g., general-discussion)"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Create</Button>
                  <Button type="button" onClick={() => setShowAddCategory(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {categories.map((category, index) => (
                <div key={category.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-brand-brown">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.thread_count} threads</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleMoveCategoryUp(category)}
                        disabled={index === 0}
                        variant="ghost"
                        size="sm"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleMoveCategoryDown(category)}
                        disabled={index === categories.length - 1}
                        variant="ghost"
                        size="sm"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteCategory(category.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Threads */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-brand-brown mb-6">Recent Threads</h2>

            <div className="space-y-3">
              {recentThreads.map((thread) => (
                <div key={thread.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {thread.is_pinned && <Pin className="w-4 h-4 text-brand-green" />}
                        {thread.is_locked && <Lock className="w-4 h-4 text-gray-400" />}
                        <h3 className="font-semibold text-brand-brown truncate">{thread.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500">
                        {thread.category?.name} • by {thread.user?.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => handleTogglePin(thread.id, thread.is_pinned)}
                        variant="ghost"
                        size="sm"
                        title={thread.is_pinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin className={`w-4 h-4 ${thread.is_pinned ? 'text-brand-green' : ''}`} />
                      </Button>
                      <Button
                        onClick={() => handleToggleLock(thread.id, thread.is_locked)}
                        variant="ghost"
                        size="sm"
                        title={thread.is_locked ? 'Unlock' : 'Lock'}
                      >
                        {thread.is_locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={() => handleDeleteThread(thread.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminForumPage;

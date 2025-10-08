"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
}

const NewThreadPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/forum');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('forum_categories')
        .select('id, name, slug')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setCategories(data || []);

      // Pre-select category from query param
      const categorySlug = searchParams.get('category');
      if (categorySlug && data) {
        const category = data.find(c => c.slug === categorySlug);
        if (category) {
          setSelectedCategoryId(category.id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCategoryId || !title.trim() || !content.trim()) return;

    try {
      setSubmitting(true);

      const slug = generateSlug(title);

      // Check if slug already exists in this category
      const { data: existing } = await supabase
        .from('forum_threads')
        .select('id')
        .eq('category_id', selectedCategoryId)
        .eq('slug', slug)
        .single();

      const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

      const { data: threadData, error } = await supabase
        .from('forum_threads')
        .insert({
          category_id: selectedCategoryId,
          user_id: user.id,
          title: title.trim(),
          slug: finalSlug,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Get category slug for redirect
      const category = categories.find(c => c.id === selectedCategoryId);
      if (category && threadData) {
        router.push(`/forum/${category.slug}/${threadData.slug}`);
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create thread';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-beige py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <Button
          onClick={() => router.push('/forum')}
          variant="outline"
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forum
        </Button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-brand-brown mb-6">Start a New Discussion</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-brand-brown mb-2">
                Category *
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Thread Title */}
            <div>
              <label className="block text-sm font-medium text-brand-brown mb-2">
                Title *
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your discussion about?"
                maxLength={255}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {title.length}/255 characters
              </p>
            </div>

            {/* Thread Content */}
            <div>
              <label className="block text-sm font-medium text-brand-brown mb-2">
                Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, ask questions, or start a discussion..."
                rows={12}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: Be clear and descriptive to get the best responses
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={submitting || !selectedCategoryId || !title.trim() || !content.trim()}
                className="flex-1 bg-brand-green hover:bg-brand-darkgreen flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Creating Thread...' : 'Create Thread'}
              </Button>
              <Button
                type="button"
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>

          {/* Guidelines */}
          <div className="mt-8 p-4 bg-brand-tan rounded-lg">
            <h3 className="font-semibold text-brand-brown mb-2">Community Guidelines</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Be respectful and courteous to all members</li>
              <li>• Stay on topic and choose the appropriate category</li>
              <li>• Search before posting to avoid duplicates</li>
              <li>• Use clear, descriptive titles</li>
              <li>• Share your research and sources when possible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewThreadPage;

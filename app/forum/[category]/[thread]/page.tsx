"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Pin,
  Lock,
  Eye,
  MessageSquare,
  Heart,
  Lightbulb,
  TrendingUp,
  Edit,
  Trash2,
  Send
} from 'lucide-react';

interface ForumThread {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  created_at: string;
  user: {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
    role?: string;
  };
}

interface ForumPost {
  id: string;
  content: string;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  user: {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
    role?: string;
  };
  reactions: {
    like: number;
    helpful: number;
    insightful: number;
  };
  userReaction?: string | null;
}

const ThreadPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, profile } = useAuth();
  const categorySlug = params.category as string;
  const threadSlug = params.thread as string;

  const [thread, setThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (categorySlug && threadSlug) {
      fetchThread();
      fetchPosts();
      incrementViewCount();
    }
  }, [categorySlug, threadSlug]);

  const fetchThread = async () => {
    try {
      setLoading(true);

      // Get category
      const { data: category } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (!category) {
        router.push('/forum');
        return;
      }

      // Get thread
      const { data: threadData, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            email,
            role
          )
        `)
        .eq('category_id', category.id)
        .eq('slug', threadSlug)
        .single();

      if (error) throw error;

      setThread({
        ...threadData,
        user: Array.isArray(threadData.profiles) ? threadData.profiles[0] : threadData.profiles
      });
    } catch (error) {
      console.error('Error fetching thread:', error);
      router.push('/forum');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      // Get category and thread
      const { data: category } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (!category) return;

      const { data: threadData } = await supabase
        .from('forum_threads')
        .select('id')
        .eq('category_id', category.id)
        .eq('slug', threadSlug)
        .single();

      if (!threadData) return;

      // Get posts
      const { data: postsData, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            email,
            role
          )
        `)
        .eq('thread_id', threadData.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get reactions for each post
      const postsWithReactions = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: reactions } = await supabase
            .from('forum_reactions')
            .select('reaction_type, user_id')
            .eq('post_id', post.id);

          const reactionCounts = {
            like: reactions?.filter(r => r.reaction_type === 'like').length || 0,
            helpful: reactions?.filter(r => r.reaction_type === 'helpful').length || 0,
            insightful: reactions?.filter(r => r.reaction_type === 'insightful').length || 0,
          };

          const userReaction = user
            ? reactions?.find(r => r.user_id === user.id)?.reaction_type
            : null;

          return {
            ...post,
            user: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
            reactions: reactionCounts,
            userReaction
          };
        })
      );

      setPosts(postsWithReactions);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const incrementViewCount = async () => {
    try {
      const { data: category } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (!category) return;

      const { data: threadData } = await supabase
        .from('forum_threads')
        .select('id, view_count')
        .eq('category_id', category.id)
        .eq('slug', threadSlug)
        .single();

      if (!threadData) return;

      await supabase
        .from('forum_threads')
        .update({ view_count: (threadData.view_count || 0) + 1 })
        .eq('id', threadData.id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !thread || !replyContent.trim()) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: thread.id,
          user_id: user.id,
          content: replyContent.trim(),
        });

      if (error) throw error;

      setReplyContent('');
      await fetchPosts();
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReaction = async (postId: string, reactionType: 'like' | 'helpful' | 'insightful') => {
    if (!user) {
      alert('Please sign in to react to posts');
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // If user already has this reaction, remove it
      if (post.userReaction === reactionType) {
        await supabase
          .from('forum_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);
      } else {
        // Remove any existing reaction first
        if (post.userReaction) {
          await supabase
            .from('forum_reactions')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
        }

        // Add new reaction
        await supabase
          .from('forum_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType,
          });
      }

      await fetchPosts();
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  if (loading || !thread) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown">Loading thread...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button
          onClick={() => router.push(`/forum/${categorySlug}`)}
          variant="outline"
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Category
        </Button>

        {/* Thread Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {thread.is_pinned && <Pin className="w-5 h-5 text-brand-green" />}
                {thread.is_locked && <Lock className="w-5 h-5 text-gray-400" />}
                <h1 className="text-3xl font-bold text-brand-brown">{thread.title}</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  by {thread.user?.first_name || thread.user?.email?.split('@')[0] || 'User'}
                  {thread.user?.role === 'admin' && (
                    <span className="ml-2 px-2 py-0.5 bg-brand-green text-white text-xs rounded">Admin</span>
                  )}
                </span>
                <span>•</span>
                <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{thread.view_count} views</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{posts.length} replies</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thread Content */}
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{thread.content}</p>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4 mb-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-4">
                {/* User Avatar Placeholder */}
                <div className="w-12 h-12 rounded-full bg-brand-green text-white flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold">
                    {(post.user?.first_name?.[0] || post.user?.email?.[0] || 'U').toUpperCase()}
                  </span>
                </div>

                <div className="flex-1">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-brand-brown">
                        {post.user?.first_name || post.user?.email?.split('@')[0] || 'User'}
                      </span>
                      {post.user?.role === 'admin' && (
                        <span className="ml-2 px-2 py-0.5 bg-brand-green text-white text-xs rounded">Admin</span>
                      )}
                      <span className="ml-2 text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      {post.is_edited && (
                        <span className="ml-2 text-xs text-gray-400">(edited)</span>
                      )}
                    </div>

                    {/* Delete Button */}
                    {(user?.id === post.user?.id || profile?.role === 'admin') && (
                      <Button
                        onClick={() => handleDeletePost(post.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Post Content */}
                  <p className="whitespace-pre-wrap mb-3">{post.content}</p>

                  {/* Reactions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReaction(post.id, 'like')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        post.userReaction === 'like'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      <span>{post.reactions.like}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(post.id, 'helpful')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        post.userReaction === 'helpful'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>{post.reactions.helpful}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(post.id, 'insightful')}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        post.userReaction === 'insightful'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>{post.reactions.insightful}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        {user && !thread.is_locked ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-brand-brown mb-4">Post a Reply</h3>
            <form onSubmit={handleReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green mb-4"
                required
              />
              <Button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                className="bg-brand-green hover:bg-brand-darkgreen flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Posting...' : 'Post Reply'}
              </Button>
            </form>
          </div>
        ) : thread.is_locked ? (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">This thread is locked. No new replies can be posted.</p>
          </div>
        ) : (
          <div className="bg-brand-green text-white rounded-lg p-6 text-center">
            <p className="mb-4">Sign in to join the conversation</p>
            <Button
              onClick={() => router.push('/')}
              className="bg-white text-brand-green hover:bg-gray-100"
            >
              Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadPage;

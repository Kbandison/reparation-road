"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface Bookmark {
  id: string;
  user_id: string;
  page_id: string;
  created_at: string;
}

interface BookmarkContextType {
  bookmarks: Set<string>;
  isBookmarked: (pageId: string) => boolean;
  toggleBookmark: (pageId: string) => Promise<void>;
  loading: boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setBookmarks(new Set());
      setLoading(false);
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookmarks')
        .select('page_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const bookmarkSet = new Set(data?.map((b) => b.page_id) || []);
      setBookmarks(bookmarkSet);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const isBookmarked = (pageId: string): boolean => {
    return bookmarks.has(pageId);
  };

  const toggleBookmark = async (pageId: string) => {
    if (!user) {
      alert('Please sign in to bookmark pages');
      return;
    }

    try {
      if (bookmarks.has(pageId)) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('page_id', pageId);

        if (error) throw error;

        setBookmarks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(pageId);
          return newSet;
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            page_id: pageId,
          });

        if (error) throw error;

        setBookmarks((prev) => new Set(prev).add(pageId));
      }
    } catch (error: any) {
      console.error('Error toggling bookmark:', error);
      alert(error.message || 'Failed to update bookmark');
    }
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, isBookmarked, toggleBookmark, loading }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface Bookmark {
  id: string;
  user_id: string;
  page_id: string;
  collection_name?: string;
  collection_slug?: string;
  record_title?: string;
  created_at: string;
}

interface BookmarkMeta {
  collectionName?: string;
  collectionSlug?: string;
  recordTitle?: string;
}

interface BookmarkContextType {
  bookmarks: Set<string>;
  bookmarkDetails: Map<string, Bookmark>;
  isBookmarked: (pageId: string) => boolean;
  toggleBookmark: (pageId: string, meta?: BookmarkMeta) => Promise<void>;
  loading: boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [bookmarkDetails, setBookmarkDetails] = useState<Map<string, Bookmark>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookmarkSet = new Set(data?.map((b) => b.page_id) || []);
      const detailsMap = new Map<string, Bookmark>();
      data?.forEach((b) => detailsMap.set(b.page_id, b));

      setBookmarks(bookmarkSet);
      setBookmarkDetails(detailsMap);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setBookmarks(new Set());
      setBookmarkDetails(new Map());
      setLoading(false);
    }
  }, [user, fetchBookmarks]);

  const isBookmarked = (pageId: string): boolean => {
    return bookmarks.has(pageId);
  };

  const toggleBookmark = async (pageId: string, meta?: BookmarkMeta) => {
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

        if (error) {
          console.error('Delete bookmark error:', error);
          throw error;
        }

        setBookmarks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(pageId);
          return newSet;
        });
        setBookmarkDetails((prev) => {
          const newMap = new Map(prev);
          newMap.delete(pageId);
          return newMap;
        });
      } else {
        // Add bookmark
        const bookmarkData = {
          user_id: user.id,
          page_id: pageId,
          collection_name: meta?.collectionName || null,
          collection_slug: meta?.collectionSlug || null,
          record_title: meta?.recordTitle || null,
        };

        const { data, error } = await supabase
          .from('bookmarks')
          .insert(bookmarkData)
          .select()
          .single();

        if (error) {
          console.error('Insert bookmark error:', error);
          throw error;
        }

        setBookmarks((prev) => new Set(prev).add(pageId));
        if (data) {
          setBookmarkDetails((prev) => new Map(prev).set(pageId, data));
        }
      }
    } catch (error: unknown) {
      console.error('Error toggling bookmark:', error);
      const err = error as { code?: string; message?: string; hint?: string; details?: string };
      const errorMsg = err.code
        ? `Error ${err.code}: ${err.message}\n\n${err.hint || err.details || ''}`
        : (err.message || 'Failed to update bookmark');
      alert(errorMsg);
    }
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, bookmarkDetails, isBookmarked, toggleBookmark, loading }}>
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

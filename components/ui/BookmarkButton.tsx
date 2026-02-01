"use client";

import React from 'react';
import { Heart } from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { useAuth } from '@/contexts/AuthContext';

interface BookmarkButtonProps {
  pageId: string;
  collectionName?: string;
  collectionSlug?: string;
  recordTitle?: string;
  className?: string;
  size?: number;
  showLabel?: boolean;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  pageId,
  collectionName,
  collectionSlug,
  recordTitle,
  className = '',
  size = 20,
  showLabel = false,
}) => {
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark, loading } = useBookmarks();
  const bookmarked = isBookmarked(pageId);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking bookmark
    await toggleBookmark(pageId, { collectionName, collectionSlug, recordTitle });
  };

  if (!user) {
    return null; // Or show a disabled state
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`group transition-all ${className}`}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark this page'}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this page'}
    >
      <div className="flex items-center gap-1">
        <Heart
          size={size}
          className={`transition-all ${
            bookmarked
              ? 'fill-red-500 stroke-red-500'
              : 'fill-none stroke-gray-400 group-hover:stroke-red-400'
          } ${loading ? 'opacity-50' : 'group-hover:scale-110'}`}
        />
        {showLabel && (
          <span className="text-xs text-gray-600 group-hover:text-red-500">
            {bookmarked ? 'Saved' : 'Save'}
          </span>
        )}
      </div>
    </button>
  );
};

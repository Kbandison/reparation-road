"use client";

import React, { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookmarkButton } from '@/components/ui/BookmarkButton';
import { Heart, Search, Loader2, FileText } from 'lucide-react';

interface ArchivePage {
  id: string;
  collection_slug: string;
  book_no: number;
  page_no: number;
  slug: string;
  image_path: string;
  title: string | null;
  year: number | null;
  location: string | null;
  tags: string[];
  ocr_text: string;
}

interface Bookmark {
  id: string;
  page_id: string;
  collection_name: string | null;
  collection_slug: string | null;
  record_title: string | null;
  created_at: string;
  archive_pages?: ArchivePage | null;
}

const getImageUrl = (imagePath: string): string => {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `/images/${imagePath}`;
};

// Returns display info for a bookmark regardless of whether it came from
// archive_pages or a collection-specific table.
const getDisplayInfo = (bookmark: Bookmark) => {
  // New-style bookmark with stored metadata (any collection-specific table)
  if (bookmark.collection_slug && bookmark.record_title) {
    return {
      title: bookmark.record_title,
      subtitle: bookmark.collection_name || bookmark.collection_slug,
      url: `/collections/${bookmark.collection_slug}?record=${bookmark.page_id}`,
      imagePath: null,
      tags: [] as string[],
      extra: null as string | null,
    };
  }

  // Legacy archive_pages bookmark
  const page = bookmark.archive_pages;
  if (page && page.collection_slug) {
    const slug = page.collection_slug.replace('inspection-roll-of-negroes', 'inspection-roll');
    return {
      title: page.title || `Book ${page.book_no}, Page ${page.page_no}`,
      subtitle: page.collection_slug,
      url: `/collections/${slug}`,
      imagePath: page.image_path || null,
      tags: page.tags || [],
      extra: page.year ? `Year: ${page.year}` : (page.location || null),
    };
  }

  // Fallback (shouldn't happen after migration)
  return {
    title: 'Unknown Record',
    subtitle: '',
    url: '/collections',
    imagePath: null,
    tags: [] as string[],
    extra: null as string | null,
  };
};

const BookmarksPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchBookmarks = React.useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id, page_id, collection_name, collection_slug, record_title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For legacy bookmarks without metadata, try archive_pages as fallback
      const bookmarksWithData = await Promise.all(
        (data || []).map(async (bookmark) => {
          if (bookmark.collection_slug && bookmark.record_title) {
            // New-style: metadata already stored, no extra fetch needed
            return { ...bookmark, archive_pages: null };
          }
          // Legacy: try to pull display data from archive_pages
          const { data: archivePage } = await supabase
            .from('archive_pages')
            .select('id, collection_slug, book_no, page_no, slug, image_path, title, year, location, tags, ocr_text')
            .eq('id', bookmark.page_id)
            .single();
          return { ...bookmark, archive_pages: archivePage || null };
        })
      );

      setBookmarks(bookmarksWithData);
      setFilteredBookmarks(bookmarksWithData);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user, fetchBookmarks]);

  useEffect(() => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const filtered = bookmarks.filter((bookmark) => {
        const { title, subtitle } = getDisplayInfo(bookmark);
        if (title.toLowerCase().includes(lower)) return true;
        if (subtitle.toLowerCase().includes(lower)) return true;
        // Also search archive_pages fields for legacy bookmarks
        const page = bookmark.archive_pages;
        if (page) {
          return (
            page.ocr_text?.toLowerCase().includes(lower) ||
            page.location?.toLowerCase().includes(lower) ||
            page.tags?.some((tag) => tag.toLowerCase().includes(lower))
          );
        }
        return false;
      });
      setFilteredBookmarks(filtered);
    } else {
      setFilteredBookmarks(bookmarks);
    }
  }, [searchTerm, bookmarks]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-brand-green animate-spin mx-auto mb-4" />
          <p className="text-brand-brown">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-beige py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-brand-green fill-brand-green" />
            <h1 className="text-4xl font-bold text-brand-brown">My Bookmarks</h1>
          </div>
          <p className="text-gray-600">
            Your saved historical documents and archive pages
          </p>
        </div>

        {/* Search */}
        {bookmarks.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search your bookmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Showing {filteredBookmarks.length} of {bookmarks.length} bookmarked {bookmarks.length === 1 ? 'page' : 'pages'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              No Bookmarks Yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start exploring our collections and bookmark pages to save them here.
            </p>
            <Button
              onClick={() => router.push('/search')}
              className="bg-brand-green hover:bg-brand-darkgreen"
            >
              Explore Collections
            </Button>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              No Results Found
            </h2>
            <p className="text-gray-500">
              No bookmarks match your search criteria.
            </p>
          </div>
        ) : (
          /* Bookmarks Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBookmarks.map((bookmark) => {
              const { title, subtitle, url, imagePath, tags, extra } = getDisplayInfo(bookmark);
              return (
                <div
                  key={bookmark.id}
                  onClick={() => router.push(url)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border relative"
                >
                  {/* Bookmark Button */}
                  <div className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md">
                    <BookmarkButton pageId={bookmark.page_id} size={18} />
                  </div>

                  {imagePath ? (
                    <div className="h-48 overflow-hidden rounded-t-lg relative">
                      <Image
                        src={getImageUrl(imagePath)}
                        alt={title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-32 overflow-hidden rounded-t-lg bg-gradient-to-br from-brand-tan to-brand-beige flex items-center justify-center">
                      <FileText className="w-12 h-12 text-brand-brown/40" />
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold text-brand-brown mb-1 line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-xs text-brand-green font-medium mb-2 line-clamp-1">
                      {subtitle}
                    </p>
                    <div className="text-sm text-gray-600 space-y-1">
                      {extra && <p>{extra}</p>}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-brand-tan text-brand-brown text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                              +{tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      Bookmarked {new Date(bookmark.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;

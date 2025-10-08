"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookmarkButton } from '@/components/ui/BookmarkButton';
import { Heart, Search, Loader2 } from 'lucide-react';

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
  created_at: string;
  archive_pages: ArchivePage;
}

const getImageUrl = (imagePath: string): string => {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `/images/${imagePath}`;
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

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = bookmarks.filter((bookmark) => {
        const page = bookmark.archive_pages;
        return (
          page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.ocr_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
      setFilteredBookmarks(filtered);
    } else {
      setFilteredBookmarks(bookmarks);
    }
  }, [searchTerm, bookmarks]);

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          page_id,
          created_at,
          archive_pages (
            id,
            collection_slug,
            book_no,
            page_no,
            slug,
            image_path,
            title,
            year,
            location,
            tags,
            ocr_text
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookmarks(data as Bookmark[] || []);
      setFilteredBookmarks(data as Bookmark[] || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = (page: ArchivePage) => {
    // Navigate to the collection page with the specific page highlighted
    router.push(`/collections/${page.collection_slug.replace('inspection-roll-of-negroes', 'inspection-roll')}`);
  };

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
              const page = bookmark.archive_pages;
              return (
                <div
                  key={bookmark.id}
                  onClick={() => handlePageClick(page)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border relative"
                >
                  {/* Bookmark Button */}
                  <div className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md">
                    <BookmarkButton pageId={page.id} size={18} />
                  </div>

                  {page.image_path && (
                    <div className="h-48 overflow-hidden rounded-t-lg relative">
                      <Image
                        src={getImageUrl(page.image_path)}
                        alt={`Book ${page.book_no}, Page ${page.page_no}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold text-brand-brown mb-2">
                      {page.title || `Book ${page.book_no}, Page ${page.page_no}`}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Book {page.book_no}, Page {page.page_no}</p>
                      {page.year && <p>Year: {page.year}</p>}
                      {page.location && <p>Location: {page.location}</p>}
                      {page.tags && page.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {page.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-brand-tan text-brand-brown text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {page.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                              +{page.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {page.ocr_text && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                        {page.ocr_text.substring(0, 100)}...
                      </p>
                    )}
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

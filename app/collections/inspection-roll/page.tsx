"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Head from "next/head";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, X, ZoomIn, ScrollText, Loader2 } from "lucide-react";
import { CollectionTableView, ImageThumbnail } from "@/components/CollectionTableView";
import { StructuredData } from "@/components/StructuredData";
import { generateStructuredData } from "@/lib/metadata";

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
  ocr_text?: string;
  ocr_json?: object | null;
}

interface PageModalProps {
  page: ArchivePage | null;
  onClose: () => void;
  allPages: ArchivePage[];
  onNavigate: (page: ArchivePage) => void;
}

const PageModal = React.memo<PageModalProps>(function PageModal({ page, onClose, allPages, onNavigate }) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isImageZoomed, setIsImageZoomed] = React.useState(false);

  React.useEffect(() => {
    setImageLoaded(false);
  }, [page]);

  // Get current page index and navigation helpers
  const currentIndex = allPages.findIndex(p => p.id === page?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allPages.length - 1;

  const handlePrevPage = React.useCallback(() => {
    if (hasPrev) {
      onNavigate(allPages[currentIndex - 1]);
    }
  }, [hasPrev, currentIndex, allPages, onNavigate]);

  const handleNextPage = React.useCallback(() => {
    if (hasNext) {
      onNavigate(allPages[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, allPages, onNavigate]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'Escape') {
        if (isImageZoomed) {
          setIsImageZoomed(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevPage, handleNextPage, isImageZoomed, onClose]);

  if (!page) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePrevPage}
              disabled={!hasPrev}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            <div>
              <h3 className="text-xl font-bold text-brand-brown">
                Book {page.book_no}, Page {page.page_no}
              </h3>
              <p className="text-sm text-gray-500">Page {currentIndex + 1} of {allPages.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleNextPage}
              disabled={!hasNext}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
            <BookmarkButton pageId={page.id} size={24} showLabel={true} />
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {page.image_path && (
              <div className="space-y-2">
                <h4 className="font-semibold text-brand-brown flex items-center gap-2">
                  Document Image
                  <span className="text-xs text-gray-500 font-normal">(Click to expand)</span>
                </h4>
                <div
                  className="border rounded-lg overflow-hidden relative h-96 bg-gray-100 cursor-zoom-in group"
                  onClick={() => setIsImageZoomed(true)}
                >
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
                    </div>
                  )}
                  <Image
                    src={page.image_path}
                    alt={`Book ${page.book_no}, Page ${page.page_no}`}
                    fill
                    className={`object-contain transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    onLoad={() => setImageLoaded(true)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3 shadow-lg">
                      <ZoomIn className="w-6 h-6 text-brand-green" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-brand-brown mb-2">Document Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Book Number:</span> {page.book_no}</p>
                  <p><span className="font-medium">Page Number:</span> {page.page_no}</p>
                  {page.year && <p><span className="font-medium">Year:</span> {page.year}</p>}
                  {page.location && <p><span className="font-medium">Location:</span> {page.location}</p>}
                  {page.tags && page.tags.length > 0 && (
                    <p><span className="font-medium">Tags:</span> {page.tags.join(", ")}</p>
                  )}
                </div>
              </div>

              {page.ocr_text ? (
                <div>
                  <h4 className="font-semibold text-brand-brown mb-2">Transcription</h4>
                  <div className="bg-gray-50 p-3 rounded-md text-sm max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {page.ocr_text}
                    </pre>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-brand-brown mb-2">Transcription</h4>
                  <div className="bg-gray-50 p-3 rounded-md text-sm h-32 flex items-center justify-center">
                    <p className="text-gray-500">No transcription available for this page.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Zoom Overlay */}
      {isImageZoomed && page.image_path && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-[60] flex items-center justify-center p-4"
          onClick={() => setIsImageZoomed(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsImageZoomed(false)}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          {/* Navigation Buttons */}
          {hasPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevPage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <ChevronLeft className="w-8 h-8 text-gray-700" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextPage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <ChevronRight className="w-8 h-8 text-gray-700" />
            </button>
          )}

          {/* Page Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg z-10">
            <p className="text-sm font-medium text-gray-700">
              Page {currentIndex + 1} of {allPages.length}
            </p>
          </div>

          {/* Zoomed Image */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={page.image_path}
              alt={`Book ${page.book_no}, Page ${page.page_no}`}
              fill
              className="object-contain"
              priority
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
});

const InspectionRollPage = () => {
  const searchParams = useSearchParams();
  const [pages, setPages] = useState<ArchivePage[]>([]);
  const [filteredPages, setFilteredPages] = useState<ArchivePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPage, setSelectedPage] = useState<ArchivePage | null>(null);
  const [clickedPageId, setClickedPageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookFilter, setBookFilter] = useState<number | null>(null);
  const itemsPerPage = 20;

  // Initialize search from URL params
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  // Open modal for specific record from URL params
  useEffect(() => {
    const recordId = searchParams.get('record');
    if (recordId && pages.length > 0) {
      const record = pages.find(p => p.id === recordId);
      if (record) {
        setSelectedPage(record);
      }
    }
  }, [searchParams, pages]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const { data, error } = await supabase
          .from("archive_pages")
          .select("*")
          .eq("collection_slug", "inspection-roll-of-negroes")
          .order("book_no", { ascending: true })
          .order("page_no", { ascending: true });

        if (error) {
          console.error("Error fetching inspection roll pages:", error);
        } else if (data) {
          setPages(data);
          setFilteredPages(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  useEffect(() => {
    let filtered = pages;

    if (searchTerm) {
      filtered = filtered.filter(page =>
        page.book_no.toString().includes(searchTerm) ||
        page.page_no.toString().includes(searchTerm) ||
        page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.year?.toString().includes(searchTerm)
      );
    }

    if (bookFilter !== null) {
      filtered = filtered.filter(page => page.book_no === bookFilter);
    }

    setFilteredPages(filtered);
    setCurrentPage(1);
  }, [searchTerm, bookFilter, pages]);

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredPages.slice(startIndex, endIndex);

  const uniqueBooks = [...new Set(pages.map(p => p.book_no))].sort((a, b) => a - b);

  const handlePageClick = React.useCallback((page: ArchivePage) => {
    setClickedPageId(page.id);
    React.startTransition(() => {
      setTimeout(() => {
        setSelectedPage(page);
        setClickedPageId(null);
      }, 50);
    });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-xl">Loading Inspection Roll pages...</p>
        </div>
      </div>
    );
  }

  const collectionData = generateStructuredData('collection', {
    name: 'Inspection Roll of Negroes',
    description: 'Historical inspection roll documents from the colonial period',
    slug: 'inspection-roll',
    recordCount: pages.length
  });

  return (
    <div className="min-h-screen bg-brand-beige">
      {collectionData && <StructuredData data={collectionData} />}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollText className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Inspection Roll of Negroes
            </h1>
            <p className="text-lg text-white/90">
              Historical inspection roll documents from the colonial period.
              Click on any page to view the full image and transcriptions.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                type="search"
                placeholder="Search book, page, title, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book Number
              </label>
              <select
                value={bookFilter === null ? "" : bookFilter.toString()}
                onChange={(e) => setBookFilter(e.target.value === "" ? null : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                <option value="">All Books</option>
                {uniqueBooks.map(book => (
                  <option key={book} value={book}>Book {book}</option>
                ))}
              </select>
            </div>

            <div>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setBookFilter(null);
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Showing {filteredPages.length} of {pages.length} pages
          </p>
        </div>

        {filteredPages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No pages found matching your criteria.</p>
          </div>
        ) : (
          <>
            <CollectionTableView
              data={currentPageData}
              columns={[
                {
                  key: 'image_path',
                  label: 'Preview',
                  render: (value, record) => (
                    <ImageThumbnail
                      src={value}
                      alt={`Book ${record.book_no}, Page ${record.page_no}`}
                    />
                  )
                },
                {
                  key: 'book_no',
                  label: 'Book',
                  sortable: true
                },
                {
                  key: 'page_no',
                  label: 'Page',
                  sortable: true
                },
                {
                  key: 'title',
                  label: 'Title',
                  sortable: true
                },
                {
                  key: 'year',
                  label: 'Year',
                  sortable: true
                },
                {
                  key: 'location',
                  label: 'Location',
                  sortable: true
                }
              ]}
              onRecordClick={(page) => handlePageClick(page)}
              loading={clickedPageId !== null}
              emptyMessage="No pages found matching your criteria."
            />

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3
                      ? i + 1
                      : currentPage >= totalPages - 2
                      ? totalPages - 4 + i
                      : currentPage - 2 + i;

                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        className="w-10 h-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-gray-600 mt-4">
              Page {currentPage} of {totalPages}
              ({startIndex + 1}-{Math.min(endIndex, filteredPages.length)} of {filteredPages.length} pages)
            </div>
          </>
        )}

        <PageModal
          page={selectedPage}
          onClose={() => setSelectedPage(null)}
          allPages={filteredPages}
          onNavigate={(page) => setSelectedPage(page)}
        />
      </div>
    </div>
  );
};

const WrappedInspectionRollPage = () => {
  return (
    <ProtectedRoute requiresPaid={false}>
      <Suspense fallback={
        <div className="min-h-screen bg-brand-beige flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        </div>
      }>
        <InspectionRollPage />
      </Suspense>
    </ProtectedRoute>
  );
};

export default WrappedInspectionRollPage;

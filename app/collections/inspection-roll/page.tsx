
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChevronLeft, ChevronRight, X, ZoomIn, ScrollText } from "lucide-react";

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

interface ArchivePageModalProps {
  page: ArchivePage | null;
  onClose: () => void;
  allPages: ArchivePage[];
  onNavigate: (page: ArchivePage) => void;
}

const ArchivePageModal = React.memo<ArchivePageModalProps>(function ArchivePageModal({ page, onClose, allPages, onNavigate }) {
  const [fullPage, setFullPage] = React.useState<ArchivePage | null>(page);
  const [loading, setLoading] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isImageZoomed, setIsImageZoomed] = React.useState(false);

  React.useEffect(() => {
    // Immediately set the page data we have
    setFullPage(page);
    setImageLoaded(false);

    // Only fetch if we don't have OCR text
    if (!page || page.ocr_text) {
      return;
    }

    const fetchFullPage = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("archive_pages")
          .select("ocr_text, ocr_json")
          .eq("id", page.id)
          .single();

        if (error) {
          console.error("Error fetching full page:", error);
        } else {
          // Merge the OCR data with existing page data
          setFullPage(prev => prev ? { ...prev, ocr_text: data.ocr_text, ocr_json: data.ocr_json } : null);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFullPage();
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

  if (!page || !fullPage) return null;

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
                {fullPage.title || `Book ${fullPage.book_no}, Page ${fullPage.page_no}`}
              </h3>
              <p className="text-sm text-gray-500">Page {currentIndex + 1} of {allPages.length}</p>
              {fullPage.year && <p className="text-sm text-gray-600">Year: {fullPage.year}</p>}
              {fullPage.location && <p className="text-sm text-gray-600">Location: {fullPage.location}</p>}
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
            <BookmarkButton pageId={fullPage.id} size={24} showLabel={true} />
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fullPage.image_path && (
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
                    src={fullPage.image_path}
                    alt={`Page ${fullPage.page_no} from Book ${fullPage.book_no}`}
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
                  <p><span className="font-medium">Book Number:</span> {fullPage.book_no}</p>
                  <p><span className="font-medium">Page Number:</span> {fullPage.page_no}</p>
                  {fullPage.year && <p><span className="font-medium">Year:</span> {fullPage.year}</p>}
                  {fullPage.location && <p><span className="font-medium">Location:</span> {fullPage.location}</p>}
                  {fullPage.tags && fullPage.tags.length > 0 && (
                    <p><span className="font-medium">Tags:</span> {fullPage.tags.join(", ")}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-brand-brown mb-2">Transcribed Text</h4>
                {loading ? (
                  <div className="bg-gray-50 p-3 rounded-md text-sm h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mb-2"></div>
                      <p className="text-sm text-gray-600">Loading transcription...</p>
                    </div>
                  </div>
                ) : fullPage?.ocr_text ? (
                  <div className="bg-gray-50 p-3 rounded-md text-sm max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {fullPage.ocr_text}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-md text-sm h-32 flex items-center justify-center">
                    <p className="text-gray-500">No transcription available for this page.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Zoom Overlay */}
      {isImageZoomed && fullPage.image_path && (
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
              src={fullPage.image_path}
              alt={`Page ${fullPage.page_no} from Book ${fullPage.book_no}`}
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

// Image paths are already complete URLs stored in the database
// No helper function needed

const InspectionRollOfNegroesPage = () => {
  const [pages, setPages] = useState<ArchivePage[]>([]);
  const [filteredPages, setFilteredPages] = useState<ArchivePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteringInProgress, setFilteringInProgress] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPage, setSelectedPage] = useState<ArchivePage | null>(null);
  const [clickedPageId, setClickedPageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookFilter, setBookFilter] = useState<number | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      setError(null);

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout - please try again')), 30000)
      );

      try {
        let allPages: ArchivePage[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;
        let batchCount = 0;
        const maxBatches = 50; // Safety limit

        while (hasMore && batchCount < maxBatches) {
          const fetchPromise = supabase
            .from("archive_pages")
            .select("id, collection_slug, book_no, page_no, slug, image_path, title, year, location, tags")
            .eq("collection_slug", "inspection-roll-of-negroes")
            .order("book_no", { ascending: true })
            .order("page_no", { ascending: true })
            .range(from, from + batchSize - 1);

          const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

          if (error) {
            console.error("Error fetching archive pages:", error);
            throw new Error(error.message || "Failed to fetch documents");
          }

          if (data && data.length > 0) {
            allPages = [...allPages, ...data];
            from += batchSize;
            hasMore = data.length === batchSize;
            batchCount++;
          } else {
            hasMore = false;
          }
        }

        setPages(allPages);
        setFilteredPages(allPages);
      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message || "Failed to load documents. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  // Use useMemo to optimize filtering
  const computedFilteredPages = React.useMemo(() => {
    let filtered = pages;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(page =>
        page.title?.toLowerCase().includes(searchLower) ||
        page.location?.toLowerCase().includes(searchLower) ||
        page.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (bookFilter) {
      filtered = filtered.filter(page => page.book_no === bookFilter);
    }

    if (yearFilter) {
      filtered = filtered.filter(page => page.year === yearFilter);
    }

    return filtered;
  }, [searchTerm, bookFilter, yearFilter, pages]);

  // Apply filtered pages with a slight delay to show loading state
  useEffect(() => {
    if (searchTerm || bookFilter || yearFilter) {
      setFilteringInProgress(true);
      const timer = setTimeout(() => {
        setFilteredPages(computedFilteredPages);
        setCurrentPage(1);
        setFilteringInProgress(false);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setFilteredPages(computedFilteredPages);
      setCurrentPage(1);
    }
  }, [computedFilteredPages, searchTerm, bookFilter, yearFilter]);

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredPages.slice(startIndex, endIndex);

  const uniqueBooks = [...new Set(pages.map(p => p.book_no))].sort((a, b) => a - b);
  const uniqueYears = [...new Set(pages.map(p => p.year).filter(Boolean))].sort((a, b) => a! - b!);

  const handlePageClick = React.useCallback((page: ArchivePage) => {
    // Set clicked state immediately with high priority
    setClickedPageId(page.id);

    // Use startTransition to defer modal opening (low priority)
    // This allows the spinner to render first
    React.startTransition(() => {
      // Small delay to ensure spinner is visible
      setTimeout(() => {
        setSelectedPage(page);
        setClickedPageId(null);
      }, 50); // 50ms ensures smooth visual feedback
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige">
        <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <ScrollText className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Inspection Roll of Negroes
              </h1>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mb-4"></div>
            <p className="text-xl">Loading Inspection Roll documents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-beige">
        <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <ScrollText className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Inspection Roll of Negroes
              </h1>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Documents</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-brand-green hover:bg-brand-darkgreen"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollText className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Inspection Roll of Negroes
            </h1>
            <p className="text-lg text-white/90">
              Explore historical documents from the Inspection Roll of Negroes collection.
              These documents contain important historical records.
              Click on any document to view the full image and transcribed text.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <Input
              type="search"
              placeholder="Search titles, locations, tags..."
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
              value={bookFilter || ""}
              onChange={(e) => setBookFilter(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
            >
              <option value="">All Books</option>
              {uniqueBooks.map(book => (
                <option key={book} value={book}>Book {book}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              value={yearFilter || ""}
              onChange={(e) => setYearFilter(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year!}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <Button
              onClick={() => {
                setSearchTerm("");
                setBookFilter(null);
                setYearFilter(null);
              }}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {filteringInProgress && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-green"></div>
          )}
          <p className="text-sm text-gray-600">
            {filteringInProgress ? 'Filtering...' : `Showing ${filteredPages.length} of ${pages.length} documents`}
          </p>
        </div>
      </div>

      {filteredPages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No documents found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentPageData.map((page) => (
              <div
                key={page.id}
                onClick={() => handlePageClick(page)}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border relative ${
                  clickedPageId === page.id ? 'ring-2 ring-brand-green scale-95' : ''
                }`}
              >
                {/* Bookmark Button */}
                <div
                  className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <BookmarkButton pageId={page.id} size={18} />
                </div>

                {/* Loading Overlay when clicked */}
                {clickedPageId === page.id && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20 rounded-lg">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
                  </div>
                )}

                {page.image_path && (
                  <div className="h-48 overflow-hidden rounded-t-lg relative bg-gray-100">
                    <Image
                      src={page.image_path}
                      alt={`Book ${page.book_no}, Page ${page.page_no}`}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg=="
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
                </div>
              </div>
            ))}
          </div>

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
            ({startIndex + 1}-{Math.min(endIndex, filteredPages.length)} of {filteredPages.length} documents)
          </div>
        </>
      )}

      <ArchivePageModal
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
      <InspectionRollOfNegroesPage />
    </ProtectedRoute>
  );
};

export default WrappedInspectionRollPage;

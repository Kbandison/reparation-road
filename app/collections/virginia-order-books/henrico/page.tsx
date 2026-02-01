"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { RecordCitation } from "@/components/ui/RecordCitation";
import { RelatedRecords } from "@/components/ui/RelatedRecords";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, ScrollText, Loader2 } from "lucide-react";

interface RegisterPage {
  id: string;
  slug: string;
  page_no: number;
  image_path: string;
  county: string | null;
  enslaver: string | null;
  enslaved_person: string | null;
  age: number | null;
  judgement_date: string | null;
  created_at: string;
}

interface PageModalProps {
  page: RegisterPage | null;
  onClose: () => void;
  allPages: RegisterPage[];
  onNavigate: (page: RegisterPage) => void;
}

const PageModal = React.memo<PageModalProps>(function PageModal({ page, onClose, allPages, onNavigate }) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageZoom, setImageZoom] = React.useState(1);

  React.useEffect(() => {
    setImageLoaded(false);
  }, [page]);

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

  const handleZoomIn = () => setImageZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setImageZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setImageZoom(1);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevPage, handleNextPage, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (page) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [page]);

  if (!page) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-brown">
            Record Details - Page {page.page_no}
          </h2>
          <div className="flex items-center gap-3">
            <BookmarkButton
              pageId={page.id}
              collectionName="Virginia Order Books - Henrico"
              collectionSlug="virginia-order-books/henrico"
              recordTitle={`Page ${page.page_no}`}
              size={24}
              showLabel={true}
            />
            <button
              onClick={() => {
                onClose();
                handleResetZoom();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Document Image */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-brand-brown">
                  Document Image
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleZoomOut}
                    size="sm"
                    variant="outline"
                    disabled={imageZoom <= 0.5}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {Math.round(imageZoom * 100)}%
                  </span>
                  <Button
                    onClick={handleZoomIn}
                    size="sm"
                    variant="outline"
                    disabled={imageZoom >= 3}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleResetZoom} size="sm" variant="outline">
                    Reset
                  </Button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-auto max-h-[600px] bg-gray-50">
                <div
                  style={{
                    transform: `scale(${imageZoom})`,
                    transformOrigin: "top left",
                    transition: "transform 0.2s",
                  }}
                >
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
                    </div>
                  )}
                  <Image
                    src={page.image_path}
                    alt={`Page ${page.page_no}`}
                    width={800}
                    height={1000}
                    className="w-full"
                    onLoad={() => setImageLoaded(true)}
                  />
                </div>
              </div>
            </div>

            {/* Record Information */}
            <div>
              <h3 className="text-lg font-semibold text-brand-brown mb-4">
                Record Information
              </h3>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600 mb-1">Page Number</p>
                  <p className="text-lg font-medium text-brand-brown">{page.page_no}</p>
                </div>

                {page.county && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">County</p>
                    <p className="text-base text-gray-900">{page.county}</p>
                  </div>
                )}

                {page.enslaver && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Enslaver</p>
                    <p className="text-base text-gray-900 font-medium">{page.enslaver}</p>
                  </div>
                )}

                {page.enslaved_person && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Enslaved Person</p>
                    <p className="text-base text-gray-900 font-medium">{page.enslaved_person}</p>
                  </div>
                )}

                {page.age !== null && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Age</p>
                    <p className="text-base text-gray-900">{page.age}</p>
                  </div>
                )}

                {page.judgement_date && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Judgement Date</p>
                    <p className="text-base text-gray-900">{new Date(page.judgement_date).toLocaleDateString()}</p>
                  </div>
                )}

                {/* Citation */}
                <RecordCitation
                  collectionName="Virginia Order Books - Henrico County"
                  recordIdentifier={`Page ${page.page_no}`}
                  recordDetails={{
                    pageNo: page.page_no,
                    name: page.enslaved_person || undefined,
                    date: page.judgement_date || undefined
                  }}
                />

                {/* Related Records */}
                <RelatedRecords
                  currentRecordId={page.id}
                  currentTable="va_books_henrico"
                  searchTerms={{
                    name: page.enslaved_person || undefined,
                    location: page.county || undefined
                  }}
                  collectionSlug="virginia-order-books/henrico"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const VirginiaOrderBooksHenricoPage = () => {
  const searchParams = useSearchParams();
  const [pages, setPages] = useState<RegisterPage[]>([]);
  const [filteredPages, setFilteredPages] = useState<RegisterPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPage, setSelectedPage] = useState<RegisterPage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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
      setLoading(true);
      try {
        // Fetch all pages in batches (without ocr_text for performance)
        let allPages: RegisterPage[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from("va_books_henrico")
            .select("id, slug, page_no, image_path, county, enslaver, enslaved_person, age, judgement_date, created_at")
            .order("page_no", { ascending: true })
            .range(from, from + batchSize - 1);

          if (error) {
            console.error("Error fetching Virginia Order Books (Henrico):", error);
            break;
          }

          if (data && data.length > 0) {
            allPages = [...allPages, ...data as RegisterPage[]];
            from += batchSize;

            if (data.length < batchSize) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        setPages(allPages);
        setFilteredPages(allPages);
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
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(page =>
        page.page_no.toString().includes(searchTerm) ||
        (page.county && page.county.toLowerCase().includes(term)) ||
        (page.enslaver && page.enslaver.toLowerCase().includes(term)) ||
        (page.enslaved_person && page.enslaved_person.toLowerCase().includes(term)) ||
        (page.judgement_date && page.judgement_date.includes(searchTerm))
      );
    }

    setFilteredPages(filtered);
    setCurrentPage(1);
  }, [searchTerm, pages]);

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredPages.slice(startIndex, endIndex);

  const handlePageClick = React.useCallback((page: RegisterPage) => {
    setSelectedPage(page);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
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
              Virginia Order Books - Henrico County
            </h1>
            <p className="text-lg text-white/90">
              Court proceedings and legal judgments documenting Negro adjudgments from Henrico County, Virginia.
              Browse original court order books and transcriptions.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Input
              type="search"
              placeholder="Search by page, county, enslaver, or enslaved person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md"
            />

            <p className="text-sm text-gray-600">
              Showing {filteredPages.length} of {pages.length} records
            </p>
          </div>
        </div>

        {filteredPages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No pages found matching your search.</p>
          </div>
        ) : (
          <>
            {/* Table of Pages */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-brand-green text-white sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Page</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">County</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Enslaver</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Enslaved Person</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Age</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Judgement Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentPageData.map((page, index) => (
                      <tr
                        key={page.id}
                        onClick={() => handlePageClick(page)}
                        className={`hover:bg-brand-tan/30 cursor-pointer transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {page.page_no}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {page.county || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {page.enslaver || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {page.enslaved_person || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {page.age !== null ? page.age : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {page.judgement_date ? new Date(page.judgement_date).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mb-8">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
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

const WrappedVirginiaOrderBooksHenricoPage = () => {
  return (
    <ProtectedRoute requiresPaid={true}>
      <Suspense fallback={
        <div className="min-h-screen bg-brand-beige flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        </div>
      }>
        <VirginiaOrderBooksHenricoPage />
      </Suspense>
    </ProtectedRoute>
  );
};

export default WrappedVirginiaOrderBooksHenricoPage;


"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";

const UpgradePrompt = () => {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto p-8">
        <div className="mb-6">
          <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-brand-brown mb-4">
            Premium Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            Access to the Inspection Roll of Negroes requires a premium membership.
            Unlock thousands of historical documents and advanced search capabilities.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Full access to all historical documents</span>
          </div>
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Advanced text search within documents</span>
          </div>
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">High-resolution document images</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/membership')}
            className="w-full bg-brand-green text-white hover:bg-brand-darkgreen"
            size="lg"
          >
            Upgrade to Premium - $19.99/month
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Don&apos;t have an account?</p>
            <div className="space-x-2">
              <Button
                onClick={() => setShowSignup(true)}
                variant="outline"
                size="sm"
              >
                Sign Up Free
              </Button>
              <Button
                onClick={() => setShowLogin(true)}
                variant="outline"
                size="sm"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showLogin && (
        <LoginForm
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

      {showSignup && (
        <SignupForm
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
};

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
}

const ArchivePageModal: React.FC<ArchivePageModalProps> = ({ page, onClose }) => {
  const [fullPage, setFullPage] = React.useState<ArchivePage | null>(page);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchFullPage = async () => {
      if (!page || page.ocr_text) {
        setFullPage(page);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("archive_pages")
          .select("*")
          .eq("id", page.id)
          .single();

        if (error) {
          console.error("Error fetching full page:", error);
          setFullPage(page);
        } else {
          setFullPage(data);
        }
      } catch (error) {
        console.error("Error:", error);
        setFullPage(page);
      } finally {
        setLoading(false);
      }
    };

    fetchFullPage();
  }, [page]);

  if (!fullPage) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-brand-brown">
              {fullPage.title || `Book ${fullPage.book_no}, Page ${fullPage.page_no}`}
            </h3>
            {fullPage.year && <p className="text-sm text-gray-600">Year: {fullPage.year}</p>}
            {fullPage.location && <p className="text-sm text-gray-600">Location: {fullPage.location}</p>}
          </div>
          <div className="flex items-center gap-3">
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
                <h4 className="font-semibold text-brand-brown">Document Image</h4>
                <div className="border rounded-lg overflow-hidden relative h-96">
                  <Image
                    src={fullPage.image_path}
                    alt={`Page ${fullPage.page_no} from Book ${fullPage.book_no}`}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
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

              {loading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">Loading transcribed text...</p>
                </div>
              ) : fullPage.ocr_text && (
                <div>
                  <h4 className="font-semibold text-brand-brown mb-2">Transcribed Text</h4>
                  <div className="bg-gray-50 p-3 rounded-md text-sm max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {fullPage.ocr_text}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Image paths are already complete URLs stored in the database
// No helper function needed

const InspectionRollOfNegroesPage = () => {
  const [pages, setPages] = useState<ArchivePage[]>([]);
  const [filteredPages, setFilteredPages] = useState<ArchivePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPage, setSelectedPage] = useState<ArchivePage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookFilter, setBookFilter] = useState<number | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchPages = async () => {
      try {
        // First, get the total count
        const { count } = await supabase
          .from("archive_pages")
          .select("*", { count: 'exact', head: true })
          .eq("collection_slug", "inspection-roll-of-negroes");

        // Then fetch only the first page of results with minimal data
        const { data, error } = await supabase
          .from("archive_pages")
          .select("id, collection_slug, book_no, page_no, slug, image_path, title, year, location, tags")
          .eq("collection_slug", "inspection-roll-of-negroes")
          .order("book_no", { ascending: true })
          .order("page_no", { ascending: true })
          .limit(100); // Load first 100 records initially

        if (error) {
          console.error("Error fetching archive pages:", error);
        } else {
          setPages(data || []);
          setFilteredPages(data || []);
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
      // Note: Text search now only searches title, location, and tags
      // For full OCR text search, consider implementing server-side search
      filtered = filtered.filter(page =>
        page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (bookFilter) {
      filtered = filtered.filter(page => page.book_no === bookFilter);
    }

    if (yearFilter) {
      filtered = filtered.filter(page => page.year === yearFilter);
    }

    setFilteredPages(filtered);
    setCurrentPage(1);
  }, [searchTerm, bookFilter, yearFilter, pages]);

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredPages.slice(startIndex, endIndex);

  const uniqueBooks = [...new Set(pages.map(p => p.book_no))].sort((a, b) => a - b);
  const uniqueYears = [...new Set(pages.map(p => p.year).filter(Boolean))].sort((a, b) => a! - b!);

  const handlePageClick = (page: ArchivePage) => {
    setSelectedPage(page);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-xl">Loading Inspection Roll documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-brown mb-4">Inspection Roll of Negroes</h1>
        <p className="text-lg text-gray-700 mb-6">
          Explore historical documents from the Inspection Roll of Negroes collection.
          These documents contain important historical records.
          Click on any document to view the full image and transcribed text.
        </p>

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

        <p className="text-sm text-gray-600">
          Showing {filteredPages.length} of {pages.length} documents
        </p>
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
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border relative"
              >
                {/* Bookmark Button */}
                <div className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md">
                  <BookmarkButton pageId={page.id} size={18} />
                </div>

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
      />
    </div>
  );
};

const WrappedInspectionRollPage = () => {
  return (
    <ProtectedRoute requiresPaid={true} fallback={<UpgradePrompt />}>
      <InspectionRollOfNegroesPage />
    </ProtectedRoute>
  );
};

export default WrappedInspectionRollPage;

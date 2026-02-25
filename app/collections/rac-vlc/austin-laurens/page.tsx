"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
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

interface SaleRecord {
  id: string;
  book_no: number;
  page_name: string;
  entry_no: number;
  date_sold: string | null;
  to_whom_sold: string | null;
  location: string | null;
  men: number | null;
  women: number | null;
  boys: number | null;
  girls: number | null;
  image_path: string | null;
  ocr_text: string;
  slug: string;
  created_at: string;
}

// Helper to check if image_path is a valid URL
const isValidImageUrl = (path: string | null | undefined): boolean => {
  if (!path) return false;
  try {
    new URL(path);
    return true;
  } catch {
    // Check if it's a relative path that starts with /
    return path.startsWith('/');
  }
};

interface RecordModalProps {
  record: SaleRecord | null;
  onClose: () => void;
  allRecords: SaleRecord[];
  onNavigate: (record: SaleRecord) => void;
}

const RecordModal = React.memo<RecordModalProps>(function RecordModal({ record, onClose, allRecords, onNavigate }) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageZoom, setImageZoom] = React.useState(1);
  const [ocrText, setOcrText] = React.useState<string | null>(null);
  const [loadingOcr, setLoadingOcr] = React.useState(false);

  React.useEffect(() => {
    setImageLoaded(false);
  }, [record]);

  // Fetch OCR text when record changes
  React.useEffect(() => {
    const fetchOcrText = async () => {
      if (!record) return;

      setLoadingOcr(true);
      try {
        const { data, error } = await supabase
          .from("slave_merchants_austin_laurens")
          .select("ocr_text")
          .eq("id", record.id)
          .single();

        if (data && !error) {
          setOcrText(data.ocr_text || null);
        }
      } catch (error) {
        console.error("Error fetching OCR text:", error);
      } finally {
        setLoadingOcr(false);
      }
    };

    fetchOcrText();
  }, [record]);

  const currentIndex = allRecords.findIndex(r => r.id === record?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allRecords.length - 1;

  const handlePrevRecord = React.useCallback(() => {
    if (hasPrev) {
      onNavigate(allRecords[currentIndex - 1]);
    }
  }, [hasPrev, currentIndex, allRecords, onNavigate]);

  const handleNextRecord = React.useCallback(() => {
    if (hasNext) {
      onNavigate(allRecords[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, allRecords, onNavigate]);

  const handleZoomIn = () => setImageZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setImageZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setImageZoom(1);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevRecord();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextRecord();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevRecord, handleNextRecord, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (record) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [record]);

  if (!record) return null;

  // Calculate total persons sold
  const totalPersons = (record.men || 0) + (record.women || 0) + (record.boys || 0) + (record.girls || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-brown">
            Sale Record - Entry {record.entry_no}
          </h2>
          <div className="flex items-center gap-3">
            <BookmarkButton
              pageId={record.id}
              collectionName="Austin & Laurens Slave Merchant Records"
              collectionSlug="rac-vlc/austin-laurens"
              recordTitle={record.to_whom_sold || `Entry ${record.entry_no}`}
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
                  {isValidImageUrl(record.image_path) ? (
                    <Image
                      src={record.image_path!}
                      alt={`Sale record entry ${record.entry_no}`}
                      width={800}
                      height={1000}
                      className="w-full"
                      onLoad={() => setImageLoaded(true)}
                    />
                  ) : (
                    <div className="w-full h-[400px] flex flex-col items-center justify-center bg-gray-100 text-gray-500">
                      <ScrollText className="w-16 h-16 mb-4" />
                      <p className="text-sm">No image available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Record Information */}
            <div>
              <h3 className="text-lg font-semibold text-brand-brown mb-4">
                Sale Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Book No.</p>
                    <p className="text-base text-gray-900">{record.book_no}</p>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Page</p>
                    <p className="text-base text-gray-900">{record.page_name}</p>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Entry No.</p>
                    <p className="text-base text-gray-900">{record.entry_no}</p>
                  </div>
                </div>

                {record.date_sold && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Date Sold</p>
                    <p className="text-lg font-medium text-brand-brown">{record.date_sold}</p>
                  </div>
                )}

                {record.to_whom_sold && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">To Whom Sold</p>
                    <p className="text-base text-gray-900">{record.to_whom_sold}</p>
                  </div>
                )}

                {record.location && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="text-base text-gray-900">{record.location}</p>
                  </div>
                )}

                {/* Persons Sold */}
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Persons Sold</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Men:</span>
                      <span className="text-gray-900">{record.men ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Women:</span>
                      <span className="text-gray-900">{record.women ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Boys:</span>
                      <span className="text-gray-900">{record.boys ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Girls:</span>
                      <span className="text-gray-900">{record.girls ?? '-'}</span>
                    </div>
                    {totalPersons > 0 && (
                      <div className="flex justify-between col-span-2 font-medium pt-2 border-t border-gray-100">
                        <span className="text-gray-600">Total:</span>
                        <span className="text-brand-brown">{totalPersons}</span>
                      </div>
                    )}
                  </div>
                </div>

                {loadingOcr ? (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Transcription</p>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brand-green" />
                      <p className="text-sm text-gray-500">Loading...</p>
                    </div>
                  </div>
                ) : ocrText ? (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Transcription</p>
                    <div className="bg-gray-50 p-3 rounded-md max-h-64 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{ocrText}</p>
                    </div>
                  </div>
                ) : null}

                {/* Related Records */}
                <RelatedRecords
                  currentRecordId={record.id}
                  currentTable="slave_merchants_austin_laurens"
                  searchTerms={{
                    name: record.to_whom_sold || undefined,
                    location: record.location || undefined
                  }}
                  collectionSlug="rac-vlc/austin-laurens"
                />

                {/* Citation - at very bottom */}
                <RecordCitation
                  collectionName="Austin & Laurens Slave Merchant Records"
                  recordIdentifier={`Entry ${record.entry_no}`}
                  recordDetails={{
                    bookNo: record.book_no,
                    entryNo: record.entry_no,
                    name: record.to_whom_sold || undefined,
                    date: record.date_sold || undefined
                  }}
                />
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                <Button
                  onClick={handlePrevRecord}
                  disabled={!hasPrev}
                  variant="outline"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous Record
                </Button>
                <Button
                  onClick={handleNextRecord}
                  disabled={!hasNext}
                  variant="outline"
                >
                  Next Record
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const AustinLaurensPage = () => {
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<SaleRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [bookFilter, setBookFilter] = useState<number | null>(null);
  const [uniqueBooks, setUniqueBooks] = useState<number[]>([]);
  const itemsPerPage = 20;

  // Initialize search from URL params
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchTerm(urlSearch);
      setDebouncedSearch(urlSearch);
    }
  }, [searchParams]);

  // Open modal for specific record from URL params
  useEffect(() => {
    const recordId = searchParams.get('record');
    if (recordId && records.length > 0) {
      const record = records.find(r => r.id === recordId);
      if (record) setSelectedRecord(record);
    }
  }, [searchParams, records]);

  // Fetch unique book numbers for filter dropdown
  useEffect(() => {
    supabase
      .from("slave_merchants_austin_laurens")
      .select("book_no")
      .order("book_no", { ascending: true })
      .then(({ data }) => {
        if (data) setUniqueBooks([...new Set(data.map(d => d.book_no))].sort((a, b) => a - b));
      });
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when book filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [bookFilter]);

  // Fetch current page with server-side filtering
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        let query = supabase
          .from("slave_merchants_austin_laurens")
          .select("id, book_no, page_name, entry_no, date_sold, to_whom_sold, location, men, women, boys, girls, image_path, slug, created_at", { count: 'exact' })
          .order("book_no", { ascending: true })
          .order("page_name", { ascending: true })
          .order("entry_no", { ascending: true })
          .range(from, to);

        if (bookFilter !== null) {
          query = query.eq("book_no", bookFilter);
        }

        if (debouncedSearch) {
          query = query.or(`date_sold.ilike.%${debouncedSearch}%,to_whom_sold.ilike.%${debouncedSearch}%,location.ilike.%${debouncedSearch}%,page_name.ilike.%${debouncedSearch}%`);
        }

        const { data, error, count } = await query;

        if (!error && data) {
          setRecords(data as SaleRecord[]);
          setTotalCount(count || 0);
        } else if (error) {
          console.error("Error fetching Austin & Laurens records:", error);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [currentPage, bookFilter, debouncedSearch]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

  const handleRecordClick = useCallback((record: SaleRecord) => {
    setSelectedRecord(record);
  }, []);

  if (loading && records.length === 0) {
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
              Austin & Laurens Slave Merchant Records
            </h1>
            <p className="text-lg text-white/90">
              Historical records from the Austin & Laurens slave trading firm.
              Browse sale entries documenting dates, buyers, locations, and persons sold.
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
              placeholder="Search by date, buyer, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md"
            />

            {uniqueBooks.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Filter by Book:</span>
                <select
                  value={bookFilter ?? ''}
                  onChange={(e) => setBookFilter(e.target.value ? Number(e.target.value) : null)}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Books</option>
                  {uniqueBooks.map(book => (
                    <option key={book} value={book}>Book {book}</option>
                  ))}
                </select>
              </div>
            )}

            <p className="text-sm text-gray-600">
              {loading ? 'Loading...' : totalCount === 0 ? 'No records found.' : `Showing ${startIndex}–${endIndex} of ${totalCount} records`}
            </p>
          </div>
        </div>

        {records.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No records found matching your search.</p>
          </div>
        ) : (
          <>
            {/* Table of Records */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-brand-green text-white sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Entry</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date Sold</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">To Whom Sold</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Men</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Women</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Boys</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Girls</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {records.map((record, index) => {
                      const total = (record.men || 0) + (record.women || 0) + (record.boys || 0) + (record.girls || 0);
                      return (
                        <tr
                          key={record.id}
                          onClick={() => handleRecordClick(record)}
                          className={`hover:bg-brand-tan/30 cursor-pointer transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.book_no}-{record.entry_no}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {record.date_sold || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.to_whom_sold || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.location || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                            {record.men ?? '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                            {record.women ?? '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                            {record.boys ?? '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                            {record.girls ?? '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center font-medium">
                            {total > 0 ? total : '-'}
                          </td>
                        </tr>
                      );
                    })}
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

        <RecordModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          allRecords={records}
          onNavigate={(record) => setSelectedRecord(record)}
        />
      </div>
    </div>
  );
};

const WrappedAustinLaurensPage = () => {
  return (
    <ProtectedRoute requiresPaid={true}>
      <Suspense fallback={
        <div className="min-h-screen bg-brand-beige flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        </div>
      }>
        <AustinLaurensPage />
      </Suspense>
    </ProtectedRoute>
  );
};

export default WrappedAustinLaurensPage;

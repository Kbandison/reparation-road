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
import {
  Search,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
} from "lucide-react";

interface SlaveImportationRecord {
  id: string;
  book_no: number;
  location: string;
  page_no: number;
  entry_no: number;
  by_whom_enslaved: string | null;
  name: string | null;
  age: number | null;
  sex: string | null;
  complexion: string | null;
  date: string | null;
  where_to: string | null;
  where_from: string | null;
  slug: string;
  image_path: string | null;
  ocr_text: string;
  created_at: string | null;
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
  record: SlaveImportationRecord | null;
  onClose: () => void;
  allRecords: SlaveImportationRecord[];
  onNavigate: (record: SlaveImportationRecord) => void;
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
          .from("slave-importation-ga")
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-brand-brown">
            Importation Record - Entry {record.entry_no}
          </h2>
          <div className="flex items-center gap-3">
            <BookmarkButton
              pageId={record.id}
              collectionName="Georgia Slave Importation Records"
              collectionSlug="slave-importation/georgia"
              recordTitle={record.name || `Entry ${record.entry_no}`}
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
                      alt={`Importation record entry ${record.entry_no}`}
                      width={800}
                      height={1000}
                      className="w-full"
                      onLoad={() => setImageLoaded(true)}
                    />
                  ) : (
                    <div className="w-full h-[400px] flex flex-col items-center justify-center bg-gray-100 text-gray-500">
                      <FileText className="w-16 h-16 mb-4" />
                      <p className="text-sm">No image available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Record Information */}
            <div>
              <h3 className="text-lg font-semibold text-brand-brown mb-4">
                Record Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Book No.</p>
                    <p className="text-base text-gray-900">{record.book_no}</p>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Page No.</p>
                    <p className="text-base text-gray-900">{record.page_no}</p>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Entry No.</p>
                    <p className="text-base text-gray-900">{record.entry_no}</p>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="text-lg font-medium text-brand-brown">{record.location}</p>
                </div>

                {record.date && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="text-base text-gray-900">{record.date}</p>
                  </div>
                )}

                {/* Personal Information */}
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Personal Information</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="text-gray-900">{record.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="text-gray-900">{record.age ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sex:</span>
                      <span className="text-gray-900">{record.sex || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Complexion:</span>
                      <span className="text-gray-900">{record.complexion || '-'}</span>
                    </div>
                  </div>
                </div>

                {record.by_whom_enslaved && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">By Whom Enslaved</p>
                    <p className="text-base text-gray-900">{record.by_whom_enslaved}</p>
                  </div>
                )}

                {/* Location Information */}
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Movement Information</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">From:</span>
                      <span className="text-gray-900">{record.where_from || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">To:</span>
                      <span className="text-gray-900">{record.where_to || '-'}</span>
                    </div>
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
                  currentTable="slave-importation-ga"
                  searchTerms={{
                    name: record.name || record.by_whom_enslaved || undefined,
                    location: record.location || record.where_from || undefined
                  }}
                  collectionSlug="slave-importation/georgia"
                />

                {/* Citation - at very bottom */}
                <RecordCitation
                  collectionName="Georgia Slave Importation Records"
                  recordIdentifier={record.name || `Entry ${record.entry_no}`}
                  recordDetails={{
                    bookNo: record.book_no,
                    pageNo: record.page_no,
                    entryNo: record.entry_no,
                    name: record.name || undefined,
                    date: record.date || undefined
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

const GeorgiaSlaveImportationPage = () => {
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<SlaveImportationRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SlaveImportationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<SlaveImportationRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookFilter, setBookFilter] = useState<number | null>(null);
  const recordsPerPage = 20;

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
    if (recordId && records.length > 0) {
      const record = records.find(r => r.id === recordId);
      if (record) {
        setSelectedRecord(record);
      }
    }
  }, [searchParams, records]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 30000)
    );

    try {
      let allRecords: SlaveImportationRecord[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;
      let batchCount = 0;
      const maxBatches = 50;

      while (hasMore && batchCount < maxBatches) {
        const fetchPromise = supabase
          .from("slave-importation-ga")
          .select("id, book_no, location, page_no, entry_no, by_whom_enslaved, name, age, sex, complexion, date, where_to, where_from, slug, image_path, created_at")
          .order("book_no", { ascending: true })
          .order("page_no", { ascending: true })
          .order("entry_no", { ascending: true })
          .range(from, from + batchSize - 1);

        const result = await Promise.race([fetchPromise, timeoutPromise]);
        const { data, error } = result as { data: SlaveImportationRecord[] | null; error: Error | null };

        if (error) {
          console.error("Supabase error:", error);
          throw new Error(error.message || "Failed to fetch records");
        }

        if (data && data.length > 0) {
          allRecords = [...allRecords, ...data];
          from += batchSize;
          hasMore = data.length === batchSize;
          batchCount++;
        } else {
          hasMore = false;
        }
      }

      setRecords(allRecords);
      setFilteredRecords(allRecords);

      if (allRecords.length === 0) {
        setError("No records found in this collection.");
      }
    } catch (err: unknown) {
      console.error("Error fetching records:", err);
      setError(err instanceof Error ? err.message : "Failed to load records. Please try again later.");
      setRecords([]);
      setFilteredRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    let filtered = records;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((record) =>
        record.name?.toLowerCase().includes(searchLower) ||
        record.by_whom_enslaved?.toLowerCase().includes(searchLower) ||
        record.where_from?.toLowerCase().includes(searchLower) ||
        record.where_to?.toLowerCase().includes(searchLower) ||
        record.age?.toString().includes(searchLower) ||
        record.sex?.toLowerCase().includes(searchLower) ||
        record.complexion?.toLowerCase().includes(searchLower) ||
        record.location?.toLowerCase().includes(searchLower) ||
        record.date?.toLowerCase().includes(searchLower) ||
        record.book_no?.toString().includes(searchLower) ||
        record.page_no?.toString().includes(searchLower) ||
        record.entry_no?.toString().includes(searchLower)
      );
    }

    if (bookFilter !== null) {
      filtered = filtered.filter(record => record.book_no === bookFilter);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, bookFilter, records]);

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const uniqueBooks = [...new Set(records.map(r => r.book_no))].sort((a, b) => a - b);

  const handleRecordClick = useCallback((record: SlaveImportationRecord) => {
    setSelectedRecord(record);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Georgia Slave Importation Records
            </h1>
            <p className="text-lg text-white/90">
              Declarations of enslaved persons imported into Georgia.
              Browse records documenting names, ages, origins, and destinations.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Search by name, enslaver, location, date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

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
              Showing {filteredRecords.length} of {records.length} records
            </p>
          </div>
        </div>

        {error ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Records</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={fetchRecords}
              className="bg-brand-green hover:bg-brand-darkgreen"
            >
              Try Again
            </Button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600">No records found matching your search.</p>
          </div>
        ) : (
          <>
            {/* Records Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-brand-green text-white sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Entry</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Age</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Sex</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">By Whom Enslaved</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">From</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentRecords.map((record, index) => (
                      <tr
                        key={record.id}
                        onClick={() => handleRecordClick(record)}
                        className={`hover:bg-brand-tan/30 cursor-pointer transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.book_no}-{record.page_no}-{record.entry_no}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {record.name || <span className="text-gray-400 italic">Not specified</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.age ?? "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.sex || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.by_whom_enslaved || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.date || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.location || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.where_from || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{record.where_to || "-"}</td>
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

        <RecordModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          allRecords={filteredRecords}
          onNavigate={(record) => setSelectedRecord(record)}
        />
      </div>
    </div>
  );
};

const WrappedGeorgiaSlaveImportationPage = () => {
  return (
    <ProtectedRoute requiresPaid={true}>
      <Suspense fallback={
        <div className="min-h-screen bg-brand-beige flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        </div>
      }>
        <GeorgiaSlaveImportationPage />
      </Suspense>
    </ProtectedRoute>
  );
};

export default WrappedGeorgiaSlaveImportationPage;

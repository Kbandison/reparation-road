"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, ScrollText, Loader2 } from "lucide-react";
import { RecordCitation } from "@/components/ui/RecordCitation";
import { RelatedRecords } from "@/components/ui/RelatedRecords";

interface CensusRecord {
  id: string;
  book_no: number;
  page_no: number;
  entry_no: number;
  head_of_family: string;
  residence: string | null;
  cherokee_males_under_18: number | null;
  cherokee_males_above_18: number | null;
  cherokee_females_under_18: number | null;
  cherokee_females_above_18: number | null;
  cherokees: number | null;
  male_slaves: number | null;
  female_slaves: number | null;
  total_slaves: number | null;
  whites_connected_by_marriage: number | null;
  household_total: number | null;
  image_path: string;
  ocr_text: string;
  slug: string;
  created_at: string;
}

interface RecordModalProps {
  record: CensusRecord | null;
  onClose: () => void;
  allRecords: CensusRecord[];
  onNavigate: (record: CensusRecord) => void;
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
          .from("cherokee_henderson")
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
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-brown">
            Record Details - {record.head_of_family}
          </h2>
          <div className="flex items-center gap-2">
            <BookmarkButton pageId={record.id} />
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
                    src={record.image_path}
                    alt={`Record for ${record.head_of_family}`}
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
                Household Information
              </h3>
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600 mb-1">Head of Family</p>
                  <p className="text-lg font-medium text-brand-brown">
                    {record.head_of_family}
                  </p>
                </div>

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

                {record.residence && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Residence</p>
                    <p className="text-base text-gray-900">{record.residence}</p>
                  </div>
                )}

                {/* Cherokee Population */}
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Cherokee Population</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Males Under 18:</span>
                      <span className="text-gray-900">{record.cherokee_males_under_18 ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Males Above 18:</span>
                      <span className="text-gray-900">{record.cherokee_males_above_18 ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Females Under 18:</span>
                      <span className="text-gray-900">{record.cherokee_females_under_18 ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Females Above 18:</span>
                      <span className="text-gray-900">{record.cherokee_females_above_18 ?? '-'}</span>
                    </div>
                    <div className="flex justify-between col-span-2 font-medium">
                      <span className="text-gray-600">Total Cherokees:</span>
                      <span className="text-gray-900">{record.cherokees ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Enslaved Population */}
                {(record.male_slaves !== null || record.female_slaves !== null || record.total_slaves !== null) && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Enslaved Population</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Male Slaves:</span>
                        <span className="text-gray-900">{record.male_slaves ?? '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Female Slaves:</span>
                        <span className="text-gray-900">{record.female_slaves ?? '-'}</span>
                      </div>
                      <div className="flex justify-between col-span-2 font-medium">
                        <span className="text-gray-600">Total Slaves:</span>
                        <span className="text-gray-900">{record.total_slaves ?? '-'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {record.whites_connected_by_marriage !== null && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Whites Connected by Marriage</p>
                    <p className="text-base text-gray-900">{record.whites_connected_by_marriage}</p>
                  </div>
                )}

                {record.household_total !== null && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Household Total</p>
                    <p className="text-lg font-medium text-brand-brown">{record.household_total}</p>
                  </div>
                )}

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

                {/* Citation */}
                <RecordCitation
                  collectionName="Cherokee Census - Henderson Roll"
                  recordIdentifier={record.id}
                  recordDetails={{
                    bookNo: record.book_no,
                    pageNo: record.page_no,
                    entryNo: record.entry_no,
                    name: record.head_of_family
                  }}
                />

                {/* Related Records */}
                <RelatedRecords
                  currentRecordId={record.id}
                  currentTable="cherokee_henderson"
                  searchTerms={{
                    name: record.head_of_family,
                    location: record.residence || undefined
                  }}
                  collectionSlug="native-american-records/early-cherokee-census/cherokee-henderson"
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

const CherokeeHendersonPage = () => {
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<CensusRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CensusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<CensusRecord | null>(null);
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
    if (recordId && records.length > 0) {
      const record = records.find(r => r.id === recordId);
      if (record) {
        setSelectedRecord(record);
      }
    }
  }, [searchParams, records]);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        // Fetch all records in batches (without ocr_text for performance)
        let allRecords: CensusRecord[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from("cherokee_henderson")
            .select("id, book_no, page_no, entry_no, head_of_family, residence, cherokee_males_under_18, cherokee_males_above_18, cherokee_females_under_18, cherokee_females_above_18, cherokees, male_slaves, female_slaves, total_slaves, whites_connected_by_marriage, household_total, image_path, slug, created_at")
            .order("book_no", { ascending: true })
            .order("page_no", { ascending: true })
            .order("entry_no", { ascending: true })
            .range(from, from + batchSize - 1);

          if (error) {
            console.error("Error fetching Cherokee Henderson Census:", error);
            break;
          }

          if (data && data.length > 0) {
            allRecords = [...allRecords, ...data as CensusRecord[]];
            from += batchSize;

            if (data.length < batchSize) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        setRecords(allRecords);
        setFilteredRecords(allRecords);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  useEffect(() => {
    let filtered = records;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.head_of_family.toLowerCase().includes(searchLower) ||
        record.book_no.toString().includes(searchTerm) ||
        record.page_no.toString().includes(searchTerm) ||
        record.entry_no.toString().includes(searchTerm) ||
        (record.residence && record.residence.toLowerCase().includes(searchLower))
      );
    }

    if (bookFilter !== null) {
      filtered = filtered.filter(record => record.book_no === bookFilter);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, bookFilter, records]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredRecords.slice(startIndex, endIndex);

  const uniqueBooks = [...new Set(records.map(r => r.book_no))].sort((a, b) => a - b);

  const handleRecordClick = useCallback((record: CensusRecord) => {
    setSelectedRecord(record);
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
              Cherokee Census - Henderson Roll
            </h1>
            <p className="text-lg text-white/90">
              Historical census records from the Cherokee Nation Henderson Roll.
              Browse household entries with population counts for Cherokee members, enslaved persons, and connected whites.
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
              placeholder="Search by head of family, residence..."
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
              Showing {filteredRecords.length} of {records.length} records
            </p>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
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
                      <th className="px-4 py-3 text-left text-sm font-semibold">Head of Family</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Residence</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Cherokees</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Slaves</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Whites</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentPageData.map((record, index) => (
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
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {record.head_of_family}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.residence || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                          {record.cherokees ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                          {record.total_slaves ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
                          {record.whites_connected_by_marriage ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center font-medium">
                          {record.household_total ?? '-'}
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

const WrappedCherokeeHendersonPage = () => {
  return (
    <ProtectedRoute requiresPaid={true}>
      <Suspense fallback={
        <div className="min-h-screen bg-brand-beige flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        </div>
      }>
        <CherokeeHendersonPage />
      </Suspense>
    </ProtectedRoute>
  );
};

export default WrappedCherokeeHendersonPage;

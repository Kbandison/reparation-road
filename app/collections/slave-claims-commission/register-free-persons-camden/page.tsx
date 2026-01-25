"use client";

import React, { useState, useEffect, Suspense } from "react";
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

interface RegisterRecord {
  id: string;
  book_no: number;
  page_no: number;
  entry_no: number;
  name: string;
  age: number | null;
  place_of_nativity: string | null;
  residence: string | null;
  date_entered_state: string | null;
  occupation: string | null;
  date_registered: number | null;
  image_path: string;
  ocr_text: string;
  slug: string;
  created_at: string;
}

interface RecordModalProps {
  record: RegisterRecord | null;
  onClose: () => void;
  allRecords: RegisterRecord[];
  onNavigate: (record: RegisterRecord) => void;
}

const RecordModal = React.memo<RecordModalProps>(function RecordModal({ record, onClose, allRecords, onNavigate }) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageZoom, setImageZoom] = React.useState(1);

  React.useEffect(() => {
    setImageLoaded(false);
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
            {record.name}
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
                    alt={`${record.name} - Book ${record.book_no}, Page ${record.page_no}, Entry ${record.entry_no}`}
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
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="text-lg font-medium text-brand-brown">{record.name}</p>
                </div>

                {record.age !== null && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Age</p>
                    <p className="text-base text-gray-900">{record.age}</p>
                  </div>
                )}

                {record.place_of_nativity && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Place of Nativity</p>
                    <p className="text-base text-gray-900">{record.place_of_nativity}</p>
                  </div>
                )}

                {record.residence && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Residence</p>
                    <p className="text-base text-gray-900">{record.residence}</p>
                  </div>
                )}

                {record.date_entered_state && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Date Entered State</p>
                    <p className="text-base text-gray-900">{record.date_entered_state}</p>
                  </div>
                )}

                {record.occupation && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Occupation</p>
                    <p className="text-base text-gray-900">{record.occupation}</p>
                  </div>
                )}

                {record.date_registered !== null && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Date Registered</p>
                    <p className="text-base text-gray-900">{record.date_registered}</p>
                  </div>
                )}

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600 mb-1">Book Number</p>
                  <p className="text-base text-gray-900">{record.book_no}</p>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600 mb-1">Page Number</p>
                  <p className="text-base text-gray-900">{record.page_no}</p>
                </div>

                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm text-gray-600 mb-1">Entry Number</p>
                  <p className="text-base text-gray-900">{record.entry_no}</p>
                </div>

                {record.ocr_text && (
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Transcription</p>
                    <div className="bg-gray-50 p-3 rounded-md max-h-64 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{record.ocr_text}</p>
                    </div>
                  </div>
                )}

                {/* Citation */}
                <RecordCitation
                  collectionName="Register of Free Persons - Camden County"
                  recordIdentifier={record.id}
                  recordDetails={{
                    bookNo: record.book_no,
                    pageNo: record.page_no,
                    entryNo: record.entry_no,
                    name: record.name || undefined,
                    date: record.date_registered?.toString() || undefined
                  }}
                />

                {/* Related Records */}
                <RelatedRecords
                  currentRecordId={record.id}
                  currentTable="register_free_persons_camden"
                  searchTerms={{
                    name: record.name || undefined,
                    location: record.residence || undefined,
                    occupation: record.occupation || undefined
                  }}
                  collectionSlug="slave-claims-commission/register-free-persons-camden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const RegisterFreePersonsCamdenPage = () => {
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<RegisterRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<RegisterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<RegisterRecord | null>(null);
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
        let allRecords: RegisterRecord[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from("register_free_persons_camden")
            .select("id, book_no, page_no, entry_no, name, age, place_of_nativity, residence, date_entered_state, occupation, date_registered, image_path, slug, created_at")
            .order("book_no", { ascending: true })
            .order("page_no", { ascending: true })
            .order("entry_no", { ascending: true })
            .range(from, from + batchSize - 1);

          if (error) {
            console.error("Error fetching Register Free Persons (Camden):", error);
            break;
          }

          if (data && data.length > 0) {
            allRecords = [...allRecords, ...data as RegisterRecord[]];
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
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.book_no.toString().includes(searchTerm) ||
        record.page_no.toString().includes(searchTerm) ||
        record.entry_no.toString().includes(searchTerm) ||
        record.name.toLowerCase().includes(term) ||
        (record.age !== null && record.age.toString().includes(searchTerm)) ||
        (record.place_of_nativity && record.place_of_nativity.toLowerCase().includes(term)) ||
        (record.residence && record.residence.toLowerCase().includes(term)) ||
        (record.date_entered_state && record.date_entered_state.toLowerCase().includes(term)) ||
        (record.occupation && record.occupation.toLowerCase().includes(term)) ||
        (record.date_registered !== null && record.date_registered.toString().includes(searchTerm))
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

  const handleRecordClick = React.useCallback((record: RegisterRecord) => {
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
              Register of Free Persons - Camden County
            </h1>
            <p className="text-lg text-white/90">
              Records of free persons of color from Camden County, Georgia.
              Browse historical register entries documenting free persons of color with detailed personal information.
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
              placeholder="Search by name, residence, occupation, or other details..."
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
                  <thead className="bg-brand-green text-white sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Age</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Residence</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Occupation</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date Registered</th>
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
                          {record.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.age !== null ? record.age : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.residence || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.occupation || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.date_registered !== null ? record.date_registered : '-'}
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

const WrappedRegisterFreePersonsCamdenPage = () => {
  return (
    <ProtectedRoute requiresPaid={true}>
      <Suspense fallback={
        <div className="min-h-screen bg-brand-beige flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        </div>
      }>
        <RegisterFreePersonsCamdenPage />
      </Suspense>
    </ProtectedRoute>
  );
};

export default WrappedRegisterFreePersonsCamdenPage;

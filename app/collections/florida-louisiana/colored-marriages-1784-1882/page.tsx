"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChevronLeft, ChevronRight, X, ZoomIn, Heart } from "lucide-react";
import { GridSkeleton } from "@/components/ui/GridSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface ColoredMarriageRecord {
  id: string;
  page_number: number;
  image_url: string;
  has_transcription: boolean;
  latin_transcription: string | null;
  english_transcription: string | null;
  notes: string | null;
}

interface RecordModalProps {
  record: ColoredMarriageRecord | null;
  onClose: () => void;
  allRecords: ColoredMarriageRecord[];
  onNavigate: (record: ColoredMarriageRecord) => void;
}

const RecordModal = React.memo<RecordModalProps>(function RecordModal({ record, onClose, allRecords, onNavigate }) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isImageZoomed, setIsImageZoomed] = React.useState(false);

  React.useEffect(() => {
    setImageLoaded(false);
  }, [record]);

  // Get current record index and navigation helpers
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

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevRecord();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextRecord();
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
  }, [handlePrevRecord, handleNextRecord, isImageZoomed, onClose]);

  if (!record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePrevRecord}
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
                Page {record.page_number}
              </h3>
              <p className="text-sm text-gray-500">Record {currentIndex + 1} of {allRecords.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleNextRecord}
              disabled={!hasNext}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
            <BookmarkButton pageId={record.id} size={24} showLabel={true} />
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {record.image_url && (
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
                    src={record.image_url}
                    alt={`Page ${record.page_number}`}
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
                  <p><span className="font-medium">Page Number:</span> {record.page_number}</p>
                  <p><span className="font-medium">Has Transcription:</span> {record.has_transcription ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {record.latin_transcription && (
                <div>
                  <h4 className="font-semibold text-brand-brown mb-2">Latin Transcription</h4>
                  <div className="bg-gray-50 p-3 rounded-md text-sm max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {record.latin_transcription}
                    </pre>
                  </div>
                </div>
              )}

              {record.english_transcription && (
                <div>
                  <h4 className="font-semibold text-brand-brown mb-2">English Transcription</h4>
                  <div className="bg-gray-50 p-3 rounded-md text-sm max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {record.english_transcription}
                    </pre>
                  </div>
                </div>
              )}

              {!record.latin_transcription && !record.english_transcription && (
                <div>
                  <h4 className="font-semibold text-brand-brown mb-2">Transcription</h4>
                  <div className="bg-gray-50 p-3 rounded-md text-sm h-32 flex items-center justify-center">
                    <p className="text-gray-500">No transcription available for this record.</p>
                  </div>
                </div>
              )}

              {record.notes && (
                <div>
                  <h4 className="font-semibold text-brand-brown mb-2">Notes</h4>
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <p className="text-xs">{record.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Zoom Overlay */}
      {isImageZoomed && record.image_url && (
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
                handlePrevRecord();
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
                handleNextRecord();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <ChevronRight className="w-8 h-8 text-gray-700" />
            </button>
          )}

          {/* Page Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg z-10">
            <p className="text-sm font-medium text-gray-700">
              Record {currentIndex + 1} of {allRecords.length}
            </p>
          </div>

          {/* Zoomed Image */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={record.image_url}
              alt={`Page ${record.page_number}`}
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

const ColoredMarriagesPage = () => {
  const [records, setRecords] = useState<ColoredMarriageRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ColoredMarriageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<ColoredMarriageRecord | null>(null);
  const [clickedRecordId, setClickedRecordId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [transcriptionFilter, setTranscriptionFilter] = useState<boolean | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data, error } = await supabase
          .from("colored-marriages")
          .select("*")
          .order("page_number", { ascending: true });

        if (error) {
          console.error("Error fetching colored marriages records:", error);
        } else if (data) {
          setRecords(data);
          setFilteredRecords(data);
        }
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
      filtered = filtered.filter(record =>
        record.page_number.toString().includes(searchTerm) ||
        record.latin_transcription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.english_transcription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (transcriptionFilter !== null) {
      filtered = filtered.filter(record => record.has_transcription === transcriptionFilter);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, transcriptionFilter, records]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredRecords.slice(startIndex, endIndex);

  const handleRecordClick = React.useCallback((record: ColoredMarriageRecord) => {
    setClickedRecordId(record.id);
    React.startTransition(() => {
      setTimeout(() => {
        setSelectedRecord(record);
        setClickedRecordId(null);
      }, 50);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Heart className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Colored Marriages (1784-1882)
              </h1>
              <p className="text-lg text-white/90">
                Marriage records of people of color from Florida and Louisiana spanning 1784 to 1882.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <GridSkeleton count={20} />
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
            <Heart className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Colored Marriages (1784-1882)
            </h1>
            <p className="text-lg text-white/90">
              Marriage records of people of color from the Diocese of St. Augustine spanning 1784 to 1882.
              Click on any record to view the full image and transcriptions.
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
                placeholder="Search page number, transcriptions, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transcription Status
              </label>
              <select
                value={transcriptionFilter === null ? "" : transcriptionFilter.toString()}
                onChange={(e) => setTranscriptionFilter(e.target.value === "" ? null : e.target.value === "true")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                <option value="">All Records</option>
                <option value="true">With Transcription</option>
                <option value="false">Without Transcription</option>
              </select>
            </div>

            <div>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setTranscriptionFilter(null);
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Showing {filteredRecords.length} of {records.length} records
          </p>
        </div>

        {filteredRecords.length === 0 ? (
          <EmptyState
            type="no-results"
            title="No Records Found"
            description="No marriage records match your current search or filter criteria. Try adjusting your search terms or filters."
            actionLabel="Clear All Filters"
            onAction={() => {
              setSearchTerm("");
              setTranscriptionFilter(null);
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentPageData.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleRecordClick(record)}
                  className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow group ${
                    clickedRecordId === record.id ? 'ring-2 ring-brand-green scale-95' : ''
                  }`}
                >
                  {/* Loading Overlay when clicked */}
                  {clickedRecordId === record.id && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20 rounded-lg">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
                    </div>
                  )}

                  {record.image_url && (
                    <div className="relative h-40 bg-gray-100">
                      <Image
                        src={record.image_url}
                        alt={`Page ${record.page_number}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        unoptimized
                        loading="lazy"
                      />
                      <div
                        className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BookmarkButton pageId={record.id} size={18} />
                      </div>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-semibold text-sm text-brand-brown">
                      Page {record.page_number}
                    </p>
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
              ({startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records)
            </div>
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

const WrappedColoredMarriagesPage = () => {
  return (
    <ProtectedRoute requiresPaid={false}>
      <ColoredMarriagesPage />
    </ProtectedRoute>
  );
};

export default WrappedColoredMarriagesPage;

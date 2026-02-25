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
import { ChevronLeft, ChevronRight, X, ZoomIn, Ship, Loader2, Users } from "lucide-react";

interface OthelloRecord {
  id: string;
  book_no: number;
  page_name: string;
  entry_no: number;
  when_sold: string | null;
  to_whom_sold: string | null;
  location: string | null;
  men: number | null;
  women: number | null;
  boys: number | null;
  girls: number | null;
  image_path: string;
  slug: string;
  created_at: string;
}

const isValidImageUrl = (path: string | null | undefined): boolean => {
  if (!path) return false;
  try {
    new URL(path);
    return true;
  } catch {
    return path.startsWith('/');
  }
};

interface RecordModalProps {
  record: OthelloRecord | null;
  onClose: () => void;
  allRecords: OthelloRecord[];
  onNavigate: (record: OthelloRecord) => void;
}

const RecordModal = React.memo<RecordModalProps>(function RecordModal({ record, onClose, allRecords, onNavigate }) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isImageZoomed, setIsImageZoomed] = React.useState(false);
  const [ocrText, setOcrText] = React.useState<string | null>(null);
  const [loadingOcr, setLoadingOcr] = React.useState(false);

  React.useEffect(() => {
    setImageLoaded(false);
    setOcrText(null);
  }, [record]);

  React.useEffect(() => {
    const fetchOcrText = async () => {
      if (!record) return;
      setLoadingOcr(true);
      try {
        const { data, error } = await supabase
          .from("slave_merchants_othello")
          .select("ocr_text")
          .eq("id", record.id)
          .single();
        if (data && !error) setOcrText(data.ocr_text || null);
      } catch (err) {
        console.error("Error fetching OCR text:", err);
      } finally {
        setLoadingOcr(false);
      }
    };
    fetchOcrText();
  }, [record]);

  const currentIndex = allRecords.findIndex(r => r.id === record?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allRecords.length - 1;

  const handlePrev = React.useCallback(() => {
    if (hasPrev) onNavigate(allRecords[currentIndex - 1]);
  }, [hasPrev, currentIndex, allRecords, onNavigate]);

  const handleNext = React.useCallback(() => {
    if (hasNext) onNavigate(allRecords[currentIndex + 1]);
  }, [hasNext, currentIndex, allRecords, onNavigate]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); handleNext(); }
      else if (e.key === 'Escape') {
        if (isImageZoomed) setIsImageZoomed(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, isImageZoomed, onClose]);

  React.useEffect(() => {
    if (record) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [record]);

  if (!record) return null;

  const totalPersons = (record.men ?? 0) + (record.women ?? 0) + (record.boys ?? 0) + (record.girls ?? 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button onClick={handlePrev} disabled={!hasPrev} variant="outline" size="sm" className="flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />Prev
            </Button>
            <div>
              <h3 className="text-xl font-bold text-brand-brown">
                Book {record.book_no}, {record.page_name} — Entry {record.entry_no}
              </h3>
              <p className="text-sm text-gray-500">Record {currentIndex + 1} of {allRecords.length} on this page</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleNext} disabled={!hasNext} variant="outline" size="sm" className="flex items-center gap-1">
              Next<ChevronRight className="w-4 h-4" />
            </Button>
            <BookmarkButton
              pageId={record.id}
              collectionName="Brig Othello"
              collectionSlug="rac-vlc/samuel-william-vernon/brig-othello"
              recordTitle={`${record.page_name} Entry ${record.entry_no}${record.to_whom_sold ? ` — ${record.to_whom_sold}` : ''}`}
              size={24}
              showLabel={true}
            />
            <Button onClick={onClose} variant="outline" size="sm">Close</Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isValidImageUrl(record.image_path) ? (
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
                    src={record.image_path}
                    alt={`${record.page_name}, Entry ${record.entry_no}`}
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
            ) : (
              <div className="space-y-2">
                <h4 className="font-semibold text-brand-brown">Document Image</h4>
                <div className="border rounded-lg h-96 bg-gray-100 flex flex-col items-center justify-center text-gray-500">
                  <Ship className="w-16 h-16 mb-4" />
                  <p className="text-sm">No image available</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-brand-brown mb-3">Sale Record Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <p className="text-gray-500">Book</p>
                    <p className="font-medium">{record.book_no}</p>
                    <p className="text-gray-500">Page</p>
                    <p className="font-medium">{record.page_name}</p>
                    <p className="text-gray-500">Entry No.</p>
                    <p className="font-medium">{record.entry_no}</p>
                    {record.when_sold && <>
                      <p className="text-gray-500">Date Sold</p>
                      <p className="font-medium">{record.when_sold}</p>
                    </>}
                    {record.to_whom_sold && <>
                      <p className="text-gray-500">Sold To</p>
                      <p className="font-medium">{record.to_whom_sold}</p>
                    </>}
                    {record.location && <>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium">{record.location}</p>
                    </>}
                  </div>
                </div>
              </div>

              {/* Persons count breakdown */}
              {totalPersons > 0 && (
                <div>
                  <h4 className="font-semibold text-brand-brown mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Persons ({totalPersons} total)
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: 'Men', value: record.men },
                      { label: 'Women', value: record.women },
                      { label: 'Boys', value: record.boys },
                      { label: 'Girls', value: record.girls },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-brand-tan rounded-lg p-3">
                        <p className="text-2xl font-bold text-brand-brown">{value ?? 0}</p>
                        <p className="text-xs text-gray-600 mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-brand-brown mb-2">Transcription</h4>
                {loadingOcr ? (
                  <div className="bg-gray-50 p-4 rounded-lg h-32 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-green mr-2" />
                    <p className="text-sm text-gray-500">Loading transcription...</p>
                  </div>
                ) : ocrText ? (
                  <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap font-mono text-xs">{ocrText}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg h-20 flex items-center justify-center">
                    <p className="text-sm text-gray-500">No transcription available</p>
                  </div>
                )}
              </div>

              <RelatedRecords
                currentRecordId={record.id}
                currentTable="slave_merchants_othello"
                searchTerms={{ name: record.to_whom_sold || '', location: record.location || '' }}
                collectionSlug="rac-vlc/samuel-william-vernon/brig-othello"
              />

              <RecordCitation
                collectionName="Brig Othello — Samuel & William Vernon"
                recordIdentifier={`Book ${record.book_no}, ${record.page_name}, Entry ${record.entry_no}`}
                recordDetails={{
                  bookNo: record.book_no,
                  pageNo: record.entry_no,
                  name: record.page_name,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Zoomed Image Overlay */}
      {isImageZoomed && isValidImageUrl(record.image_path) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center"
          onClick={() => setIsImageZoomed(false)}
        >
          <button
            onClick={() => setIsImageZoomed(false)}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
          {hasPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <ChevronLeft className="w-8 h-8 text-gray-700" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <ChevronRight className="w-8 h-8 text-gray-700" />
            </button>
          )}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg z-10">
            <p className="text-sm font-medium text-gray-700">
              {record.page_name}, Entry {record.entry_no}
            </p>
          </div>
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={record.image_path}
              alt={`${record.page_name}, Entry ${record.entry_no}`}
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

const BrigOthelloPage = () => {
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<OthelloRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<OthelloRecord | null>(null);
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

  // Fetch unique book numbers once for the filter dropdown
  useEffect(() => {
    supabase
      .from("slave_merchants_othello")
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
          .from("slave_merchants_othello")
          .select("id, book_no, page_name, entry_no, when_sold, to_whom_sold, location, men, women, boys, girls, image_path, slug, created_at", { count: 'exact' })
          .order("book_no", { ascending: true })
          .order("entry_no", { ascending: true })
          .range(from, to);

        if (bookFilter !== null) {
          query = query.eq("book_no", bookFilter);
        }

        if (debouncedSearch) {
          query = query.or(`to_whom_sold.ilike.%${debouncedSearch}%,when_sold.ilike.%${debouncedSearch}%,location.ilike.%${debouncedSearch}%,page_name.ilike.%${debouncedSearch}%`);
        }

        const { data, error, count } = await query;

        if (!error && data) {
          setRecords(data as OthelloRecord[]);
          setTotalCount(count || 0);
        } else if (error) {
          console.error("Error fetching Brig Othello records:", error);
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

  if (loading && records.length === 0) {
    return (
      <div className="min-h-screen bg-brand-beige">
        <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Ship className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Brig Othello</h1>
              <p className="text-lg text-white/90">Slave trade records from the Brig Othello.</p>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
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
            <Ship className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Brig Othello</h1>
            <p className="text-lg text-white/90">
              Slave trade sale records from the Brig Othello, operated by Samuel and William Vernon Co.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                type="search"
                placeholder="Search buyer, date, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {uniqueBooks.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
                <select
                  value={bookFilter ?? ''}
                  onChange={(e) => setBookFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                >
                  <option value="">All Books</option>
                  {uniqueBooks.map(book => (
                    <option key={book} value={book}>Book {book}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Button
                onClick={() => { setSearchTerm(""); setBookFilter(null); }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            {loading ? 'Loading...' : totalCount === 0 ? 'No records found.' : `Showing ${startIndex}–${endIndex} of ${totalCount} records`}
          </p>
        </div>

        {/* Records Table */}
        {records.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Ship className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-600">No records match your criteria.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(""); setBookFilter(null); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-brand-tan text-brand-brown">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Book / Page / Entry</th>
                    <th className="px-4 py-3 text-left font-semibold">Date Sold</th>
                    <th className="px-4 py-3 text-left font-semibold">Sold To</th>
                    <th className="px-4 py-3 text-left font-semibold">Location</th>
                    <th className="px-4 py-3 text-center font-semibold">Persons</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((record) => {
                    const total = (record.men ?? 0) + (record.women ?? 0) + (record.boys ?? 0) + (record.girls ?? 0);
                    return (
                      <tr
                        key={record.id}
                        onClick={() => setSelectedRecord(record)}
                        className="hover:bg-brand-beige cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-brand-brown">
                            Bk {record.book_no} / {record.page_name} / #{record.entry_no}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{record.when_sold || '—'}</td>
                        <td className="px-4 py-3 text-gray-700">{record.to_whom_sold || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{record.location || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          {total > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-brand-tan text-brand-brown text-xs font-semibold px-2 py-1 rounded-full">
                              <Users className="w-3 h-3" />
                              {total}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
              Page {currentPage} of {totalPages} ({startIndex}–{endIndex} of {totalCount} records)
            </div>
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

const WrappedBrigOthelloPage = () => {
  return (
    <ProtectedRoute requiresPaid={true}>
      <Suspense fallback={
        <div className="min-h-screen bg-brand-beige flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        </div>
      }>
        <BrigOthelloPage />
      </Suspense>
    </ProtectedRoute>
  );
};

export default WrappedBrigOthelloPage;

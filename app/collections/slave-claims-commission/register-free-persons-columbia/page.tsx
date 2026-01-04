"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, X, ZoomIn, ScrollText, Loader2 } from "lucide-react";

interface RegisterPage {
  id: string;
  book_no: number;
  page_no: number;
  slug: string;
  image_path: string;
  ocr_text: string;
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
  const [isImageZoomed, setIsImageZoomed] = React.useState(false);
  const [ocrText, setOcrText] = React.useState<string | null>(null);
  const [loadingOcr, setLoadingOcr] = React.useState(false);

  React.useEffect(() => {
    setImageLoaded(false);
  }, [page]);

  // Fetch OCR text when page changes
  React.useEffect(() => {
    const fetchOcrText = async () => {
      if (!page) return;

      setLoadingOcr(true);
      try {
        const { data, error } = await supabase
          .from("register_free_persons_colombia")
          .select("ocr_text")
          .eq("id", page.id)
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
  }, [page]);

  const currentIndex = allPages.findIndex(p => p.id === page?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allPages.length - 1;

  const handlePrevPage = React.useCallback(() => {
    if (hasPrev) onNavigate(allPages[currentIndex - 1]);
  }, [hasPrev, currentIndex, allPages, onNavigate]);

  const handleNextPage = React.useCallback(() => {
    if (hasNext) onNavigate(allPages[currentIndex + 1]);
  }, [hasNext, currentIndex, allPages, onNavigate]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrevPage(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); handleNextPage(); }
      else if (e.key === 'Escape') { isImageZoomed ? setIsImageZoomed(false) : onClose(); }
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
            <Button onClick={handlePrevPage} disabled={!hasPrev} variant="outline" size="sm" className="flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <div>
              <h3 className="text-xl font-bold text-brand-brown">Book {page.book_no}, Page {page.page_no}</h3>
              <p className="text-sm text-gray-500">Page {currentIndex + 1} of {allPages.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleNextPage} disabled={!hasNext} variant="outline" size="sm" className="flex items-center gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">Close</Button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {page.image_path && (
              <div className="space-y-2">
                <h4 className="font-semibold text-brand-brown flex items-center gap-2">
                  Document Image <span className="text-xs text-gray-500 font-normal">(Click to expand)</span>
                </h4>
                <div className="border rounded-lg overflow-hidden relative h-96 bg-gray-100 cursor-zoom-in group" onClick={() => setIsImageZoomed(true)}>
                  {!imageLoaded && <div className="absolute inset-0 flex items-center justify-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div></div>}
                  <Image src={page.image_path} alt={`Book ${page.book_no}, Page ${page.page_no}`} fill className={`object-contain transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} priority sizes="(max-width: 1024px) 100vw, 50vw" onLoad={() => setImageLoaded(true)} />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3 shadow-lg"><ZoomIn className="w-6 h-6 text-gray-700" /></div>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-brand-brown mb-2">Document Details</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Book:</span> {page.book_no}</p>
                  <p><span className="font-medium">Page:</span> {page.page_no}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-brand-brown mb-2">Transcription</h4>
                {loadingOcr ? (
                  <div className="bg-gray-50 p-4 rounded-lg h-32 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-green mr-2" />
                    <p className="text-sm text-gray-500">Loading transcription...</p>
                  </div>
                ) : ocrText ? (
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">{ocrText}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg h-32 flex items-center justify-center">
                    <p className="text-sm text-gray-500">No transcription available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isImageZoomed && page.image_path && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center" onClick={() => setIsImageZoomed(false)}>
          <button onClick={() => setIsImageZoomed(false)} className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"><X className="w-6 h-6 text-gray-700" /></button>
          {hasPrev && <button onClick={(e) => { e.stopPropagation(); handlePrevPage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"><ChevronLeft className="w-8 h-8 text-gray-700" /></button>}
          {hasNext && <button onClick={(e) => { e.stopPropagation(); handleNextPage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"><ChevronRight className="w-8 h-8 text-gray-700" /></button>}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg z-10"><p className="text-sm font-medium text-gray-700">Page {currentIndex + 1} of {allPages.length}</p></div>
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}><Image src={page.image_path} alt={`Book ${page.book_no}, Page ${page.page_no}`} fill className="object-contain" priority sizes="100vw" /></div>
        </div>
      )}
    </div>
  );
});

const RegisterFreePersonsColumbiaPage = () => {
  const searchParams = useSearchParams();
  const [pages, setPages] = useState<RegisterPage[]>([]);
  const [filteredPages, setFilteredPages] = useState<RegisterPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPage, setSelectedPage] = useState<RegisterPage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookFilter, setBookFilter] = useState<number | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) setSearchTerm(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    const recordId = searchParams.get('record');
    if (recordId && pages.length > 0) {
      const record = pages.find(p => p.id === recordId);
      if (record) setSelectedPage(record);
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
            .from("register_free_persons_colombia")
            .select("id, book_no, page_no, slug, image_path, created_at")
            .order("book_no", { ascending: true })
            .order("page_no", { ascending: true })
            .range(from, from + batchSize - 1);

          if (error) {
            console.error("Error fetching register pages:", error);
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
    if (searchTerm) filtered = filtered.filter(page => page.book_no.toString().includes(searchTerm) || page.page_no.toString().includes(searchTerm));
    if (bookFilter !== null) filtered = filtered.filter(page => page.book_no === bookFilter);
    setFilteredPages(filtered);
    setCurrentPage(1);
  }, [searchTerm, bookFilter, pages]);

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredPages.slice(startIndex, endIndex);
  const uniqueBooks = [...new Set(pages.map(p => p.book_no))].sort((a, b) => a - b);

  if (loading) return <div className="container mx-auto px-4 py-8"><div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-green" /></div></div>;

  return (
    <div className="min-h-screen bg-brand-beige">
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollText className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Register of Free Persons of Color, Columbia</h1>
            <p className="text-lg text-white/90">Historical records documenting free persons of color in Columbia County, Georgia.</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Input type="search" placeholder="Search by book or page number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full max-w-md" />
            {uniqueBooks.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Filter by Book:</span>
                <select value={bookFilter ?? ''} onChange={(e) => setBookFilter(e.target.value ? Number(e.target.value) : null)} className="border rounded-lg px-3 py-2 text-sm">
                  <option value="">All Books</option>
                  {uniqueBooks.map(book => <option key={book} value={book}>Book {book}</option>)}
                </select>
              </div>
            )}
            <p className="text-sm text-gray-600">Showing {filteredPages.length} of {pages.length} pages</p>
          </div>
        </div>
        {filteredPages.length === 0 ? (
          <div className="text-center py-12"><p className="text-xl text-gray-600">No pages found matching your search.</p></div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentPageData.map((page) => (
                <div key={page.id} onClick={() => setSelectedPage(page)} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow group">
                  <div className="relative h-40 bg-gray-100">
                    {page.image_path ? <Image src={page.image_path} alt={`Book ${page.book_no}, Page ${page.page_no}`} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" /> : <div className="flex items-center justify-center h-full"><ScrollText className="w-8 h-8 text-gray-400" /></div>}
                    <div
                      className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <BookmarkButton pageId={page.id} size={18} />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-brand-brown">Book {page.book_no}, Page {page.page_no}</p>
                    {page.ocr_text && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{page.ocr_text.substring(0, 100)}...</p>}
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} variant="outline">Previous</Button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return <Button key={pageNum} onClick={() => setCurrentPage(pageNum)} variant={currentPage === pageNum ? "default" : "outline"} className="w-10 h-10">{pageNum}</Button>;
                  })}
                </div>
                <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} variant="outline">Next</Button>
              </div>
            )}
            <div className="text-center text-sm text-gray-600 mt-4">Page {currentPage} of {totalPages} ({startIndex + 1}-{Math.min(endIndex, filteredPages.length)} of {filteredPages.length} pages)</div>
          </>
        )}
        <PageModal page={selectedPage} onClose={() => setSelectedPage(null)} allPages={filteredPages} onNavigate={(page) => setSelectedPage(page)} />
      </div>
    </div>
  );
};

const WrappedPage = () => (
  <ProtectedRoute requiresPaid={true}>
    <Suspense fallback={<div className="min-h-screen bg-brand-beige flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-green" /></div>}>
      <RegisterFreePersonsColumbiaPage />
    </Suspense>
  </ProtectedRoute>
);

export default WrappedPage;

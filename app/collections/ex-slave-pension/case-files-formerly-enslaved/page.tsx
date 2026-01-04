"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChevronLeft, ChevronRight, X, ZoomIn, FileText } from "lucide-react";
import { GridSkeleton } from "@/components/ui/GridSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface ExSlavePensionLetter {
  id: string;
  book_title: string;
  book_number: number | null;
  letter_date: string | null;
  recipient_name: string | null;
  recipient_town: string | null;
  recipient_county: string | null;
  recipient_state: string | null;
  source_office: string | null;
  salutation: string | null;
  closing: string | null;
  letter_body: string;
  storage_bucket: string;
  storage_folder: string;
  storage_base_url: string;
  slug: string | null;
  notes: string | null;
  page_no: number | null;
  ex_slave_pension_images?: {
    public_url: string;
  }[];
}

interface LetterModalProps {
  letter: ExSlavePensionLetter | null;
  onClose: () => void;
  allLetters: ExSlavePensionLetter[];
  onNavigate: (letter: ExSlavePensionLetter) => void;
}

const LetterModal = React.memo<LetterModalProps>(function LetterModal({
  letter,
  onClose,
  allLetters,
  onNavigate,
}) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [isImageZoomed, setIsImageZoomed] = React.useState(false);

  // Get current letter index and navigation helpers
  const currentIndex = allLetters.findIndex((l) => l.id === letter?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allLetters.length - 1;

  const handlePrevLetter = React.useCallback(() => {
    if (hasPrev) {
      setImageLoaded(false);
      onNavigate(allLetters[currentIndex - 1]);
    }
  }, [hasPrev, currentIndex, allLetters, onNavigate]);

  const handleNextLetter = React.useCallback(() => {
    if (hasNext) {
      setImageLoaded(false);
      onNavigate(allLetters[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, allLetters, onNavigate]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevLetter();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextLetter();
      } else if (e.key === "Escape") {
        if (isImageZoomed) {
          setIsImageZoomed(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevLetter, handleNextLetter, isImageZoomed, onClose]);

  if (!letter) return null;

  // Get image URL from joined images table, or fallback to constructed path
  const imagePath =
    letter.ex_slave_pension_images?.[0]?.public_url ||
    (letter.slug ? `${letter.storage_base_url}/${letter.slug}.jpg` : null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePrevLetter}
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
                {letter.book_title}
              </h3>
              <p className="text-sm text-gray-500">
                Letter {currentIndex + 1} of {allLetters.length}
              </p>
              {letter.book_number && (
                <p className="text-sm text-gray-600">
                  Book Number: {letter.book_number}
                </p>
              )}
              {letter.page_no && (
                <p className="text-sm text-gray-600">Page: {letter.page_no}</p>
              )}
              {letter.letter_date && (
                <p className="text-sm text-gray-600">
                  Date: {new Date(letter.letter_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleNextLetter}
              disabled={!hasNext}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
            <BookmarkButton pageId={letter.id} size={24} showLabel={true} />
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {imagePath && (
              <div className="space-y-2">
                <h4 className="font-semibold text-brand-brown flex items-center gap-2">
                  Document Image
                  <span className="text-xs text-gray-500 font-normal">
                    (Click to expand)
                  </span>
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
                    src={imagePath}
                    alt={`${letter.book_title}`}
                    fill
                    className={`object-contain transition-opacity ${imageLoaded ? "opacity-100" : "opacity-0"}`}
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
                <h4 className="font-semibold text-brand-brown mb-2">
                  Letter Details
                </h4>
                <div className="space-y-1 text-sm">
                  {letter.book_number && (
                    <p>
                      <span className="font-medium">Book Number:</span>{" "}
                      {letter.book_number}
                    </p>
                  )}
                  {letter.page_no && (
                    <p>
                      <span className="font-medium">Page:</span>{" "}
                      {letter.page_no}
                    </p>
                  )}
                  {letter.letter_date && (
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(letter.letter_date).toLocaleDateString()}
                    </p>
                  )}
                  {letter.recipient_name && (
                    <p>
                      <span className="font-medium">Recipient:</span>{" "}
                      {letter.recipient_name}
                    </p>
                  )}
                  {letter.recipient_town && (
                    <p>
                      <span className="font-medium">Town:</span>{" "}
                      {letter.recipient_town}
                    </p>
                  )}
                  {letter.recipient_county && (
                    <p>
                      <span className="font-medium">County:</span>{" "}
                      {letter.recipient_county}
                    </p>
                  )}
                  {letter.recipient_state && (
                    <p>
                      <span className="font-medium">State:</span>{" "}
                      {letter.recipient_state}
                    </p>
                  )}
                  {letter.source_office && (
                    <p>
                      <span className="font-medium">Source Office:</span>{" "}
                      {letter.source_office}
                    </p>
                  )}
                  {letter.salutation && (
                    <p>
                      <span className="font-medium">Salutation:</span>{" "}
                      {letter.salutation}
                    </p>
                  )}
                  {letter.closing && (
                    <p>
                      <span className="font-medium">Closing:</span>{" "}
                      {letter.closing}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-brand-brown mb-2">
                  Letter Content
                </h4>
                <div className="bg-gray-50 p-4 rounded-md text-sm max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-serif text-sm">
                    {letter.letter_body}
                  </pre>
                </div>
              </div>

              {letter.notes && (
                <div>
                  <h4 className="font-semibold text-brand-brown mb-2">Notes</h4>
                  <div className="bg-yellow-50 p-3 rounded-md text-sm">
                    <p>{letter.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Zoom Overlay */}
      {isImageZoomed && imagePath && (
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
                handlePrevLetter();
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
                handleNextLetter();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <ChevronRight className="w-8 h-8 text-gray-700" />
            </button>
          )}

          {/* Page Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg z-10">
            <p className="text-sm font-medium text-gray-700">
              Letter {currentIndex + 1} of {allLetters.length}
            </p>
          </div>

          {/* Zoomed Image */}
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imagePath}
              alt={`${letter.book_title}`}
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

const ExSlavePensionPage = () => {
  const [letters, setLetters] = useState<ExSlavePensionLetter[]>([]);
  const [filteredLetters, setFilteredLetters] = useState<
    ExSlavePensionLetter[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] =
    useState<ExSlavePensionLetter | null>(null);
  const [clickedLetterId, setClickedLetterId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookFilter, setBookFilter] = useState<number | null>(null);
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const { data, error } = await supabase
          .from("ex-slave-pension")
          .select("*, ex_slave_pension_images(public_url)")
          .order("book_number", { ascending: true })
          .order("page_no", { ascending: true });

        if (error) {
          console.error("Error fetching letters:", error);
        } else if (data) {
          setLetters(data);
          setFilteredLetters(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLetters();
  }, []);

  useEffect(() => {
    let filtered = letters;

    if (searchTerm) {
      filtered = filtered.filter(
        (letter) =>
          letter.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          letter.recipient_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          letter.recipient_town
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          letter.recipient_county
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          letter.letter_body?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (bookFilter) {
      filtered = filtered.filter((letter) => letter.book_number === bookFilter);
    }

    if (stateFilter) {
      filtered = filtered.filter(
        (letter) => letter.recipient_state === stateFilter
      );
    }

    setFilteredLetters(filtered);
    setCurrentPage(1);
  }, [searchTerm, bookFilter, stateFilter, letters]);

  const totalPages = Math.ceil(filteredLetters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredLetters.slice(startIndex, endIndex);

  const uniqueBooks = [
    ...new Set(letters.map((l) => l.book_number).filter(Boolean)),
  ].sort((a, b) => a! - b!);
  const uniqueStates = [
    ...new Set(letters.map((l) => l.recipient_state).filter(Boolean)),
  ].sort();

  const handleLetterClick = React.useCallback(
    (letter: ExSlavePensionLetter) => {
      setClickedLetterId(letter.id);

      React.startTransition(() => {
        setTimeout(() => {
          setSelectedLetter(letter);
          setClickedLetterId(null);
        }, 50);
      });
    },
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <FileText className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Case Files Concerning the Formerly Enslaved
              </h1>
              <p className="text-lg text-white/90">
                Individual case files related to pension claims by formerly enslaved persons.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
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
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Case Files Concerning the Formerly Enslaved
            </h1>
            <p className="text-lg text-white/90">
              Individual case files related to pension claims by formerly
              enslaved persons from the Ex-Slave Pension Fraud Files collection.
              These letters and documents provide insights into the lives and
              struggles of formerly enslaved individuals seeking compensation.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <Input
              type="search"
              placeholder="Search letters, names, locations..."
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
              onChange={(e) =>
                setBookFilter(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
            >
              <option value="">All Books</option>
              {uniqueBooks.map((book) => (
                <option key={book} value={book!}>
                  Book {book}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              value={stateFilter || ""}
              onChange={(e) => setStateFilter(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green"
            >
              <option value="">All States</option>
              {uniqueStates.map((state) => (
                <option key={state} value={state!}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Button
              onClick={() => {
                setSearchTerm("");
                setBookFilter(null);
                setStateFilter(null);
              }}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Showing {filteredLetters.length} of {letters.length} letters
        </p>
      </div>

      {filteredLetters.length === 0 ? (
        <div className="container mx-auto px-4">
          <EmptyState
            type="no-results"
            title="No Letters Found"
            description="No letters match your current search or filter criteria. Try adjusting your search terms, book number, or state filter."
            actionLabel="Clear All Filters"
            onAction={() => {
              setSearchTerm("");
              setBookFilter(null);
              setStateFilter(null);
            }}
          />
        </div>
      ) : (
        <div className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentPageData.map((letter) => {
              const imagePath =
                letter.ex_slave_pension_images?.[0]?.public_url ||
                (letter.slug
                  ? `${letter.storage_base_url}/${letter.slug}.jpg`
                  : null);

              return (
                <div
                  key={letter.id}
                  onClick={() => handleLetterClick(letter)}
                  className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow group ${
                    clickedLetterId === letter.id
                      ? "ring-2 ring-brand-green scale-95"
                      : ""
                  }`}
                >
                  {/* Loading Overlay when clicked */}
                  {clickedLetterId === letter.id && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20 rounded-lg">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
                    </div>
                  )}

                  {imagePath && (
                    <div className="relative h-40 bg-gray-100">
                      <Image
                        src={imagePath}
                        alt={letter.book_title}
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
                        <BookmarkButton pageId={letter.id} size={18} />
                      </div>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-semibold text-sm text-brand-brown">
                      {letter.book_title}
                    </p>
                    {letter.book_number && (
                      <p className="text-xs text-gray-500 mt-1">
                        Book {letter.book_number}
                        {letter.page_no && `, Page ${letter.page_no}`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    currentPage <= 3
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-gray-600 mt-4">
            Page {currentPage} of {totalPages}({startIndex + 1}-
            {Math.min(endIndex, filteredLetters.length)} of{" "}
            {filteredLetters.length} letters)
          </div>
        </div>
      )}

      <LetterModal
        letter={selectedLetter}
        onClose={() => setSelectedLetter(null)}
        allLetters={filteredLetters}
        onNavigate={(letter) => setSelectedLetter(letter)}
      />
    </div>
  );
};

const WrappedExSlavePensionPage = () => {
  return (
    <ProtectedRoute requiresPaid={true}>
      <ExSlavePensionPage />
    </ProtectedRoute>
  );
};

export default WrappedExSlavePensionPage;

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

interface SlaveImportationRecord {
  id: string;
  page_number: number;
  image_url: string;
  by_whom_enslaved: string | null;
  name: string | null;
  age: string | null;
  sex: string | null;
  height_description: string | null;
  complexion: string | null;
  notes: string | null;
  where_to: string | null;
  where_from: string | null;
}

export const dynamic = "force-dynamic";

export default function GeorgiaSlaveImportationPage() {
  const { profile } = useAuth();
  const isPremiumOrAdmin = profile?.subscription_status === "paid" || profile?.role === "admin";

  const [records, setRecords] = useState<SlaveImportationRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SlaveImportationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<SlaveImportationRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageZoom, setImageZoom] = useState(1);
  const recordsPerPage = 20;

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 30000)
    );

    try {
      let allRecords: SlaveImportationRecord[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;
      let batchCount = 0;
      const maxBatches = 50; // Safety limit

      while (hasMore && batchCount < maxBatches) {
        const fetchPromise = supabase
          .from("slave-importation-ga")
          .select("*")
          .order("page_number", { ascending: true })
          .range(from, from + batchSize - 1);

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

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
    } catch (err: any) {
      console.error("Error fetching records:", err);
      setError(err.message || "Failed to load records. Please try again later.");
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
    const filtered = records.filter((record) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        record.name?.toLowerCase().includes(searchLower) ||
        record.by_whom_enslaved?.toLowerCase().includes(searchLower) ||
        record.where_from?.toLowerCase().includes(searchLower) ||
        record.where_to?.toLowerCase().includes(searchLower) ||
        record.age?.toLowerCase().includes(searchLower) ||
        record.sex?.toLowerCase().includes(searchLower) ||
        record.complexion?.toLowerCase().includes(searchLower) ||
        record.notes?.toLowerCase().includes(searchLower) ||
        record.page_number?.toString().includes(searchLower)
      );
    });
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, records]);

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handleRecordClick = (record: SlaveImportationRecord) => {
    setSelectedRecord(record);
    setImageZoom(1);
  };

  const closeModal = useCallback(() => {
    setSelectedRecord(null);
    setImageZoom(1);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closeModal]);

  const navigateRecord = (direction: "prev" | "next") => {
    if (!selectedRecord) return;
    const currentIndex = filteredRecords.findIndex((r) => r.id === selectedRecord.id);
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < filteredRecords.length) {
      setSelectedRecord(filteredRecords[newIndex]);
      setImageZoom(1);
    }
  };

  useEffect(() => {
    const handleArrowKeys = (e: KeyboardEvent) => {
      if (!selectedRecord) return;
      if (e.key === "ArrowLeft") navigateRecord("prev");
      if (e.key === "ArrowRight") navigateRecord("next");
    };
    window.addEventListener("keydown", handleArrowKeys);
    return () => window.removeEventListener("keydown", handleArrowKeys);
  }, [selectedRecord, filteredRecords]);

  if (!isPremiumOrAdmin) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-brand-green" />
          <h1 className="text-2xl font-bold text-brand-brown mb-4">
            Premium Content
          </h1>
          <p className="text-gray-700 mb-6">
            Access to Georgia Slave Importation Records requires a premium membership.
          </p>
          <a
            href="/membership"
            className="inline-block bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-brand-darkgreen transition-colors"
          >
            Upgrade to Premium
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="w-12 h-12 mx-auto mb-3" />
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Georgia Slave Importation Records
            </h1>
            <p className="text-base text-white/90">
              Declarations of enslaved persons imported into Georgia
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Search and Stats */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by name, enslaver, location, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredRecords.length} of {records.length} records
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading importation records...</p>
            </div>
          ) : error ? (
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
          ) : currentRecords.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No records found matching your search.</p>
            </div>
          ) : (
            <>
              {/* Records Table */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-brand-green text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Page</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Age</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Sex</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">By Whom Enslaved</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">From</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">To</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentRecords.map((record) => (
                        <tr
                          key={record.id}
                          onClick={() => handleRecordClick(record)}
                          className="hover:bg-brand-tan/30 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 text-sm">{record.page_number}</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {record.name || <span className="text-gray-400 italic">Not specified</span>}
                          </td>
                          <td className="px-4 py-3 text-sm">{record.age || "-"}</td>
                          <td className="px-4 py-3 text-sm">{record.sex || "-"}</td>
                          <td className="px-4 py-3 text-sm">
                            {record.by_whom_enslaved || <span className="text-gray-400">-</span>}
                          </td>
                          <td className="px-4 py-3 text-sm">{record.where_from || "-"}</td>
                          <td className="px-4 py-3 text-sm">{record.where_to || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-brand-brown">
                Page {selectedRecord.page_number}
                {selectedRecord.name && ` - ${selectedRecord.name}`}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigateRecord("prev")}
                  disabled={filteredRecords.findIndex((r) => r.id === selectedRecord.id) === 0}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => navigateRecord("next")}
                  disabled={
                    filteredRecords.findIndex((r) => r.id === selectedRecord.id) ===
                    filteredRecords.length - 1
                  }
                  variant="outline"
                  size="sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button onClick={closeModal} variant="outline" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              {/* Image Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-brand-brown">Declaration Page</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                      variant="outline"
                      size="sm"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600">{Math.round(imageZoom * 100)}%</span>
                    <Button
                      onClick={() => setImageZoom((z) => Math.min(3, z + 0.25))}
                      variant="outline"
                      size="sm"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg overflow-auto bg-gray-50 max-h-[500px]">
                  <div style={{ transform: `scale(${imageZoom})`, transformOrigin: "top left" }}>
                    <Image
                      src={selectedRecord.image_url}
                      alt={`Declaration page ${selectedRecord.page_number}`}
                      width={800}
                      height={1000}
                      className="w-full h-auto"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              {/* Record Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-brand-brown mb-3">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-brand-tan/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Name</div>
                      <div className="font-semibold">
                        {selectedRecord.name || <span className="text-gray-400 italic">Not specified</span>}
                      </div>
                    </div>
                    <div className="bg-brand-tan/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">By Whom Enslaved</div>
                      <div className="font-semibold">
                        {selectedRecord.by_whom_enslaved || <span className="text-gray-400">-</span>}
                      </div>
                    </div>
                    <div className="bg-brand-tan/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Age</div>
                      <div className="font-semibold">{selectedRecord.age || "-"}</div>
                    </div>
                    <div className="bg-brand-tan/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Sex</div>
                      <div className="font-semibold">{selectedRecord.sex || "-"}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-md font-semibold text-brand-brown mb-2">Physical Description</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-brand-tan/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Height/Description</div>
                      <div className="font-semibold">
                        {selectedRecord.height_description || <span className="text-gray-400">-</span>}
                      </div>
                    </div>
                    <div className="bg-brand-tan/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Complexion</div>
                      <div className="font-semibold">
                        {selectedRecord.complexion || <span className="text-gray-400">-</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-md font-semibold text-brand-brown mb-2">Location Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-brand-tan/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Where From</div>
                      <div className="font-semibold">
                        {selectedRecord.where_from || <span className="text-gray-400">-</span>}
                      </div>
                    </div>
                    <div className="bg-brand-tan/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Where To</div>
                      <div className="font-semibold">
                        {selectedRecord.where_to || <span className="text-gray-400">-</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedRecord.notes && (
                  <div className="bg-brand-tan/20 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Notes</div>
                    <div className="text-gray-700">{selectedRecord.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

interface CreekCensusRecord {
  id: string;
  seq_no: number | null;
  principal_name: string | null;
  males: number | null;
  females: number | null;
  slaves: number | null;
  total: number | null;
  town_section: string | null;
  page_number: number;
  image_url: string;
  notes: string | null;
}

export const dynamic = "force-dynamic";

export default function CreekCensus1832Page() {
  const { profile } = useAuth();
  const isPremiumOrAdmin = profile?.subscription_status === "paid" || profile?.role === "admin";

  const [records, setRecords] = useState<CreekCensusRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CreekCensusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<CreekCensusRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageZoom, setImageZoom] = useState(1);
  const recordsPerPage = 20;

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("creek-census")
        .select("*")
        .order("page_number", { ascending: true })
        .order("seq_no", { ascending: true });

      if (error) throw error;

      setRecords(data || []);
      setFilteredRecords(data || []);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = records.filter((record) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        record.principal_name?.toLowerCase().includes(searchLower) ||
        record.town_section?.toLowerCase().includes(searchLower) ||
        record.page_number?.toString().includes(searchLower) ||
        record.seq_no?.toString().includes(searchLower) ||
        record.notes?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, records]);

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handleRecordClick = (record: CreekCensusRecord) => {
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
          <Users className="w-16 h-16 mx-auto mb-4 text-brand-green" />
          <h1 className="text-2xl font-bold text-brand-brown mb-4">
            Premium Content
          </h1>
          <p className="text-gray-700 mb-6">
            Access to the Creek Census 1832 (Parsons Abbott Roll) requires a premium membership.
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
            <Users className="w-12 h-12 mx-auto mb-3" />
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Creek Census 1832 (Parsons Abbott Roll)
            </h1>
            <p className="text-base text-white/90">
              Census of Creek Nation members conducted in 1832
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
                  placeholder="Search by name, town/section, page, or notes..."
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
              <p className="mt-4 text-gray-600">Loading census records...</p>
            </div>
          ) : currentRecords.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
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
                        <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Principal Name / Head of Family</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Males</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Females</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Slaves</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Town/Section</th>
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
                          <td className="px-4 py-3 text-sm">{record.seq_no || "-"}</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {record.principal_name || <span className="text-gray-400 italic">Not specified</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-center">{record.males ?? "-"}</td>
                          <td className="px-4 py-3 text-sm text-center">{record.females ?? "-"}</td>
                          <td className="px-4 py-3 text-sm text-center">{record.slaves ?? "-"}</td>
                          <td className="px-4 py-3 text-sm text-center font-semibold">{record.total ?? "-"}</td>
                          <td className="px-4 py-3 text-sm">
                            {record.town_section || <span className="text-gray-400">-</span>}
                          </td>
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
                {selectedRecord.seq_no && ` - #${selectedRecord.seq_no}`}
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
                  <h4 className="text-lg font-semibold text-brand-brown">Census Page Image</h4>
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
                      alt={`Census page ${selectedRecord.page_number}`}
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
                  <h4 className="text-lg font-semibold text-brand-brown mb-3">Record Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-brand-tan/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Principal Name / Head of Family</div>
                      <div className="font-semibold">
                        {selectedRecord.principal_name || <span className="text-gray-400 italic">Not specified</span>}
                      </div>
                    </div>
                    <div className="bg-brand-tan/20 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Town/Section</div>
                      <div className="font-semibold">
                        {selectedRecord.town_section || <span className="text-gray-400">-</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-md font-semibold text-brand-brown mb-2">Demographics</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-brand-tan/20 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600 mb-1">Males</div>
                      <div className="text-2xl font-bold text-brand-green">{selectedRecord.males ?? "-"}</div>
                    </div>
                    <div className="bg-brand-tan/20 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600 mb-1">Females</div>
                      <div className="text-2xl font-bold text-brand-green">{selectedRecord.females ?? "-"}</div>
                    </div>
                    <div className="bg-brand-tan/20 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600 mb-1">Slaves</div>
                      <div className="text-2xl font-bold text-brand-green">{selectedRecord.slaves ?? "-"}</div>
                    </div>
                    <div className="bg-brand-tan/20 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-600 mb-1">Total</div>
                      <div className="text-2xl font-bold text-brand-brown">{selectedRecord.total ?? "-"}</div>
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

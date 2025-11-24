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
import Link from "next/link";

interface KentuckyImportationRecord {
  id: string;
  page_number: number;
  image_url: string;
  by_whom_enslaved: string | null;
  name: string | null;
  age: string | null;
  sex: string | null;
  complexion: string | null;
  where_to: string | null;
  where_from: string | null;
}

export const dynamic = "force-dynamic";

export default function KentuckySlaveImportationPage() {
  const { profile } = useAuth();
  const isPremiumOrAdmin = profile?.subscription_status === "paid" || profile?.role === "admin";

  const [records, setRecords] = useState<KentuckyImportationRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<KentuckyImportationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<KentuckyImportationRecord | null>(null);
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
      let allRecords: KentuckyImportationRecord[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;
      let batchCount = 0;
      const maxBatches = 50; // Safety limit

      while (hasMore && batchCount < maxBatches) {
        const fetchPromise = supabase
          .from("slave-importation-ky")
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

  const handleZoomIn = () => setImageZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setImageZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setImageZoom(1);

  if (!isPremiumOrAdmin) {
    return (
      <div className="min-h-screen bg-brand-beige">
        <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <FileText className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Kentucky Slave Importation Records
              </h1>
              <p className="text-lg text-white/90">
                Import Declarations and Manifests
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-brand-brown mb-4">
                Premium Access Required
              </h2>
              <p className="text-gray-700 mb-6">
                This collection is available exclusively to premium members. Upgrade your
                membership to access Kentucky slave importation records.
              </p>
              <Link href="/membership">
                <Button className="bg-brand-green hover:bg-brand-darkgreen">
                  Get Premium Access
                </Button>
              </Link>
            </div>
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
              Kentucky Slave Importation Records
            </h1>
            <p className="text-lg text-white/90">
              Declarations of enslaved persons imported into Kentucky
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Info Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-brand-brown mb-4">
              About This Collection
            </h2>
            <p className="text-gray-700 mb-4">
              These records document enslaved persons who were imported into Kentucky.
              The declarations typically include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Names of enslaved individuals</li>
              <li>Names of enslavers</li>
              <li>Origin and destination locations</li>
              <li>Physical descriptions (age, sex, complexion)</li>
              <li>Legal declarations required for interstate movement</li>
            </ul>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by name, enslaver, location, age, sex, complexion, or page..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="text-sm text-gray-600 text-center">
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
                        <th className="px-4 py-3 text-left text-sm font-semibold">Complexion</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">By Whom Enslaved</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">From</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">To</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentRecords.map((record) => (
                        <tr
                          key={record.id}
                          onClick={() => setSelectedRecord(record)}
                          className="hover:bg-brand-tan/30 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 text-sm">{record.page_number}</td>
                          <td className="px-4 py-3 text-sm font-medium">{record.name || "-"}</td>
                          <td className="px-4 py-3 text-sm">{record.age || "-"}</td>
                          <td className="px-4 py-3 text-sm">{record.sex || "-"}</td>
                          <td className="px-4 py-3 text-sm">{record.complexion || "-"}</td>
                          <td className="px-4 py-3 text-sm">{record.by_whom_enslaved || "-"}</td>
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
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand-brown">
                Record Details - Page {selectedRecord.page_number}
              </h2>
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  handleResetZoom();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
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
                      <Image
                        src={selectedRecord.image_url}
                        alt={`Page ${selectedRecord.page_number}`}
                        width={800}
                        height={1000}
                        className="w-full"
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
                      <p className="text-sm text-gray-600 mb-1">Page Number</p>
                      <p className="text-lg font-medium text-brand-brown">
                        {selectedRecord.page_number}
                      </p>
                    </div>

                    {selectedRecord.name && (
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-1">Name</p>
                        <p className="text-base text-gray-900 font-medium">
                          {selectedRecord.name}
                        </p>
                      </div>
                    )}

                    {selectedRecord.age && (
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-1">Age</p>
                        <p className="text-base text-gray-900">{selectedRecord.age}</p>
                      </div>
                    )}

                    {selectedRecord.sex && (
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-1">Sex</p>
                        <p className="text-base text-gray-900">{selectedRecord.sex}</p>
                      </div>
                    )}

                    {selectedRecord.complexion && (
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-1">Complexion</p>
                        <p className="text-base text-gray-900">{selectedRecord.complexion}</p>
                      </div>
                    )}

                    {selectedRecord.by_whom_enslaved && (
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-1">By Whom Enslaved</p>
                        <p className="text-base text-gray-900">
                          {selectedRecord.by_whom_enslaved}
                        </p>
                      </div>
                    )}

                    {selectedRecord.where_from && (
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-1">From</p>
                        <p className="text-base text-gray-900">{selectedRecord.where_from}</p>
                      </div>
                    )}

                    {selectedRecord.where_to && (
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-1">To</p>
                        <p className="text-base text-gray-900">{selectedRecord.where_to}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

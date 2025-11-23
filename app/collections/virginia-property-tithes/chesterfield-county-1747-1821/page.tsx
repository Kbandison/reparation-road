"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  ScrollText,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface ChesterfieldRecord {
  id: string;
  page_number: number;
  image_url: string;
  state_county: string | null;
  date: string | null;
  enslaver_family: string | null;
  enslaved_persons: string | null;
  total: number | null;
}

export const dynamic = "force-dynamic";

export default function ChesterfieldCountyPage() {
  const { profile } = useAuth();
  const isPremiumOrAdmin =
    profile?.subscription_status === "paid" || profile?.role === "admin";

  const [records, setRecords] = useState<ChesterfieldRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ChesterfieldRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<ChesterfieldRecord | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      let allRecords: ChesterfieldRecord[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("va-personal-chesterfield")
          .select("*")
          .order("page_number", { ascending: true })
          .range(from, from + batchSize - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allRecords = [...allRecords, ...data];
          from += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      setRecords(allRecords);
      setFilteredRecords(allRecords);
    } catch (error) {
      console.error("Error fetching records:", error);
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
        record.state_county?.toLowerCase().includes(searchLower) ||
        record.date?.toLowerCase().includes(searchLower) ||
        record.enslaver_family?.toLowerCase().includes(searchLower) ||
        record.enslaved_persons?.toLowerCase().includes(searchLower) ||
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
              <ScrollText className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Chesterfield County 1747-1821
              </h1>
              <p className="text-lg text-white/90">
                Personal Property and Tithe Records
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
                membership to access Chesterfield County tax and tithe records.
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
            <ScrollText className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Chesterfield County 1747-1821
            </h1>
            <p className="text-lg text-white/90">
              Personal property and tithe records documenting enslaved persons and property ownership
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
              These tax and tithe records from Chesterfield County, Virginia provide valuable
              genealogical information spanning from 1747 to 1821. Records include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Names of enslaver families</li>
              <li>Names and counts of enslaved persons</li>
              <li>County and geographic information</li>
              <li>Dates of tax assessments</li>
              <li>Property valuations and totals</li>
            </ul>
          </div>

          {/* Search and Stats */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search by enslaver family, county, date, or page number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600 whitespace-nowrap">
                {filteredRecords.length} of {records.length} records
              </div>
            </div>
          </div>

          {/* Records Table */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading records...</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-brand-green text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Page</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">County</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Enslaver Family
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Enslaved Persons
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentRecords.map((record) => (
                        <tr
                          key={record.id}
                          onClick={() => setSelectedRecord(record)}
                          className="hover:bg-brand-tan/30 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.page_number}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {record.state_county || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {record.date || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {record.enslaver_family || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {record.enslaved_persons || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.total || "-"}
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

                    {selectedRecord.state_county && (
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-1">County</p>
                        <p className="text-base text-gray-900">
                          {selectedRecord.state_county}
                        </p>
                      </div>
                    )}

                    {selectedRecord.date && (
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-1">Date</p>
                        <p className="text-base text-gray-900">{selectedRecord.date}</p>
                      </div>
                    )}

                    {selectedRecord.enslaver_family && (
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-1">Enslaver Family</p>
                        <p className="text-base text-gray-900 font-medium">
                          {selectedRecord.enslaver_family}
                        </p>
                      </div>
                    )}

                    {selectedRecord.enslaved_persons && (
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-1">Enslaved Persons</p>
                        <p className="text-base text-gray-900">
                          {selectedRecord.enslaved_persons}
                        </p>
                      </div>
                    )}

                    {selectedRecord.total !== null && (
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-1">Total</p>
                        <p className="text-base text-gray-900">{selectedRecord.total}</p>
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

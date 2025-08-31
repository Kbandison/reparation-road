/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CensusRecord {
  id: number;
  town: string;
  name: string;
  age?: number;
  family_count?: string;
  date?: string;
  where_born?: string;
  connexions?: string;
  profession?: string;
  education?: string;
  health?: string;
}

const LiberationCensusRollsPage = () => {
  const [records, setRecords] = useState<CensusRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CensusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<CensusRecord | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 25;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data, error } = await supabase
          .from("liberation_census_rolls")
          .select("*")
          .order("id", { ascending: true });

        if (error) {
          console.error("Error fetching census records:", error);
          setError("Failed to load census records. Please try again later.");
        } else {
          setRecords(data || []);
          setFilteredRecords(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to connect to database. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  useEffect(() => {
    const filtered = records.filter(
      (record) =>
        record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.town?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.where_born?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.education?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.connexions?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.health?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.date?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, records]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handleRowClick = (record: CensusRecord) => {
    setSelectedRecord(record);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-xl">Loading liberian census records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="text-sm breadcrumbs mb-4">
          <ol className="flex items-center space-x-2 text-brand-brown">
            <li>
              <a href="/collections/acs" className="hover:underline">
                African Colonization Society
              </a>
            </li>
            <li className="text-gray-500">/</li>
            <li className="font-semibold">Liberian Census Rolls</li>
          </ol>
        </nav>

        <h1 className="text-4xl font-bold text-brand-brown mb-4">
          Liberian Census Rolls
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Census records documenting liberated Africans in various settlements.
          These records provide valuable information about the demographics,
          origins, and conditions of freed individuals in post-emancipation
          communities. Click on any row to view detailed information.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
          <Input
            type="search"
            placeholder="Search by name, town, birthplace, or profession..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
          />
          <p className="text-sm text-gray-600">
            Showing {filteredRecords.length} of {records.length} records
          </p>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            {records.length === 0
              ? "No census records found in the database."
              : "No records found matching your search."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full text-sm text-left">
              <thead className="bg-brand-tan text-brand-brown">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Town</th>
                  <th className="px-4 py-3 font-semibold">Age</th>
                  <th className="px-4 py-3 font-semibold">Family Count</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Where Born</th>
                  <th className="px-4 py-3 font-semibold">Connexions</th>
                  <th className="px-4 py-3 font-semibold">Profession</th>
                  <th className="px-4 py-3 font-semibold">Education</th>
                  <th className="px-4 py-3 font-semibold">Health</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => handleRowClick(record)}
                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-brand-brown">
                      {record.name}
                    </td>
                    <td className="px-4 py-3">{record.town}</td>
                    <td className="px-4 py-3">{record.age || "—"}</td>
                    <td className="px-4 py-3">{record.family_count || "—"}</td>
                    <td className="px-4 py-3">{record.date || "—"}</td>
                    <td className="px-4 py-3">{record.where_born || "—"}</td>
                    <td className="px-4 py-3">{record.connexions || "—"}</td>
                    <td className="px-4 py-3">{record.profession || "—"}</td>
                    <td className="px-4 py-3">{record.education || "—"}</td>
                    <td className="px-4 py-3">{record.health || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
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
            {Math.min(endIndex, filteredRecords.length)} of{" "}
            {filteredRecords.length} records)
          </div>
        </>
      )}

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative rounded-2xl shadow-2xl border border-brand-green bg-brand-tan w-[90vw] max-w-lg p-4 md:p-8 flex flex-col items-center max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 w-full">
              <span className="text-lg font-serif text-brand-brown">
                Census Record Details
              </span>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-full p-2 text-brand-green hover:bg-brand-green hover:text-brand-tan transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="w-full text-left space-y-2">
              <div>
                <span className="font-semibold text-brand-brown">Name:</span>
                <span className="ml-2 text-gray-700">
                  {selectedRecord.name}
                </span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">Town:</span>
                <span className="ml-2 text-gray-700">
                  {selectedRecord.town}
                </span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">Age:</span>
                <span className="ml-2 text-gray-700">
                  {selectedRecord.age || "Not recorded"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">
                  Family Count:
                </span>
                <span className="ml-2 text-gray-700">
                  {selectedRecord.family_count || "Not recorded"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">Date:</span>
                <span className="ml-2 text-gray-700">
                  {selectedRecord.date || "Not recorded"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">
                  Where Born:
                </span>
                <span className="ml-2 text-gray-700">
                  {selectedRecord.where_born || "Not recorded"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">
                  Connexions:
                </span>
                <span className="ml-2 text-gray-700">
                  {selectedRecord.connexions || "Not recorded"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">
                  Profession:
                </span>
                <span className="ml-2 text-gray-700">
                  {selectedRecord.profession || "Not recorded"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">
                  Education:
                </span>
                <span className="ml-2 text-gray-700">
                  {selectedRecord.education || "Not recorded"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">Health:</span>
                <span className="ml-2 text-gray-700">
                  {selectedRecord.health || "Not recorded"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiberationCensusRollsPage;

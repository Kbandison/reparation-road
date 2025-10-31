"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Search, X, BookOpen } from "lucide-react";

const UpgradePrompt = () => {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto p-8">
        <div className="mb-6">
          <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-brand-brown mb-4">
            Premium Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            Access to Enslaved Persons Mentioned in Alabama Episcopal Registers requires a premium membership.
            Discover historical church records from Alabama.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Full access to all historical data</span>
          </div>
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Advanced search and filtering</span>
          </div>
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Download and export capabilities</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/membership')}
            className="w-full bg-brand-green text-white hover:bg-brand-darkgreen"
            size="lg"
          >
            Upgrade to Premium - $7.99/month
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Don&apos;t have an account?</p>
            <div className="space-x-2">
              <Button
                onClick={() => setShowSignup(true)}
                variant="outline"
                size="sm"
              >
                Sign Up Free
              </Button>
              <Button
                onClick={() => setShowLogin(true)}
                variant="outline"
                size="sm"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modals */}
      {showLogin && (
        <LoginForm
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

      {showSignup && (
        <SignupForm
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
};

interface AlabamaRecord {
  id: string;
  name: string;
  "Birthdate/Place": string | null;
  "Entry Type": string | null;
  "Parish": string | null;
  "Minister": string | null;
  "Parents": string | null;
  "Sponsors": string | null;
  "Notes": string | null;
  slug: string | null;
}

const AlabamaEpiscopalPage = () => {
  const [records, setRecords] = useState<AlabamaRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AlabamaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<AlabamaRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        let allRecords: AlabamaRecord[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from("enslaved_persons_alabama")
            .select("*")
            .order("name", { ascending: true })
            .range(from, from + batchSize - 1);

          if (error) {
            console.error("Error fetching records:", error);
            break;
          }

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
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  useEffect(() => {
    const filtered = records.filter(record =>
      record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record["Birthdate/Place"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.Parish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.Minister?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.Notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, records]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handleRowClick = (record: AlabamaRecord) => {
    setSelectedRecord(record);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-brand-brown">Loading records...</p>
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
            <BookOpen className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Enslaved Persons Mentioned in Alabama Episcopal Registers
            </h1>
            <p className="text-lg text-white/90">
              Episcopal church records from Alabama documenting enslaved individuals and their families
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by name, parish, minister..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <p className="text-sm text-gray-600 whitespace-nowrap">
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
            {/* Records Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-tan text-brand-brown">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Parish</th>
                    <th className="px-4 py-3 font-semibold">Entry Type</th>
                    <th className="px-4 py-3 font-semibold">Birthdate/Place</th>
                    <th className="px-4 py-3 font-semibold">Notes</th>
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
                      <td className="px-4 py-3">{record.Parish || '-'}</td>
                      <td className="px-4 py-3">{record["Entry Type"] || '-'}</td>
                      <td className="px-4 py-3">{record["Birthdate/Place"] || '-'}</td>
                      <td className="px-4 py-3">
                        {record.Notes ? (
                          <span className="line-clamp-1">{record.Notes}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
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
                        className={currentPage === pageNum ? "bg-brand-green hover:bg-brand-darkgreen" : ""}
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
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand-brown">Record Details</h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-3xl font-bold text-brand-brown mb-6">{selectedRecord.name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedRecord["Entry Type"] && (
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Entry Type</p>
                    <p className="text-lg text-gray-800">{selectedRecord["Entry Type"]}</p>
                  </div>
                )}

                {selectedRecord.Parish && (
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Parish</p>
                    <p className="text-lg text-gray-800">{selectedRecord.Parish}</p>
                  </div>
                )}

                {selectedRecord["Birthdate/Place"] && (
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Birthdate/Place</p>
                    <p className="text-gray-800">{selectedRecord["Birthdate/Place"]}</p>
                  </div>
                )}

                {selectedRecord.Minister && (
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Minister</p>
                    <p className="text-gray-800">{selectedRecord.Minister}</p>
                  </div>
                )}

                {selectedRecord.Parents && (
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Parents</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedRecord.Parents}</p>
                  </div>
                )}

                {selectedRecord.Sponsors && (
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Sponsors</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedRecord.Sponsors}</p>
                  </div>
                )}

                {selectedRecord.Notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedRecord.Notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Episcopal church records from Alabama documenting enslaved individuals and their families.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WrappedAlabamaEpiscopalPage = () => {
  return (
    <ProtectedRoute requiresPaid={true} fallback={<UpgradePrompt />}>
      <AlabamaEpiscopalPage />
    </ProtectedRoute>
  );
};

export default WrappedAlabamaEpiscopalPage;

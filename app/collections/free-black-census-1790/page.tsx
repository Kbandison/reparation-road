"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Search, X, Users } from "lucide-react";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { RecordCitation } from "@/components/ui/RecordCitation";
import { RelatedRecords } from "@/components/ui/RelatedRecords";

const UpgradePrompt = () => {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto p-8">
        <div className="mb-6">
          <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-brand-brown mb-4">
            Premium Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            Access to Free Black Heads of Household records from the 1790 Census requires a premium membership.
            Discover free Black households from America&apos;s first census.
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

interface HouseholdRecord {
  id: string;
  name: string;
  state: string | null;
  notes: string | null;
  num_in_family: number | null;
  slug: string | null;
}

const FreeBlackCensusPage = () => {
  const [records, setRecords] = useState<HouseholdRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HouseholdRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<HouseholdRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        let allRecords: HouseholdRecord[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from("free_black_heads_of_household")
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
      record.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, records]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handleRowClick = (record: HouseholdRecord) => {
    setSelectedRecord(record);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-brand-brown">Loading census records...</p>
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
            <Users className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Free Black Heads of Household
            </h1>
            <p className="text-lg text-white/90">
              First US Census 1790 - Records of free Black household heads from America&apos;s inaugural census
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
                placeholder="Search by name, state, or notes..."
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
                    <th className="px-4 py-3 font-semibold">State</th>
                    <th className="px-4 py-3 font-semibold">Family Size</th>
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
                      <td className="px-4 py-3">{record.state || '-'}</td>
                      <td className="px-4 py-3">{record.num_in_family !== null ? record.num_in_family : '-'}</td>
                      <td className="px-4 py-3">
                        {record.notes ? (
                          <span className="line-clamp-1">{record.notes}</span>
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
              <h2 className="text-2xl font-bold text-brand-brown">Household Record Details</h2>
              <div className="flex items-center gap-3">
                <BookmarkButton
                  pageId={selectedRecord.id}
                  collectionName="Free Black Heads of Household"
                  collectionSlug="free-black-census-1790"
                  recordTitle={selectedRecord.name}
                  size={24}
                  showLabel={true}
                />
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-3xl font-bold text-brand-brown mb-6">{selectedRecord.name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm font-semibold text-gray-500 mb-1">State</p>
                  <p className="text-lg text-gray-800">{selectedRecord.state || 'Not recorded'}</p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="text-sm font-semibold text-gray-500 mb-1">Family Size</p>
                  <p className="text-lg text-gray-800">
                    {selectedRecord.num_in_family !== null ? `${selectedRecord.num_in_family} ${selectedRecord.num_in_family === 1 ? 'person' : 'people'}` : 'Not recorded'}
                  </p>
                </div>

                {selectedRecord.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedRecord.notes}</p>
                  </div>
                )}
              </div>

              <RelatedRecords
                currentRecordId={selectedRecord.id}
                currentTable="free_black_heads_of_household"
                searchTerms={{
                  name: selectedRecord.name,
                  location: selectedRecord.state || undefined,
                }}
                collectionSlug="free-black-census-1790"
              />

              <RecordCitation
                collectionName="Free Black Heads of Household (1790 Census)"
                recordIdentifier={selectedRecord.name}
                recordDetails={{
                  name: selectedRecord.name,
                }}
              />

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  This record is from the First United States Census conducted in 1790, documenting free Black heads of household.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WrappedFreeBlackCensusPage = () => {
  return (
    <ProtectedRoute requiresPaid={false} fallback={<UpgradePrompt />}>
      <FreeBlackCensusPage />
    </ProtectedRoute>
  );
};

export default WrappedFreeBlackCensusPage;

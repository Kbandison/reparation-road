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
            Access to Kentucky Enslaved Catholic Church Records requires a premium membership.
            Discover sacramental records of enslaved persons from Kentucky.
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

interface KentuckyRecord {
  page: string | null;
  transcription: string | null;
  baptism_date: string | null;
  church: string | null;
  county: string | null;
  birth_year: string | null;
  gender: string | null;
  child: string | null;
  child_s_last_name: string | null;
  child_s_alternate_last_name: string | null;
  mother_s_first: string | null;
  alternate_mother_s_first: string | null;
  mother_s_last_presumed_last: string | null;
  mother_s_enslaver_first: string | null;
  mother_s_enslaver_last: string | null;
  father_s_first: string | null;
  alternate_father_s_first: string | null;
  father_s_last: string | null;
  father_s_enslaver_first: string | null;
  father_s_enslaver_last: string | null;
  birth_date: string | null;
  age_at_baptism: string | null;
  female_spon_first: string | null;
  female_spon_presumed_last: string | null;
  female_spon_enslaver_first: string | null;
  female_spon_enslaver_last: string | null;
  male_spon_first: string | null;
  male_spon_presumed_last: string | null;
  male_spon_enslaver_first: string | null;
  male_spon_enslaver_last: string | null;
  enslaved_by_agent_of_the_church: string | null;
  notes: string | null;
}

const KentuckyCatholicPage = () => {
  const [records, setRecords] = useState<KentuckyRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<KentuckyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<KentuckyRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data, error } = await supabase
          .from("enslaved_catholic_kentuky")
          .select("*")
          .order("baptism_date", { ascending: true })
          .limit(100000);

        if (error) {
          console.error("Error fetching records:", error);
        } else {
          setRecords(data || []);
          setFilteredRecords(data || []);
        }
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
      record.child?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.church?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.county?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.mother_s_first?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.father_s_first?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [searchTerm, records]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handleRowClick = (record: KentuckyRecord) => {
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
              Kentucky Enslaved Catholic Church Records
            </h1>
            <p className="text-lg text-white/90">
              Catholic church records from Kentucky documenting enslaved persons and their sacramental records
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
                placeholder="Search by child, church, county..."
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
                    <th className="px-4 py-3 font-semibold">Child</th>
                    <th className="px-4 py-3 font-semibold">Church</th>
                    <th className="px-4 py-3 font-semibold">County</th>
                    <th className="px-4 py-3 font-semibold">Baptism Date</th>
                    <th className="px-4 py-3 font-semibold">Mother</th>
                    <th className="px-4 py-3 font-semibold">Father</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record, index) => (
                    <tr
                      key={record.page || index}
                      onClick={() => handleRowClick(record)}
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-brand-brown">
                        {record.child || '-'}
                      </td>
                      <td className="px-4 py-3">{record.church || '-'}</td>
                      <td className="px-4 py-3">{record.county || '-'}</td>
                      <td className="px-4 py-3">{record.baptism_date || '-'}</td>
                      <td className="px-4 py-3">{record.mother_s_first || '-'}</td>
                      <td className="px-4 py-3">{record.father_s_first || '-'}</td>
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
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand-brown">Baptism Record Details</h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-brand-brown mb-2">{selectedRecord.child || 'Unnamed'}</h3>
                {selectedRecord.church && <p className="text-lg text-gray-600">{selectedRecord.church}</p>}
              </div>

              {/* Child Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-brand-brown mb-3">Child Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedRecord.gender && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">Gender</p>
                      <p className="text-gray-800">{selectedRecord.gender}</p>
                    </div>
                  )}
                  {selectedRecord.birth_year && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">Birth Year</p>
                      <p className="text-gray-800">{selectedRecord.birth_year}</p>
                    </div>
                  )}
                  {selectedRecord.birth_date && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">Birth Date</p>
                      <p className="text-gray-800">{selectedRecord.birth_date}</p>
                    </div>
                  )}
                  {selectedRecord.age_at_baptism && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">Age at Baptism</p>
                      <p className="text-gray-800">{selectedRecord.age_at_baptism}</p>
                    </div>
                  )}
                  {selectedRecord.child_s_last_name && (
                    <div className="col-span-2">
                      <p className="text-sm font-semibold text-gray-500 mb-1">Last Name</p>
                      <p className="text-gray-800">{selectedRecord.child_s_last_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Baptism Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-brand-brown mb-3">Baptism Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedRecord.baptism_date && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">Date</p>
                      <p className="text-gray-800">{selectedRecord.baptism_date}</p>
                    </div>
                  )}
                  {selectedRecord.county && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">County</p>
                      <p className="text-gray-800">{selectedRecord.county}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Parents Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-brand-brown mb-3">Parents</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2">Mother</p>
                    {selectedRecord.mother_s_first && (
                      <p className="text-gray-800">{selectedRecord.mother_s_first}</p>
                    )}
                    {selectedRecord.mother_s_last_presumed_last && (
                      <p className="text-sm text-gray-600">Last: {selectedRecord.mother_s_last_presumed_last}</p>
                    )}
                    {selectedRecord.mother_s_enslaver_first && selectedRecord.mother_s_enslaver_last && (
                      <p className="text-sm text-gray-600">Enslaver: {selectedRecord.mother_s_enslaver_first} {selectedRecord.mother_s_enslaver_last}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2">Father</p>
                    {selectedRecord.father_s_first && (
                      <p className="text-gray-800">{selectedRecord.father_s_first}</p>
                    )}
                    {selectedRecord.father_s_last && (
                      <p className="text-sm text-gray-600">Last: {selectedRecord.father_s_last}</p>
                    )}
                    {selectedRecord.father_s_enslaver_first && selectedRecord.father_s_enslaver_last && (
                      <p className="text-sm text-gray-600">Enslaver: {selectedRecord.father_s_enslaver_first} {selectedRecord.father_s_enslaver_last}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sponsors */}
              {(selectedRecord.female_spon_first || selectedRecord.male_spon_first) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-brand-brown mb-3">Sponsors</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRecord.female_spon_first && (
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Female Sponsor</p>
                        <p className="text-gray-800">{selectedRecord.female_spon_first}</p>
                        {selectedRecord.female_spon_presumed_last && (
                          <p className="text-sm text-gray-600">Last: {selectedRecord.female_spon_presumed_last}</p>
                        )}
                      </div>
                    )}
                    {selectedRecord.male_spon_first && (
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Male Sponsor</p>
                        <p className="text-gray-800">{selectedRecord.male_spon_first}</p>
                        {selectedRecord.male_spon_presumed_last && (
                          <p className="text-sm text-gray-600">Last: {selectedRecord.male_spon_presumed_last}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {(selectedRecord.notes || selectedRecord.transcription || selectedRecord.page) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-brand-brown mb-3">Additional Information</h4>
                  {selectedRecord.page && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-500 mb-1">Page Reference</p>
                      <p className="text-gray-800">{selectedRecord.page}</p>
                    </div>
                  )}
                  {selectedRecord.transcription && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-500 mb-1">Transcription</p>
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedRecord.transcription}</p>
                    </div>
                  )}
                  {selectedRecord.notes && (
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1">Notes</p>
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedRecord.notes}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Catholic church records from Kentucky documenting enslaved persons and their sacramental records.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WrappedKentuckyCatholicPage = () => {
  return (
    <ProtectedRoute requiresPaid={true} fallback={<UpgradePrompt />}>
      <KentuckyCatholicPage />
    </ProtectedRoute>
  );
};

export default WrappedKentuckyCatholicPage;

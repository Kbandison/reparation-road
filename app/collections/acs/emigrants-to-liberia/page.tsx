"use client";

import React, { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Ship } from "lucide-react";

const UpgradePrompt = () => {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto p-8">
        <div className="mb-6">
          <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-brand-brown mb-4">
            Premium Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            Access to emigrants to Liberia records requires a premium membership. 
            Discover the stories of those who made the journey to Africa.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Complete emigrant records and details</span>
          </div>
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Search by origin, profession, and status</span>
          </div>
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Download and save records</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/membership')}
            className="w-full bg-brand-green text-white hover:bg-brand-darkgreen"
            size="lg"
          >
            Upgrade to Premium - $19.99/month
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

interface Emigrant {
  id: number;
  name: string;
  age?: number;
  state_of_origin?: string;
  free_status?: string;
  emancipated_by?: string;
  location_on_arrival?: string;
  education?: string;
  profession?: string;
  date_of_death?: string;
  cause_of_death?: string;
  removed_to?: string;
  removal_date?: string;
}

const EmigrantsToLiberiaPage = () => {
  const searchParams = useSearchParams();
  const [emigrants, setEmigrants] = useState<Emigrant[]>([]);
  const [filteredEmigrants, setFilteredEmigrants] = useState<Emigrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmigrant, setSelectedEmigrant] = useState<Emigrant | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 25;

  // Open modal for specific record from URL params
  useEffect(() => {
    const recordId = searchParams.get('record');
    if (recordId && emigrants.length > 0) {
      const emigrant = emigrants.find(e => String(e.id) === recordId);
      if (emigrant) {
        setSelectedEmigrant(emigrant);
      }
    }
  }, [searchParams, emigrants]);

  useEffect(() => {
    const fetchEmigrants = async () => {
      try {
        let allEmigrants: Emigrant[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from("emmigrants_to_liberia")
            .select("*")
            .order("id", { ascending: true })
            .range(from, from + batchSize - 1);

          if (error) {
            console.error("Error fetching emigrants:", error);
            setError("Failed to load emigrants data. Please try again later.");
            break;
          }

          if (data && data.length > 0) {
            allEmigrants = [...allEmigrants, ...data];
            from += batchSize;
            hasMore = data.length === batchSize;
          } else {
            hasMore = false;
          }
        }

        setEmigrants(allEmigrants);
        setFilteredEmigrants(allEmigrants);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to connect to database. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmigrants();
  }, []);

  useEffect(() => {
    const filtered = emigrants.filter(emigrant =>
      emigrant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emigrant.state_of_origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emigrant.free_status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emigrant.emancipated_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emigrant.location_on_arrival?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emigrant.education?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emigrant.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emigrant.date_of_death?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emigrant.cause_of_death?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emigrant.removed_to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emigrant.removal_date?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmigrants(filtered);
    setCurrentPage(1);
  }, [searchTerm, emigrants]);

  const totalPages = Math.ceil(filteredEmigrants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmigrants = filteredEmigrants.slice(startIndex, endIndex);

  const handleRowClick = (emigrant: Emigrant) => {
    setSelectedEmigrant(emigrant);
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-xl">Loading emigrants to Liberia records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige">
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Ship className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Emigrants to Liberia</h1>
            <p className="text-lg text-white/90">
              Records of individuals and families who emigrated to Liberia through the American Colonization Society.
              Click on any row to view detailed information about the emigrant.
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <nav className="text-sm breadcrumbs mb-6">
          <ol className="flex items-center space-x-2 text-brand-brown">
            <li>
              <a href="/collections/acs" className="hover:underline">
                African Colonization Society
              </a>
            </li>
            <li className="text-gray-500">/</li>
            <li className="font-semibold">Emigrants to Liberia</li>
          </ol>
        </nav>

        <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
          <Input
            type="search"
            placeholder="Search by name, location, profession, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
          />
          <p className="text-sm text-gray-600">
            Showing {filteredEmigrants.length} of {emigrants.length} records
          </p>
        </div>

        {filteredEmigrants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              {emigrants.length === 0
                ? "No emigrant records found in the database."
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
                  <th className="px-4 py-3 font-semibold">Age</th>
                  <th className="px-4 py-3 font-semibold">State of Origin</th>
                  <th className="px-4 py-3 font-semibold">Free Status</th>
                  <th className="px-4 py-3 font-semibold">Emancipated By</th>
                  <th className="px-4 py-3 font-semibold">Location on Arrival</th>
                  <th className="px-4 py-3 font-semibold">Education</th>
                  <th className="px-4 py-3 font-semibold">Profession</th>
                  <th className="px-4 py-3 font-semibold">Date of Death</th>
                  <th className="px-4 py-3 font-semibold">Cause of Death</th>
                  <th className="px-4 py-3 font-semibold">Removed To</th>
                  <th className="px-4 py-3 font-semibold">Removal Date</th>
                </tr>
              </thead>
              <tbody>
                {currentEmigrants.map((emigrant) => (
                  <tr
                    key={emigrant.id}
                    onClick={() => handleRowClick(emigrant)}
                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-brand-brown">
                      {emigrant.name}
                    </td>
                    <td className="px-4 py-3">{emigrant.age || "—"}</td>
                    <td className="px-4 py-3">{emigrant.state_of_origin || "—"}</td>
                    <td className="px-4 py-3">{emigrant.free_status || "—"}</td>
                    <td className="px-4 py-3">{emigrant.emancipated_by || "—"}</td>
                    <td className="px-4 py-3">{emigrant.location_on_arrival || "—"}</td>
                    <td className="px-4 py-3">{emigrant.education || "—"}</td>
                    <td className="px-4 py-3">{emigrant.profession || "—"}</td>
                    <td className="px-4 py-3">{emigrant.date_of_death || "—"}</td>
                    <td className="px-4 py-3">{emigrant.cause_of_death || "—"}</td>
                    <td className="px-4 py-3">{emigrant.removed_to || "—"}</td>
                    <td className="px-4 py-3">{emigrant.removal_date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
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
                      className="w-10 h-10"
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
              ({startIndex + 1}-{Math.min(endIndex, filteredEmigrants.length)} of {filteredEmigrants.length} records)
            </div>
          </>
        )}

        {selectedEmigrant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative rounded-2xl shadow-2xl border border-brand-green bg-brand-tan w-[90vw] max-w-lg p-4 md:p-8 flex flex-col items-center max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 w-full">
              <span className="text-lg font-serif text-brand-brown">
                Emigrant Details
              </span>
              <button
                type="button"
                onClick={() => setSelectedEmigrant(null)}
                className="rounded-full p-2 text-brand-green hover:bg-brand-green hover:text-brand-tan transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="w-full text-left space-y-2">
              <div>
                <span className="font-semibold text-brand-brown">Name:</span>
                <span className="ml-2 text-gray-700">{selectedEmigrant.name}</span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">Age:</span>
                <span className="ml-2 text-gray-700">{selectedEmigrant.age || "Not recorded"}</span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">State of Origin:</span>
                <span className="ml-2 text-gray-700">{selectedEmigrant.state_of_origin || "Not recorded"}</span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">Free Status:</span>
                <span className="ml-2 text-gray-700">{selectedEmigrant.free_status || "Not recorded"}</span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">Emancipated By:</span>
                <span className="ml-2 text-gray-700">{selectedEmigrant.emancipated_by || "Not recorded"}</span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">Location on Arrival:</span>
                <span className="ml-2 text-gray-700">{selectedEmigrant.location_on_arrival || "Not recorded"}</span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">Education:</span>
                <span className="ml-2 text-gray-700">{selectedEmigrant.education || "Not recorded"}</span>
              </div>
              <div>
                <span className="font-semibold text-brand-brown">Profession:</span>
                <span className="ml-2 text-gray-700">{selectedEmigrant.profession || "Not recorded"}</span>
              </div>
              {selectedEmigrant.date_of_death && (
                <div>
                  <span className="font-semibold text-brand-brown">Date of Death:</span>
                  <span className="ml-2 text-gray-700">{selectedEmigrant.date_of_death}</span>
                </div>
              )}
              {selectedEmigrant.cause_of_death && (
                <div>
                  <span className="font-semibold text-brand-brown">Cause of Death:</span>
                  <span className="ml-2 text-gray-700">{selectedEmigrant.cause_of_death}</span>
                </div>
              )}
              {selectedEmigrant.removed_to && (
                <div>
                  <span className="font-semibold text-brand-brown">Removed To:</span>
                  <span className="ml-2 text-gray-700">{selectedEmigrant.removed_to}</span>
                </div>
              )}
              {selectedEmigrant.removal_date && (
                <div>
                  <span className="font-semibold text-brand-brown">Removal Date:</span>
                  <span className="ml-2 text-gray-700">{selectedEmigrant.removal_date}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

const WrappedEmigrantsToLiberiaPage = () => {
  return (
    <ProtectedRoute requiresPaid={true} fallback={<UpgradePrompt />}>
      <Suspense fallback={
        <div className="min-h-screen bg-brand-beige flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-brand-brown">Loading records...</p>
          </div>
        </div>
      }>
        <EmigrantsToLiberiaPage />
      </Suspense>
    </ProtectedRoute>
  );
};

export default WrappedEmigrantsToLiberiaPage;
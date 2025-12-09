
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClaimModal from "@/components/ClaimModal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { FileText, Loader2 } from "lucide-react";

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
            Access to slave compensation claims data requires a premium membership. 
            Unlock thousands of historical records and advanced search capabilities.
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

interface Claim {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  place_of_birth: string;
  regiment: string;
  military_category: string;
  nara_film_no: string;
  roll_no: string;
  beginning_frame: string;
  former_slave_owner: string;
  owner_residence: string;
}

const SlaveCompensationPage = () => {
  const searchParams = useSearchParams();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Initialize search from URL params
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  // Open modal for specific record from URL params
  useEffect(() => {
    const recordId = searchParams.get('record');
    if (recordId && claims.length > 0) {
      const record = claims.find(c => c.id === parseInt(recordId));
      if (record) {
        setSelectedClaim(record);
      }
    }
  }, [searchParams, claims]);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        let allClaims: Claim[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from("slave_compensation_claims")
            .select("*")
            .order("id", { ascending: true })
            .range(from, from + batchSize - 1);

          if (error) {
            console.error("Error fetching claims:", error);
            break;
          }

          if (data && data.length > 0) {
            allClaims = [...allClaims, ...data];
            from += batchSize;
            hasMore = data.length === batchSize;
          } else {
            hasMore = false;
          }
        }

        setClaims(allClaims);
        setFilteredClaims(allClaims);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  useEffect(() => {
    const filtered = claims.filter(claim =>
      `${claim.first_name} ${claim.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.place_of_birth?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.former_slave_owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.owner_residence?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.regiment?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClaims(filtered);
    setCurrentPage(1);
  }, [searchTerm, claims]);

  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClaims = filteredClaims.slice(startIndex, endIndex);

  const handleRowClick = (claim: Claim) => {
    setSelectedClaim(claim);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-xl">Loading slave compensation claims...</p>
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
              Slave Compensation Claims
            </h1>
            <p className="text-lg text-white/90">
              Explore historical records of slave compensation claims filed after the Civil War.
              Click on any row to view detailed information about the claimant.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">

        <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
          <Input
            type="search"
            placeholder="Search by name, location, owner, or regiment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
          />
          <p className="text-sm text-gray-600">
            Showing {filteredClaims.length} of {claims.length} claims
          </p>
        </div>
      </div>

      {filteredClaims.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No claims found matching your search.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full text-sm text-left">
              <thead className="bg-brand-tan text-brand-brown">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Age</th>
                  <th className="px-4 py-3 font-semibold">Place of Birth</th>
                  <th className="px-4 py-3 font-semibold">Regiment</th>
                  <th className="px-4 py-3 font-semibold">Former Owner</th>
                  <th className="px-4 py-3 font-semibold">Owner Residence</th>
                </tr>
              </thead>
              <tbody>
                {currentClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    onClick={() => handleRowClick(claim)}
                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-brand-brown">
                      {claim.first_name} {claim.last_name}
                    </td>
                    <td className="px-4 py-3">{claim.age}</td>
                    <td className="px-4 py-3">{claim.place_of_birth}</td>
                    <td className="px-4 py-3">{claim.regiment}</td>
                    <td className="px-4 py-3">{claim.former_slave_owner}</td>
                    <td className="px-4 py-3">{claim.owner_residence}</td>
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
            ({startIndex + 1}-{Math.min(endIndex, filteredClaims.length)} of {filteredClaims.length} claims)
          </div>
        </>
      )}

      <ClaimModal
        claim={selectedClaim}
        onClose={() => setSelectedClaim(null)}
      />
      </div>
    </div>
  );
};

const WrappedSlaveCompensationPage = () => {
  return (
    <ProtectedRoute requiresPaid={true} fallback={<UpgradePrompt />}>
      <Suspense fallback={
        <div className="min-h-screen bg-brand-beige flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        </div>
      }>
        <SlaveCompensationPage />
      </Suspense>
    </ProtectedRoute>
  );
};

export default WrappedSlaveCompensationPage;

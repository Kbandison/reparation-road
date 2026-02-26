"use client";

import React, { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Search, MapPin, Shield, X, Loader2 } from "lucide-react";
import Image from "next/image";
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
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-brand-brown mb-4">
            Premium Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            Access to African-American Revolutionary Soldiers records requires a premium membership.
            Discover the brave soldiers who fought for independence.
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
            <span className="text-gray-700">View soldier portraits and records</span>
          </div>
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Advanced search and filtering</span>
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

interface Soldier {
  id: number;
  soldier_name: string;
  image_path: string | null;
  state: string | null;
  regiment: string | null;
  period_of_service: string | null;
  remarks: string | null;
  page_no: string | null;
  ocr_text: string | null;
}

// Image component with error handling
const SoldierImage = ({
  soldier,
  className,
  sizes,
  priority = false,
  variant = "card"
}: {
  soldier: Soldier;
  className?: string;
  sizes?: string;
  priority?: boolean;
  variant?: "card" | "modal";
}) => {
  const [imageError, setImageError] = useState(false);

  if (!soldier.image_path || imageError) {
    const isModal = variant === "modal";
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
        <Shield className={`${isModal ? 'w-24 h-24' : 'w-16 h-16'} text-gray-300 mb-3`} />
        <p className={`text-gray-500 font-medium ${isModal ? 'text-lg' : 'text-sm'}`}>
          Image Coming Soon
        </p>
        <p className={`text-gray-400 ${isModal ? 'text-sm mt-1' : 'text-xs mt-1'}`}>
          Check back later
        </p>
      </div>
    );
  }

  return (
    <Image
      src={soldier.image_path!}
      alt={soldier.soldier_name}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setImageError(true)}
    />
  );
};

const RevolutionarySoldiersPage = () => {
  const searchParams = useSearchParams();
  const [soldiers, setSoldiers] = useState<Soldier[]>([]);
  const [filteredSoldiers, setFilteredSoldiers] = useState<Soldier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSoldier, setSelectedSoldier] = useState<Soldier | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Open modal for specific record from URL params
  useEffect(() => {
    const recordId = searchParams.get('record');
    if (recordId && soldiers.length > 0) {
      const record = soldiers.find(r => String(r.id) === recordId);
      if (record) {
        setSelectedSoldier(record);
      }
    }
  }, [searchParams, soldiers]);

  useEffect(() => {
    const fetchSoldiers = async () => {
      try {
        let allSoldiers: Soldier[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from("aa_revolutionary_soldiers")
            .select("*")
            .order("soldier_name", { ascending: true })
            .range(from, from + batchSize - 1);

          if (error) {
            console.error("Error fetching soldiers:", error);
            break;
          }

          if (data && data.length > 0) {
            allSoldiers = [...allSoldiers, ...data];
            from += batchSize;
            hasMore = data.length === batchSize;
          } else {
            hasMore = false;
          }
        }

        setSoldiers(allSoldiers);
        setFilteredSoldiers(allSoldiers);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSoldiers();
  }, []);

  useEffect(() => {
    const filtered = soldiers.filter(soldier =>
      soldier.soldier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      soldier.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      soldier.regiment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      soldier.period_of_service?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSoldiers(filtered);
    setCurrentPage(1);
  }, [searchTerm, soldiers]);

  const totalPages = Math.ceil(filteredSoldiers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSoldiers = filteredSoldiers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-brand-brown">Loading revolutionary soldiers...</p>
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
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              African-American Revolutionary Soldiers
            </h1>
            <p className="text-lg text-white/90">
              Honoring the brave African-American soldiers who fought for American independence during the Revolutionary War
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
                placeholder="Search by name, state, or regiment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <p className="text-sm text-gray-600 whitespace-nowrap">
              Showing {filteredSoldiers.length} of {soldiers.length} soldiers
            </p>
          </div>
        </div>

        {filteredSoldiers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No soldiers found matching your search.</p>
          </div>
        ) : (
          <>
            {/* Soldiers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentSoldiers.map((soldier) => (
                <div
                  key={soldier.id}
                  onClick={() => setSelectedSoldier(soldier)}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                >
                  <div className="relative h-64 bg-gray-100">
                    <SoldierImage
                      soldier={soldier}
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-brand-brown mb-2 group-hover:text-brand-green transition-colors">
                      {soldier.soldier_name}
                    </h3>
                    {soldier.state && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                        <MapPin className="w-4 h-4" />
                        {soldier.state}
                      </p>
                    )}
                    {soldier.regiment && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        {soldier.regiment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
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
              ({startIndex + 1}-{Math.min(endIndex, filteredSoldiers.length)} of {filteredSoldiers.length} soldiers)
            </div>
          </>
        )}
      </div>

      {/* Soldier Detail Modal */}
      {selectedSoldier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand-brown">Soldier Details</h2>
              <div className="flex items-center gap-3">
                <BookmarkButton
                  pageId={String(selectedSoldier.id)}
                  collectionName="African-American Revolutionary Soldiers"
                  collectionSlug="revolutionary-soldiers"
                  recordTitle={selectedSoldier.soldier_name}
                  size={24}
                  showLabel={true}
                />
                <button
                  onClick={() => setSelectedSoldier(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="relative h-96 bg-gray-100 rounded-lg mb-6">
                <SoldierImage
                  soldier={selectedSoldier}
                  className="object-contain rounded-lg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={true}
                  variant="modal"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-3xl font-bold text-brand-brown mb-2">{selectedSoldier.soldier_name}</h3>
                </div>

                {selectedSoldier.state && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-green mt-1" />
                    <div>
                      <p className="font-semibold text-gray-700">State</p>
                      <p className="text-gray-600">{selectedSoldier.state}</p>
                    </div>
                  </div>
                )}

                {selectedSoldier.regiment && (
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-brand-green mt-1" />
                    <div>
                      <p className="font-semibold text-gray-700">Regiment</p>
                      <p className="text-gray-600">{selectedSoldier.regiment}</p>
                    </div>
                  </div>
                )}

                {selectedSoldier.period_of_service && (
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-brand-green mt-1" />
                    <div>
                      <p className="font-semibold text-gray-700">Period of Service</p>
                      <p className="text-gray-600">{selectedSoldier.period_of_service}</p>
                    </div>
                  </div>
                )}

                {selectedSoldier.remarks && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 text-brand-green mt-1 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Remarks</p>
                      <p className="text-gray-600">{selectedSoldier.remarks}</p>
                    </div>
                  </div>
                )}

                <RelatedRecords
                  currentRecordId={String(selectedSoldier.id)}
                  currentTable="aa_revolutionary_soldiers"
                  searchTerms={{
                    name: selectedSoldier.soldier_name,
                    location: selectedSoldier.state || undefined,
                  }}
                  collectionSlug="revolutionary-soldiers"
                />

                <RecordCitation
                  collectionName="African-American Revolutionary Soldiers"
                  recordIdentifier={selectedSoldier.soldier_name}
                  recordDetails={{
                    name: selectedSoldier.soldier_name,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WrappedRevolutionarySoldiersPage = () => {
  return (
    <ProtectedRoute requiresPaid={false} fallback={<UpgradePrompt />}>
      <Suspense fallback={
        <div className="min-h-screen bg-brand-beige flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        </div>
      }>
        <RevolutionarySoldiersPage />
      </Suspense>
    </ProtectedRoute>
  );
};

export default WrappedRevolutionarySoldiersPage;

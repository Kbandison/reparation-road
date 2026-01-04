"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Search, Ship, X, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { TableSkeleton } from "@/components/ui/GridSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const UpgradePrompt = () => {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto p-8">
        <div className="mb-6">
          <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Ship className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-brand-brown mb-4">
            Premium Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            Access to Slave Voyages database requires a premium membership.
            Comprehensive records of transatlantic slave trade voyages.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Full access to voyage records</span>
          </div>
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Advanced column filtering</span>
          </div>
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">Detailed voyage information</span>
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

// Define all available columns
const ALL_COLUMNS = [
  { key: 'voyage_id', label: 'Voyage ID' },
  { key: 'year_arrived_with_captives', label: 'Year Arrived' },
  { key: 'total_disembarked_imp', label: 'Total Disembarked' },
  { key: 'total_embarked_imp', label: 'Total Embarked' },
  { key: 'duration_of_captives_crossing_in_days', label: 'Crossing Duration (Days)' },
  { key: 'voyage_duration_homeport_to_disembarkation_in_days', label: 'Total Voyage Duration (Days)' },
  { key: 'crew_at_first_landing_of_captives', label: 'Crew at Landing' },
  { key: 'crew_at_voyage_outset', label: 'Crew at Outset' },
  { key: 'standardized_tonnage_imp', label: 'Tonnage' },
  { key: 'sterling_cash_price_in_jamaica_imp', label: 'Price in Jamaica (£)' },
  { key: 'percentage_of_captives_who_died_during_crossing_imp', label: 'Mortality Rate (%)' },
  { key: 'percent_women', label: '% Women' },
  { key: 'percent_men', label: '% Men' },
  { key: 'percent_boys', label: '% Boys' },
  { key: 'percent_girls', label: '% Girls' },
  { key: 'percent_children', label: '% Children' },
  { key: 'percent_male', label: '% Male' },
  { key: 'percent_female', label: '% Female' },
  { key: 'outcome_of_voyage_if_ship_captured', label: 'Outcome if Captured' },
  { key: 'outcome_of_voyage_for_investors', label: 'Outcome for Investors' },
  { key: 'outcome_of_voyage_for_captives', label: 'Outcome for Captives' },
  { key: 'particular_outcome', label: 'Particular Outcome' },
  { key: 'flag_of_vessel_imp', label: 'Vessel Flag' },
  { key: 'rig_of_vessel', label: 'Vessel Rig' },
  { key: 'region_where_vessel_s_voyage_ended_imp', label: 'Region Voyage Ended' },
  { key: 'place_where_vessel_s_voyage_ended', label: 'Place Voyage Ended' },
  { key: 'place_where_vessel_s_voyage_began_imp', label: 'Place Voyage Began' },
  { key: 'region_of_return', label: 'Region of Return' },
  { key: 'broad_region_where_voyage_began_imp', label: 'Broad Region Voyage Began' },
  { key: 'principal_region_of_captive_disembarkation_imp', label: 'Region of Disembarkation' },
  { key: 'principal_place_where_captives_were_landed_imp', label: 'Place Captives Landed' },
  { key: 'broad_region_of_captive_disembarkation_imp', label: 'Broad Region of Disembarkation' },
  { key: 'principal_region_of_captive_purchase', label: 'Region of Purchase' },
  { key: 'principal_place_where_captives_were_purchased', label: 'Place Captives Purchased' },
  { key: 'broad_region_of_captive_purchase_imp', label: 'Broad Region of Purchase' },
  { key: 'month_purchase_of_captives_began', label: 'Month Purchase Began' },
  { key: 'month_voyage_completed', label: 'Month Voyage Completed' },
  { key: 'month_vessel_departed_africa', label: 'Month Departed Africa' },
  { key: 'month_voyage_began', label: 'Month Voyage Began' },
  { key: 'month_first_disembarkation_of_captives', label: 'Month First Disembarkation' },
  { key: 'month_departed_last_place_of_landing', label: 'Month Departed Last Landing' },
  { key: 'resistance', label: 'Resistance' },
  { key: 'voyage_sources', label: 'Sources' },
  { key: 'enslavers', label: 'Enslavers' }
];

// Default visible columns
const DEFAULT_COLUMNS = [
  'voyage_id',
  'year_arrived_with_captives',
  'total_disembarked_imp',
  'principal_place_where_captives_were_landed_imp',
  'principal_place_where_captives_were_purchased'
];

interface SlaveVoyage {
  id: string;
  [key: string]: string | null | undefined;
}

const SlaveVoyagesPage = () => {
  const [voyages, setVoyages] = useState<SlaveVoyage[]>([]);
  const [filteredVoyages, setFilteredVoyages] = useState<SlaveVoyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVoyage, setSelectedVoyage] = useState<SlaveVoyage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const itemsPerPage = 50;

  useEffect(() => {
    const fetchVoyages = async () => {
      try {
        let allVoyages: SlaveVoyage[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from("slave_voyages")
            .select("*")
            .order("year_arrived_with_captives", { ascending: false })
            .range(from, from + batchSize - 1);

          if (error) {
            console.error("Error fetching voyages:", error);
            break;
          }

          if (data && data.length > 0) {
            allVoyages = [...allVoyages, ...data];
            from += batchSize;
            hasMore = data.length === batchSize;
          } else {
            hasMore = false;
          }
        }

        setVoyages(allVoyages);
        setFilteredVoyages(allVoyages);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVoyages();
  }, []);

  useEffect(() => {
    const filtered = voyages.filter(voyage =>
      Object.values(voyage).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredVoyages(filtered);
    setCurrentPage(1);
  }, [searchTerm, voyages]);

  const toggleColumn = (columnKey: string) => {
    setVisibleColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(k => k !== columnKey)
        : [...prev, columnKey]
    );
  };

  const totalPages = Math.ceil(filteredVoyages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVoyages = filteredVoyages.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-beige">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Ship className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Slave Voyages Database
              </h1>
              <p className="text-lg text-white/90">
                Comprehensive database of transatlantic slave trade voyages, including ship names, routes, and passenger information from historical records
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full max-w-md mb-4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
          </div>
          <TableSkeleton rows={15} columns={5} />
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
            <Ship className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Slave Voyages Database
            </h1>
            <p className="text-lg text-white/90">
              Comprehensive database of transatlantic slave trade voyages, including ship names, routes, and passenger information from historical records
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Column Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search voyages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex gap-2 items-center">
              <p className="text-sm text-gray-600 whitespace-nowrap">
                Showing {filteredVoyages.length} of {voyages.length} voyages
              </p>
              <div className="relative">
                <Button
                  onClick={() => setShowColumnSelector(!showColumnSelector)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Columns ({visibleColumns.length})
                  {showColumnSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>

                {showColumnSelector && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-10 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
                      <h3 className="font-semibold text-brand-brown">Select Columns to Display</h3>
                      <p className="text-xs text-gray-500 mt-1">Choose which columns to show in the table</p>
                    </div>
                    <div className="p-2">
                      {ALL_COLUMNS.map(column => (
                        <label
                          key={column.key}
                          className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns.includes(column.key)}
                            onChange={() => toggleColumn(column.key)}
                            className="mr-3 rounded text-brand-green focus:ring-brand-green"
                          />
                          <span className="text-sm text-gray-700">{column.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2">
                      <Button
                        onClick={() => setVisibleColumns(ALL_COLUMNS.map(c => c.key))}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Select All
                      </Button>
                      <Button
                        onClick={() => setVisibleColumns(DEFAULT_COLUMNS)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {filteredVoyages.length === 0 ? (
          <EmptyState
            type="no-results"
            title="No Voyages Found"
            description="No voyages match your current search criteria. Try adjusting your search terms or column filters."
            actionLabel="Clear Search"
            onAction={() => setSearchTerm("")}
          />
        ) : (
          <>
            {/* Voyages Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <table className="w-full">
                  <thead className="bg-brand-green text-white sticky top-0 z-10 shadow-sm">
                    <tr>
                      {ALL_COLUMNS.filter(col => visibleColumns.includes(col.key)).map(column => (
                        <th key={column.key} className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentVoyages.map((voyage, idx) => (
                      <tr
                        key={voyage.id}
                        onClick={() => setSelectedVoyage(voyage)}
                        className={`hover:bg-brand-tan/20 cursor-pointer transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        {ALL_COLUMNS.filter(col => visibleColumns.includes(col.key)).map(column => (
                          <td key={column.key} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {voyage[column.key] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              ({startIndex + 1}-{Math.min(endIndex, filteredVoyages.length)} of {filteredVoyages.length} voyages)
            </div>
          </>
        )}
      </div>

      {/* Voyage Detail Modal */}
      {selectedVoyage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand-brown">Voyage Details</h2>
              <button
                onClick={() => setSelectedVoyage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ALL_COLUMNS.map(column => {
                  const value = selectedVoyage[column.key];
                  if (!value) return null;

                  return (
                    <div key={column.key} className="border-b border-gray-100 pb-3">
                      <p className="text-sm font-semibold text-gray-500 mb-1">{column.label}</p>
                      <p className="text-gray-900">{value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WrappedSlaveVoyagesPage = () => {
  return (
    <ProtectedRoute requiresPaid={true} fallback={<UpgradePrompt />}>
      <SlaveVoyagesPage />
    </ProtectedRoute>
  );
};

export default WrappedSlaveVoyagesPage;

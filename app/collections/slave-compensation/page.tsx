
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClaimModal from "@/components/ClaimModal";

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
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const { data, error } = await supabase
          .from("slave_compensation_claims")
          .select("*")
          .order("id", { ascending: true });

        if (error) {
          console.error("Error fetching claims:", error);
        } else {
          setClaims(data || []);
          setFilteredClaims(data || []);
        }
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-brand-brown mb-4">Slave Compensation Claims</h1>
        <p className="text-lg text-gray-700 mb-6">
          Explore historical records of slave compensation claims filed after the Civil War. 
          Click on any row to view detailed information about the claimant.
        </p>
        
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
  );
};

export default SlaveCompensationPage;

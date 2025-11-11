"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Users } from "lucide-react";

const UpgradePrompt = () => {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto p-8">
        <div className="mb-6">
          <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-brand-brown mb-4">
            Premium Access Required
          </h2>
          <p className="text-gray-600 mb-6">
            Access to Liberation Census Rolls requires a premium membership.
            Explore demographics and conditions of liberated African
            communities.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-gray-700">
              Complete census records by town
            </span>
          </div>
          <div className="flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-gray-700">
              Demographics and family information
            </span>
          </div>
          <div className="flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-gray-700">
              Professional and health records
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/membership")}
            className="w-full bg-brand-green text-white hover:bg-brand-darkgreen"
            size="lg"
          >
            Upgrade to Premium - $19.99/month
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Don&apos;t have an account?
            </p>
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

interface CensusRecord {
  id: number;
  town: string;
  name: string;
  age?: number;
  family_count?: string;
  date?: string;
  where_born?: string;
  connections?: string;
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
        let allRecords: CensusRecord[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from("liberation_census_rolls")
            .select("*")
            .order("id", { ascending: true })
            .range(from, from + batchSize - 1);

          if (error) {
            console.error("Error fetching census records:", error);
            setError("Failed to load census records. Please try again later.");
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
        record.connections?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="min-h-screen bg-brand-beige">
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Liberian Census Rolls</h1>
            <p className="text-lg text-white/90">
              Census records documenting liberated Africans in various settlements.
              These records provide valuable information about the demographics,
              origins, and conditions of freed individuals in post-emancipation
              communities. Click on any row to view detailed information.
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
            <li className="font-semibold">Liberian Census Rolls</li>
          </ol>
        </nav>

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
                  <th className="px-4 py-3 font-semibold">Connections</th>
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
                    <td className="px-4 py-3">{record.connections || "—"}</td>
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
              Page {currentPage} of {totalPages} ({startIndex + 1}-
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
                  Connections:
                </span>
                <span className="ml-2 text-gray-700">
                  {selectedRecord.connections || "Not recorded"}
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
    </div>
  );
};

const WrappedLiberationCensusRollsPage = () => {
  return (
    <ProtectedRoute requiresPaid={true} fallback={<UpgradePrompt />}>
      <LiberationCensusRollsPage />
    </ProtectedRoute>
  );
};

export default WrappedLiberationCensusRollsPage;

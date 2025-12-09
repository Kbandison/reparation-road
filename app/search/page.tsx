/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { ExternalLink, Loader2, FileText } from "lucide-react";
import ClaimModal from "@/components/ClaimModal";

const collections = [
  { name: "African Colonization Society", href: "/collections/acs", tier: "premium" },
  {
    name: "African-American Revolutionary Soldiers",
    href: "/collections/revolutionary-soldiers",
    tier: "premium"
  },
  { name: "Bibles and Churches Records", href: "/collections/bibles-churches", tier: "premium" },
  {
    name: "British/Spanish/French Florida and Louisiana",
    href: "/collections/florida-louisiana",
    tier: "premium"
  },
  { name: "Clubs and Organizations", href: "/collections/clubs-organizations", tier: "premium" },
  { name: "Maryland State Records Concerning Persons of Color", href: "/collections/confederate-payrolls", tier: "premium" },
  {
    name: "East Indians and Native Americans in Maryland and Virginia",
    href: "/collections/east-indians-native-americans",
    tier: "premium"
  },
  { name: "English Bills of Exchange", href: "/collections/bills-of-exchange", tier: "premium" },
  {
    name: "Ex-slave Pension and Fraud Files",
    href: "/collections/ex-slave-pension",
    tier: "premium"
  },
  {
    name: "Free Black Heads of Household, First US Census 1790",
    href: "/collections/free-black-census-1790",
    tier: "premium"
  },
  {
    name: "Freedmen, Refugee and Contraband Records",
    href: "/collections/freedmen-refugee-contraband",
    tier: "premium"
  },
  {
    name: "Fugitive and Slave Case Files",
    href: "/collections/fugitive-slave-cases",
    tier: "premium"
  },
  { name: "Inspection Roll of Negroes", href: "/collections/inspection-roll", tier: "free" },
  { name: "Lost Friends in Last Seen Ads", href: "/collections/lost-friends", tier: "premium" },
  {
    name: "Native American Records",
    href: "/collections/native-american-records",
    tier: "premium"
  },
  {
    name: "Passports Issued by Governors of Georgia 1785-1809",
    href: "/collections/georgia-passports",
    tier: "premium"
  },
  {
    name: "Records of Slave Claims Commission",
    href: "/collections/slave-claims-commission",
    tier: "premium"
  },
  { name: "Records of the RAC and VOC", href: "/collections/rac-vlc", tier: "premium" },
  {
    name: "Tennessee State Records Concerning Persons of Color",
    href: "/collections/tennessee-registers",
    tier: "premium"
  },
  {
    name: "Kentucky State Records Concerning Persons of Color",
    href: "/collections/mississippi-registers",
    tier: "premium"
  },
  {
    name: "Pennsylvania State Records Concerning Persons of Color",
    href: "/collections/pennsylvania-registers",
    tier: "premium"
  },
  {
    name: "New York State Records Concerning Persons of Color",
    href: "/collections/new-york-registers",
    tier: "premium"
  },
  { name: "Slave Compensation", href: "/collections/slave-compensation", tier: "premium" },
  {
    name: "Slave Importation Declaration",
    href: "/collections/slave-importation",
    tier: "premium"
  },
  { name: "Slave Narratives", href: "/collections/slave-narratives", tier: "premium" },
  { name: "Slave Voyages", href: "/collections/slave-voyages", tier: "premium" },
  {
    name: "Southwest Georgia Obits and Burials",
    href: "/collections/southwest-georgia",
    tier: "premium"
  },
  {
    name: "Virginia Order Books. Negro Adjudgments",
    href: "/collections/virginia-order-books",
    tier: "premium"
  },
  {
    name: "Virginia Personal Property and Tithes Tables",
    href: "/collections/virginia-property-tithes",
    tier: "premium"
  },
];

const SearchPage = () => {
  const [claims, setClaims] = useState<any[] | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchClaims = async () => {
      const { data: allClaims } = await supabase
        .from("slave_compensation_claims")
        .select("*")
        .order("id", { ascending: false })
        .limit(50);

      const shuffled = allClaims?.sort(() => 0.5 - Math.random());
      setClaims(shuffled?.slice(0, 4) || []);
    };

    fetchClaims();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    setShowResults(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=100`);
      const data = await response.json();

      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultSelect = (result: any) => {
    // Navigate to the collection page
    window.location.href = `/collections/${result._collectionSlug}`;
  };

  // Group results by collection
  const groupedResults = searchResults.reduce((acc: any, result: any) => {
    const collection = result._collection;
    if (!acc[collection]) {
      acc[collection] = [];
    }
    acc[collection].push(result);
    return acc;
  }, {});

  // Assume user is logged in for now
  const isLoggedIn = true;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div
        className="relative h-[300px] md:h-[400px] flex items-center justify-center bg-cover bg-center rounded-lg"
        style={{
          backgroundImage:
            "url('/20250626_0830_Vintage Desk Legacy_simple_compose_01jyp3brxdfdtbe2693rmngbcx.png')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50 rounded-lg pointer-events-none"></div>
        <div className="relative z-10 text-center text-white p-4 w-full">
          <h1 className="text-4xl md:text-5xl font-bold">
            Search All Collections
          </h1>
          <p className="text-lg md:text-xl mt-4">
            Search across all historical records and collections.
          </p>
          <div className="mt-8 w-full flex justify-center">
            <div className="w-full max-w-2xl">
              <SearchAutocomplete
                onSearch={handleSearch}
                onResultSelect={handleResultSelect}
                placeholder="Search by name, location, owner, or any keyword..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Section */}
      {showResults && (
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold">
              {isSearching ? 'Searching...' : `Search Results for "${searchQuery}"`}
            </h2>
            {!isSearching && (
              <p className="text-gray-600 mt-2">
                Found {searchResults.length} record{searchResults.length !== 1 ? 's' : ''} across {Object.keys(groupedResults).length} collection{Object.keys(groupedResults).length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600">No results found for &quot;{searchQuery}&quot;</p>
              <p className="text-gray-500 mt-2">Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedResults).map(([collection, results]: [string, any]) => (
                <div key={collection} className="border rounded-lg p-6 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-brand-brown">{collection}</h3>
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {results.length} result{results.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {results.slice(0, 5).map((result: any) => (
                      <div
                        key={`${result._table}-${result.id}`}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleResultSelect(result)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-gray-900 mb-2">
                              {result._identifier}
                            </h4>
                            {result._snippet && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {result._snippet}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              {Object.entries(result)
                                .filter(([key]) => !key.startsWith('_') && key !== 'id' && key !== 'created_at' && key !== 'updated_at')
                                .slice(0, 4)
                                .map(([key, value]: [string, any]) => (
                                  value && (
                                    <span key={key} className="bg-gray-100 px-2 py-1 rounded">
                                      <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {value}
                                    </span>
                                  )
                                ))}
                            </div>
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>
                      </div>
                    ))}

                    {results.length > 5 && (
                      <div className="text-center">
                        <Button
                          variant="outline"
                          onClick={() => {
                            const firstResult = results[0];
                            window.location.href = `/collections/${firstResult._collectionSlug}`;
                          }}
                        >
                          View all {results.length} results in {collection}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 mt-12">
        {/* Main Content */}
        <main className="w-full md:w-3/4">
          <h2 className="text-3xl font-bold mb-6">Collections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <Link href={collection.href} key={collection.name}>
                <div className="border rounded-lg p-4 flex flex-col h-full justify-center items-center text-center cursor-pointer hover:bg-gray-100 relative">
                  {/* Tier Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-semibold ${
                    collection.tier === 'free'
                      ? 'bg-brand-green text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {collection.tier === 'free' ? 'FREE' : 'PREMIUM'}
                  </div>
                  <h3 className="text-xl font-semibold">{collection.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </main>

        {/* Sidebar */}
        {isLoggedIn && (
          <aside className="w-full md:w-1/4">
            <div className="sticky top-8 border rounded-lg p-4">
              <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {claims?.map((claim) => (
                  <div
                    key={claim.id}
                    className="cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                    onClick={() => setSelectedClaim(claim)}
                  >
                    <div>
                      <h3 className="font-semibold">{`${claim.first_name} ${claim.last_name}`}</h3>
                      <p className="text-sm text-gray-600">Age: {claim.age}</p>
                      <p className="text-sm text-gray-600">
                        Place of Birth: {claim.place_of_birth}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button className="w-full">See More</Button>
              </div>
            </div>
          </aside>
        )}
      </div>
      <ClaimModal
        claim={selectedClaim}
        onClose={() => setSelectedClaim(null)}
      />
    </div>
  );
};

export default SearchPage;

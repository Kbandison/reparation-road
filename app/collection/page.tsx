/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import ClaimModal from "@/components/ClaimModal";
import { Sparkles, TrendingUp, Lock, Loader2, FileText, ExternalLink } from "lucide-react";

const collections = [
  { name: "African Colonization Society", href: "/collections/acs", tier: "premium", description: "Emigrants to Liberia and census rolls" },
  {
    name: "African-American Revolutionary Soldiers",
    href: "/collections/revolutionary-soldiers",
    tier: "free",
    description: "Black patriots who fought for American independence"
  },
  { name: "Bibles and Churches Records", href: "/collections/bibles-churches", tier: "premium", description: "Church records and Bible inscriptions" },
  {
    name: "British/Spanish/French Florida and Louisiana",
    href: "/collections/florida-louisiana",
    tier: "premium",
    description: "Colonial period documentation"
  },
  { name: "Clubs and Organizations", href: "/collections/clubs-organizations", tier: "premium", description: "Fraternal societies and social groups" },
  { name: "Maryland State Records Concerning Persons of Color", href: "/collections/confederate-payrolls", tier: "premium", description: "State records documenting persons of color in Maryland" },
  {
    name: "North Carolina State Records Concerning Persons of Color",
    href: "/collections/east-indians-native-americans",
    tier: "premium",
    description: "State records documenting persons of color in North Carolina"
  },
  { name: "Foreign Inward Manifests and Cargo Lists", href: "/collections/bills-of-exchange", tier: "premium", description: "Manifests and cargo lists documenting foreign trade" },
  {
    name: "Ex-slave Pension and Fraud Files",
    href: "/collections/ex-slave-pension",
    tier: "premium",
    description: "Post-Civil War compensation claims"
  },
  {
    name: "Free Black Heads of Household, First US Census 1790",
    href: "/collections/free-black-census-1790",
    tier: "free",
    description: "Early census documentation of free Black families"
  },
  {
    name: "Freedmen, Refugee and Contraband Records",
    href: "/collections/freedmen-refugee-contraband",
    tier: "premium",
    description: "Freedmen's Bureau documentation"
  },
  {
    name: "Fugitive and Slave Case Files",
    href: "/collections/fugitive-slave-cases",
    tier: "premium",
    description: "Legal cases and court records"
  },
  { name: "Inspection Roll of Negroes", href: "/collections/inspection-roll", tier: "free", description: "Free tier collection - No subscription required" },
  { name: "Lost Friends in Last Seen Ads", href: "/collections/lost-friends", tier: "premium", description: "Post-war family reunion advertisements" },
  {
    name: "Native American Records",
    href: "/collections/native-american-records",
    tier: "premium",
    description: "Indigenous peoples documentation"
  },
  {
    name: "South Carolina Records Concerning Persons of Color",
    href: "/collections/georgia-passports",
    tier: "premium",
    description: "State records documenting persons of color in South Carolina"
  },
  {
    name: "Georgia State Records Concerning Persons of Color",
    href: "/collections/slave-claims-commission",
    tier: "premium",
    description: "State records documenting persons of color in Georgia"
  },
  { name: "Slave Merchant Trade Records", href: "/collections/rac-vlc", tier: "premium", description: "Records documenting slave merchant trade activities" },
  {
    name: "Tennessee State Records Concerning Persons of Color",
    href: "/collections/tennessee-registers",
    tier: "premium",
    description: "State records documenting persons of color in Tennessee"
  },
  {
    name: "Kentucky State Records Concerning Persons of Color",
    href: "/collections/mississippi-registers",
    tier: "premium",
    description: "State records documenting persons of color in Kentucky"
  },
  { name: "Slave Compensation", href: "/collections/slave-compensation", tier: "premium", description: "British slavery abolition compensation" },
  {
    name: "Slave Importation Declaration",
    href: "/collections/slave-importation",
    tier: "premium",
    description: "Ships and cargo manifests"
  },
  { name: "Slave Narratives", href: "/collections/slave-narratives", tier: "premium", description: "First-hand accounts of enslavement" },
  { name: "Slave Voyages", href: "/collections/slave-voyages", tier: "premium", description: "Trans-Atlantic slave trade database" },
  {
    name: "Mississippi State Records Concerning Persons of Color",
    href: "/collections/southwest-georgia",
    tier: "premium",
    description: "State records documenting persons of color in Mississippi"
  },
  {
    name: "Pennsylvania State Records Concerning Persons of Color",
    href: "/collections/pennsylvania-registers",
    tier: "premium",
    description: "State records documenting persons of color in Pennsylvania"
  },
  {
    name: "New York State Records Concerning Persons of Color",
    href: "/collections/new-york-registers",
    tier: "premium",
    description: "State records documenting persons of color in New York"
  },
  {
    name: "Virginia Order Books. Negro Adjudgments",
    href: "/collections/virginia-order-books",
    tier: "premium",
    description: "Court proceedings and legal judgments"
  },
  {
    name: "Virginia Personal Property and Tithes Tables",
    href: "/collections/virginia-property-tithes",
    tier: "premium",
    description: "Tax records and property listings"
  },
];

const CollectionPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [claims, setClaims] = useState<any[] | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { user, hasPremiumAccess } = useAuth();

  // Initialize search from URL on page load and when URL changes (e.g., back button)
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch && urlSearch !== searchQuery) {
      // Perform search without updating URL again
      performSearch(urlSearch);
    } else if (!urlSearch && searchQuery) {
      // URL has no search param but we have a search query - clear it
      setSearchQuery("");
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Separate search logic that doesn't update URL
  const performSearch = async (query: string) => {
    console.log('[CLIENT] Performing search for:', query);
    setSearchQuery(query);

    if (!query || query.trim().length === 0) {
      setShowResults(false);
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=100`);
      const data = await response.json();

      if (data.results) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('[CLIENT] Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

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

  const handleSearch = async (query: string, forceFullSearch = false) => {
    console.log('[CLIENT] Search initiated for:', query, 'forceFullSearch:', forceFullSearch);
    setSearchQuery(query);

    // If query is empty, reset to showing all collections
    if (!query || query.trim().length === 0) {
      console.log('[CLIENT] Query empty, resetting to collections view');
      setShowResults(false);
      setSearchResults([]);
      setIsSearching(false);
      // Remove search param from URL
      router.push('/collection', { scroll: false });
      return;
    }

    // Update URL with search query
    router.push(`/collection?search=${encodeURIComponent(query)}`, { scroll: false });

    // Always search database records in real-time as user types
    setIsSearching(true);
    setShowResults(true);

    try {
      console.log('[CLIENT] Performing database search for:', query);
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=100`);
      const data = await response.json();

      console.log('[CLIENT] Database search response:', data);

      if (data.errors) {
        console.error('[CLIENT] Search errors from API:', data.errors);
      }

      if (data.results) {
        setSearchResults(data.results);
        console.log('[CLIENT] Found', data.results.length, 'database results');
      } else {
        setSearchResults([]);
        console.log('[CLIENT] No database results found');
      }
    } catch (error) {
      console.error('[CLIENT] Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultSelect = (result: any) => {
    // Navigate to the collection page with search query and record ID
    const params = new URLSearchParams();
    params.set('search', searchQuery);
    params.set('record', result.id || '');
    params.set('table', result._table || '');
    window.location.href = `/collections/${result._collectionSlug}?${params.toString()}`;
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    // Remove search param from URL
    router.push('/collection', { scroll: false });
  };

  // Highlight matching text in search results
  const highlightMatch = (text: string, searchQuery: string) => {
    if (!text || !searchQuery) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.toString().split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="font-semibold text-brand-green bg-brand-green/10 px-1 rounded">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
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

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const freeCollections = filteredCollections.filter(c => c.tier === "free");
  const premiumCollections = filteredCollections.filter(c => c.tier === "premium");

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-beige to-white">
      {/* Hero Section with modern gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-green via-brand-darkgreen to-brand-green">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-tan rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-brown rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-brand-white rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              3 Free + 24 Premium Collections
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Discover Your Heritage
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Explore thousands of historical documents and records to uncover your family&apos;s story
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative z-10">
              <SearchAutocomplete
                onSearch={handleSearch}
                onResultSelect={handleResultSelect}
                placeholder="Search all records by name, location, owner, or any keyword..."
              />
              {showResults && (
                <button
                  onClick={handleClearSearch}
                  className="mt-4 text-white/90 hover:text-white text-sm underline"
                >
                  ← Back to Collections
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#fefaf5"/>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search Results Section */}
        {showResults ? (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-brand-brown">
                {isSearching ? 'Searching...' : `Search Results for "${searchQuery}"`}
              </h2>
              {!isSearching && (
                <p className="text-gray-600 mt-2">
                  Found {filteredCollections.length} matching collection{filteredCollections.length !== 1 ? 's' : ''} and {searchResults.length} record{searchResults.length !== 1 ? 's' : ''} across {Object.keys(groupedResults).length} collection{Object.keys(groupedResults).length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Matching Collections */}
            {filteredCollections.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-brand-brown mb-4">Matching Collections</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCollections.map((collection) => (
                    <Link
                      href={hasPremiumAccess || collection.tier === 'free' ? collection.href : "/membership"}
                      key={collection.name}
                      className="group"
                    >
                      <div className="relative border border-gray-200 rounded-xl p-4 bg-white hover:shadow-lg hover:border-brand-green transition-all">
                        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${
                          collection.tier === 'free'
                            ? 'bg-brand-green text-white'
                            : 'bg-amber-500 text-white'
                        }`}>
                          {collection.tier === 'free' ? 'FREE' : 'PREMIUM'}
                        </div>
                        <h4 className="font-bold text-brand-brown mb-2 pr-16 group-hover:text-brand-green transition-colors">
                          {collection.name}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {collection.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-xl text-gray-600">No database records found for &quot;{searchQuery}&quot;</p>
                <p className="text-gray-500 mt-2">Try different keywords or check your spelling</p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-brand-brown mb-6">Matching Records</h3>
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
                      {results.slice(0, 5).map((result: any, idx: number) => (
                        <div
                          key={`${result._table}-${result.id || idx}-${result._identifier || idx}`}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleResultSelect(result)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-gray-900 mb-2">
                                {highlightMatch(result._identifier, searchQuery)}
                              </h4>
                              {result._snippet && (
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                  {highlightMatch(result._snippet, searchQuery)}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                {Object.entries(result)
                                  .filter(([key]) => !key.startsWith('_') && key !== 'id' && key !== 'created_at' && key !== 'updated_at')
                                  .slice(0, 4)
                                  .map(([key, value]: [string, any]) => (
                                    value && (
                                      <span key={key} className="bg-gray-100 px-2 py-1 rounded">
                                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {highlightMatch(String(value), searchQuery)}
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
                              const params = new URLSearchParams();
                              params.set('search', searchQuery);
                              window.location.href = `/collections/${firstResult._collectionSlug}?${params.toString()}`;
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
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <main className="w-full lg:w-3/4">
            {/* Free Collections */}
            {freeCollections.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-brand-green rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-brand-brown">Free Collections</h2>
                    <p className="text-gray-600">No subscription required</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {freeCollections.map((collection) => (
                    <Link href={collection.href} key={collection.name} className="group">
                      <div className="relative border-2 border-brand-green/20 rounded-2xl p-6 h-full bg-gradient-to-br from-white to-brand-beige hover:shadow-2xl hover:border-brand-green/40 transition-all duration-300 hover:-translate-y-1">
                        {/* Free Badge */}
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-brand-green text-white text-xs font-bold">
                          FREE
                        </div>

                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-brand-brown mb-2 group-hover:text-brand-green transition-colors">
                            {collection.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {collection.description}
                          </p>
                        </div>

                        <div className="flex items-center text-brand-green font-semibold text-sm">
                          Explore Collection
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Premium Collections */}
            {premiumCollections.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-brand-brown">Premium Collections</h2>
                    <p className="text-gray-600">Access with Premium membership</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {premiumCollections.map((collection) => (
                    <Link
                      href={hasPremiumAccess ? collection.href : "/membership"}
                      key={collection.name}
                      className="group"
                    >
                      <div className="relative border border-gray-200 rounded-2xl p-6 h-full bg-white hover:shadow-xl hover:border-amber-300 transition-all duration-300 hover:-translate-y-1">
                        {/* Premium Badge */}
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold flex items-center gap-1">
                          {!hasPremiumAccess && <Lock className="w-3 h-3" />}
                          PREMIUM
                        </div>

                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-brand-brown mb-2 group-hover:text-amber-600 transition-colors pr-20">
                            {collection.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {collection.description}
                          </p>
                        </div>

                        <div className="flex items-center text-amber-600 font-semibold text-sm">
                          {hasPremiumAccess ? "Explore Collection" : "Upgrade to Access"}
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {filteredCollections.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600">No collections found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </main>

          {/* Sidebar */}
          {user && (
            <aside className="w-full lg:w-1/4">
              <div className="sticky top-24">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-brand-green" />
                    <h2 className="text-xl font-bold text-brand-brown">Recent Activity</h2>
                  </div>

                  <div className="space-y-3">
                    {claims?.map((claim) => (
                      <div
                        key={claim.id}
                        className="cursor-pointer hover:bg-brand-beige p-3 rounded-lg transition-colors border border-transparent hover:border-brand-green/20"
                        onClick={() => setSelectedClaim(claim)}
                      >
                        <h3 className="font-semibold text-brand-brown text-sm">{`${claim.first_name} ${claim.last_name}`}</h3>
                        <p className="text-xs text-gray-600">Age: {claim.age}</p>
                        <p className="text-xs text-gray-600 truncate">
                          {claim.place_of_birth}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full mt-4 bg-brand-green hover:bg-brand-darkgreen">
                    View All Records
                  </Button>
                </div>

                {/* Upgrade CTA */}
                {!hasPremiumAccess && (
                  <div className="bg-gradient-to-br from-brand-green to-brand-darkgreen rounded-2xl shadow-lg p-6 text-white">
                    <Sparkles className="w-8 h-8 mb-3" />
                    <h3 className="text-xl font-bold mb-2">Upgrade to Premium</h3>
                    <p className="text-sm text-white/90 mb-4">
                      Access all 27+ historical collections and advanced search features
                    </p>
                    <Link href="/membership">
                      <Button className="w-full bg-white text-brand-green hover:bg-brand-tan">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
        )}
      </div>

      <ClaimModal
        claim={selectedClaim}
        onClose={() => setSelectedClaim(null)}
      />
    </div>
  );
};

// Wrap in Suspense to handle useSearchParams
function CollectionPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-brand-beige to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    }>
      <CollectionPage />
    </Suspense>
  );
}

export default CollectionPageWrapper;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { ExternalLink, Loader2, FileText, FolderOpen, Folder, Clock, Search as SearchIcon } from "lucide-react";
import ClaimModal from "@/components/ClaimModal";
import { useRecentActivity } from "@/contexts/RecentActivityContext";

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
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { getRecentActivities, addActivity } = useRecentActivity();

  const recentActivities = getRecentActivities(10);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    setShowResults(true);

    // Track search activity
    addActivity({
      type: 'search',
      title: `Search: "${query}"`,
      url: `/search?q=${encodeURIComponent(query)}`,
    });

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

  // Separate collections/subcollections from records
  const collections = searchResults.filter((r: any) => r._isCollection);
  const records = searchResults.filter((r: any) => !r._isCollection);

  // Group record results by collection
  const groupedResults = records.reduce((acc: any, result: any) => {
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
                Found {collections.length > 0 && `${collections.length} collection${collections.length !== 1 ? 's' : ''}${records.length > 0 ? ' and ' : ''}`}
                {records.length > 0 && `${records.length} record${records.length !== 1 ? 's' : ''}`}
                {records.length > 0 && ` across ${Object.keys(groupedResults).length} collection${Object.keys(groupedResults).length !== 1 ? 's' : ''}`}
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
              {/* Collections and Subcollections */}
              {collections.length > 0 && (
                <div className="border rounded-lg p-6 bg-gradient-to-br from-brand-tan to-white shadow-md">
                  <h3 className="text-2xl font-bold text-brand-brown mb-4 flex items-center gap-2">
                    <FolderOpen className="w-6 h-6" />
                    Collections & Subcollections
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collections.map((collection: any) => (
                      <div
                        key={collection.id}
                        onClick={() => handleResultSelect(collection)}
                        className="group bg-white border-2 border-brand-green/20 rounded-lg p-4 hover:border-brand-green hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {collection._type === 'subcollection' ? (
                              <Folder className="w-8 h-8 text-brand-green" />
                            ) : (
                              <FolderOpen className="w-8 h-8 text-brand-darkgreen" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg text-brand-brown group-hover:text-brand-green transition-colors">
                                {collection._identifier}
                              </h4>
                              {collection._type === 'subcollection' && (
                                <span className="text-xs bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full font-medium">
                                  Subcollection
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {collection._snippet}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-brand-green font-medium">
                              <span>Browse Collection</span>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Record Results */}
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
        <aside className="w-full md:w-1/4">
          <div className="sticky top-8 border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-brand-green" />
              Recent Activity
            </h2>

            {recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your searches and viewed records will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <a
                    key={activity.id}
                    href={activity.url}
                    className="block p-3 rounded-md border border-gray-200 hover:border-brand-green hover:bg-gray-50 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'search' ? (
                          <SearchIcon className="w-4 h-4 text-brand-green" />
                        ) : activity.type === 'collection' ? (
                          <Folder className="w-4 h-4 text-brand-green" />
                        ) : (
                          <FileText className="w-4 h-4 text-brand-green" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 truncate group-hover:text-brand-green">
                          {activity.title}
                        </h3>
                        {activity.subtitle && (
                          <p className="text-xs text-gray-600 truncate">{activity.subtitle}</p>
                        )}
                        {activity.collectionName && (
                          <p className="text-xs text-gray-500 mt-1">{activity.collectionName}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {recentActivities.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Showing {recentActivities.length} recent {recentActivities.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
      <ClaimModal
        claim={selectedClaim}
        onClose={() => setSelectedClaim(null)}
      />
    </div>
  );
};

export default SearchPage;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClaimModal from "@/components/ClaimModal";
import { Search, Sparkles, TrendingUp, Lock } from "lucide-react";

const collections = [
  { name: "African Colonization Society", href: "/collections/acs", tier: "premium", description: "Emigrants to Liberia and census rolls" },
  {
    name: "African-American Revolutionary Soldiers",
    href: "/collections/revolutionary-soldiers",
    tier: "premium",
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
  { name: "Confederate Payrolls", href: "/collections/confederate-payrolls", tier: "premium", description: "Civil War era employment records" },
  {
    name: "East Indians and Native Americans in MD & VA",
    href: "/collections/east-indians-native-americans",
    tier: "premium",
    description: "Mixed heritage documentation"
  },
  { name: "English Bills of Exchange", href: "/collections/bills-of-exchange", tier: "premium", description: "Financial transaction records" },
  {
    name: "Ex-slave Pension and Fraud Files",
    href: "/collections/ex-slave-pension",
    tier: "premium",
    description: "Post-Civil War compensation claims"
  },
  {
    name: "Free Black Heads of Household, First US Census 1790",
    href: "/collections/free-black-census-1790",
    tier: "premium",
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
    name: "Passports Issued by Governors of Georgia 1785-1809",
    href: "/collections/georgia-passports",
    tier: "premium",
    description: "Early travel documentation"
  },
  {
    name: "Records of Slave Claims Commission",
    href: "/collections/slave-claims-commission",
    tier: "premium",
    description: "British compensation records"
  },
  { name: "Records of the RAC and VOC", href: "/collections/rac-vlc", tier: "premium", description: "Royal African Company and Dutch trading records" },
  {
    name: "Registers of Formerly Enslaved Tennessee",
    href: "/collections/tennessee-registers",
    tier: "premium",
    description: "Post-emancipation registration records"
  },
  {
    name: "Registers of Formerly Enslaved Mississippi",
    href: "/collections/mississippi-registers",
    tier: "premium",
    description: "Post-emancipation registration records"
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
    name: "Southwest Georgia Obits and Burials",
    href: "/collections/southwest-georgia",
    tier: "premium",
    description: "Death records and cemetery documentation"
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
  const [claims, setClaims] = useState<any[] | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, hasPremiumAccess } = useAuth();

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
              27 Historical Collections
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Discover Your Heritage
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Explore thousands of historical documents and records to uncover your family&apos;s story
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="search"
                  placeholder="Search collections by name or topic..."
                  className="w-full pl-12 pr-4 py-6 text-lg rounded-full border-2 border-white/20 bg-white/95 backdrop-blur-sm focus:bg-white focus:border-brand-tan"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
      </div>

      <ClaimModal
        claim={selectedClaim}
        onClose={() => setSelectedClaim(null)}
      />
    </div>
  );
};

export default CollectionPage;

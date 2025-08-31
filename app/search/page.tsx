/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClaimModal from "@/components/ClaimModal";

const collections = [
  { name: "African Colonization Society", href: "/collections/acs" },
  { name: "Slave Compensation", href: "/collections/slave-compensation" },
  { name: "Inspection Roll of Negroes", href: "/collections/inspection-roll" },
  { name: "Confederate Payrolls", href: "/collections/confederate-payrolls" },
  { name: "Slave Voyages", href: "/collections/slave-voyages" },
];

const SearchPage = () => {
  const [claims, setClaims] = useState<any[] | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);

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
        <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
        <div className="relative z-10 text-center text-white p-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Search the Collection
          </h1>
          <p className="text-lg md:text-xl mt-4">
            Explore historical slave compensation claims.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 focus:ring-[var(--color-brand-green)]">
            <Input
              type="search"
              placeholder="Search by name, location, or owner..."
              className="w-full max-w-md text-black"
            />
            <Button type="submit" className="w-full sm:w-auto">
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-12">
        {/* Main Content */}
        <main className="w-full md:w-3/4">
          <h2 className="text-3xl font-bold mb-6">Collections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <Link href={collection.href} key={collection.name}>
                <div className="border rounded-lg p-4 flex flex-col h-full justify-center items-center text-center cursor-pointer hover:bg-gray-100">
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
              <h2 className="text-2xl font-bold mb-4">Random Claims</h2>
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

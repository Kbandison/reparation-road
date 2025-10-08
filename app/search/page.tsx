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
  {
    name: "African-American Revolutionary Soldiers",
    href: "/collections/revolutionary-soldiers",
  },
  { name: "Bibles and Churches Records", href: "/collections/bibles-churches" },
  {
    name: "British/Spanish/French Florida and Louisiana",
    href: "/collections/florida-louisiana",
  },
  { name: "Clubs and Organizations", href: "/collections/clubs-organizations" },
  { name: "Confederate Payrolls", href: "/collections/confederate-payrolls" },
  {
    name: "East Indians and Native Americans in Maryland and Virginia",
    href: "/collections/east-indians-native-americans",
  },
  { name: "English Bills of Exchange", href: "/collections/bills-of-exchange" },
  {
    name: "Ex-slave Pension and Fraud Files",
    href: "/collections/ex-slave-pension",
  },
  {
    name: "Free Black Heads of Household, First US Census 1790",
    href: "/collections/free-black-census-1790",
  },
  {
    name: "Freedmen, Refugee and Contraband Records",
    href: "/collections/freedmen-refugee-contraband",
  },
  {
    name: "Fugitive and Slave Case Files",
    href: "/collections/fugitive-slave-cases",
  },
  { name: "Inspection Roll of Negroes", href: "/collections/inspection-roll" },
  { name: "Inspection Roll of New Rules", href: "/collections/new-rules" },
  { name: "Lost Friends in Last Seen Ads", href: "/collections/lost-friends" },
  {
    name: "Native American Records",
    href: "/collections/native-american-records",
  },
  {
    name: "Passports Issued by Governors of Georgia 1785-1809",
    href: "/collections/georgia-passports",
  },
  {
    name: "Records of Slave Claims Commission",
    href: "/collections/slave-claims-commission",
  },
  { name: "Records of the RAC and VOC", href: "/collections/rac-vlc" },
  {
    name: "Registers of Formerly Enslaved Tennessee",
    href: "/collections/tennessee-registers",
  },
  {
    name: "Registers of Formerly Enslaved Mississippi",
    href: "/collections/mississippi-registers",
  },
  { name: "Slave Compensation", href: "/collections/slave-compensation" },
  {
    name: "Slave Importation Declaration",
    href: "/collections/slave-importation",
  },
  { name: "Slave Narratives", href: "/collections/slave-narratives" },
  { name: "Slave Voyages", href: "/collections/slave-voyages" },
  {
    name: "Southwest Georgia Obits and Burials",
    href: "/collections/southwest-georgia",
  },
  {
    name: "Virginia Order Books. Negro Adjudgments",
    href: "/collections/virginia-order-books",
  },
  {
    name: "Virginia Personal Property and Tithes Tables",
    href: "/collections/virginia-property-tithes",
  },
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

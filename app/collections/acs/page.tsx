/* eslint-disable react/no-unescaped-entities */

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const AfricanColonizationSocietyPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-brand-brown mb-6">
        African Colonization Society
      </h1>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-6">
          The American Colonization Society was established in 1816 to address
          the issue of free African Americans in the United States by promoting
          their emigration to Africa. The society founded the colony of Liberia
          in 1822 as a settlement for freed slaves and free-born African
          Americans.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-brand-brown mb-3">
            Emigrants to Liberia
          </h2>
          <p className="text-gray-600 mb-4">
            Browse records of individuals and families who emigrated to Liberia
            through the American Colonization Society programs.
          </p>
          <Link href="/collections/acs/emigrants-to-liberia">
            <Button className="w-full">View Emigrants Records</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-brand-brown mb-3">
            Liberian Census Rolls
          </h2>
          <p className="text-gray-600 mb-4">
            Census records of Liberian demographics, origins, and conditions in
            post-emancipation communities.
          </p>
          <Link href="/collections/acs/liberation-census-rolls">
            <Button className="w-full">View Census Records</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 opacity-50">
          <h2 className="text-xl font-semibold text-brand-brown mb-3">
            Society Documents
          </h2>
          <p className="text-gray-600 mb-4">
            Official documents, correspondence, and reports from the American
            Colonization Society.
          </p>
          <Button disabled className="w-full">
            Coming Soon
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 opacity-50">
          <h2 className="text-xl font-semibold text-brand-brown mb-3">
            Ship Records
          </h2>
          <p className="text-gray-600 mb-4">
            Passenger manifests and voyage records of ships that transported
            emigrants to Liberia.
          </p>
          <Button disabled className="w-full">
            Coming Soon
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-brand-brown mb-4">
          About the Collection
        </h2>
        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">
            This collection contains records related to the American
            Colonization Society's efforts to establish settlements in Liberia
            for free African Americans and formerly enslaved individuals. The
            society operated from 1816 to 1964, with its most active period
            being in the mid-19th century.
          </p>
          <p className="mb-4">
            The emigrants came from various states across America, with
            different backgrounds including free-born individuals, recently
            emancipated slaves, and those who purchased their own freedom. Many
            were skilled craftsmen, farmers, and educated individuals who sought
            new opportunities in Africa.
          </p>
          <p>
            These records provide valuable insight into the lives of African
            Americans who made the difficult decision to leave America and start
            new lives in Liberia, contributing to the early development of the
            nation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AfricanColonizationSocietyPage;

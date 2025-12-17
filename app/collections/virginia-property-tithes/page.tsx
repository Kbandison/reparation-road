"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, ScrollText, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const subcollections = [
  {
    slug: 'chesterfield-county-1747-1821',
    title: 'Chesterfield County 1747-1821',
    description: 'Personal property and tithe records from Chesterfield County spanning 1747-1821',
    available: true
  },
  {
    slug: 'franklin-county',
    title: 'Franklin County',
    description: 'Personal property and tithe records from Franklin County, Virginia',
    available: false
  },
  {
    slug: 'hanover',
    title: 'Hanover County',
    description: 'Personal property and tithe records from Hanover County, Virginia',
    available: true
  },
  {
    slug: 'henrico',
    title: 'Henrico County',
    description: 'Personal property and tithe records from Henrico County, Virginia',
    available: true
  },
  {
    slug: 'lancaster-county',
    title: 'Lancaster County',
    description: 'Personal property and tithe records from Lancaster County, Virginia',
    available: false
  },
  {
    slug: 'richmond',
    title: 'Richmond',
    description: 'Personal property and tithe records from Richmond, Virginia',
    available: false
  }
];

export const dynamic = 'force-dynamic';

export default function VirginiaPropertyTithesPage() {
  const { profile } = useAuth();
  const isPremiumOrAdmin = profile?.subscription_status === 'paid' || profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollText className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Virginia Personal Property and Tithes Tables
            </h1>
            <p className="text-lg text-white/90">
              Tax records documenting property ownership, including enslaved persons, in colonial and early Virginia
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Info Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold text-brand-brown mb-4">
              About This Collection
            </h2>
            <p className="text-gray-700 mb-4">
              Virginia tithe and personal property tax records provide valuable information about property ownership in colonial and early American Virginia. Tithes were taxes levied on tithables - which included enslaved persons, making these records important sources for genealogical research. These records include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Names of property owners</li>
              <li>Numbers and sometimes names of enslaved persons</li>
              <li>Property valuations and tax assessments</li>
              <li>Geographic information by county and district</li>
              <li>Year-by-year documentation of property changes</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              {!isPremiumOrAdmin && (
                <Link href="/membership">
                  <Button className="bg-brand-green hover:bg-brand-darkgreen">
                    Get Premium Access
                  </Button>
                </Link>
              )}
              <Link href="/collection">
                <Button variant="outline">
                  Browse All Collections
                </Button>
              </Link>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-brand-brown mb-3">
              Browse by County
            </h2>
            <p className="text-gray-700">
              Explore tax and tithe records from Virginia counties
            </p>
          </div>

          {/* Subcollections Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcollections.map((subcollection) => (
              <Link
                key={subcollection.slug}
                href={`/collections/virginia-property-tithes/${subcollection.slug}`}
              >
                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full border-2 border-transparent hover:border-brand-green">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-brand-tan rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-brand-green" />
                    </div>
                    {!subcollection.available && (
                      <span className="px-3 py-1 bg-brand-green text-white text-xs rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-brand-brown mb-2">
                    {subcollection.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {subcollection.description}
                  </p>
                  <div className="flex items-center text-brand-green font-semibold text-sm">
                    View Records
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

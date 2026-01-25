"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ship, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const subcollections = [
  {
    slug: 'austin-laurens',
    title: 'Austin & Laurens',
    description: 'Sale records documenting transactions, buyers, locations, and persons sold',
    available: true
  },
  {
    slug: 'samuel-william-vernon',
    title: 'Samuel and William Vernon Co.',
    description: 'Slave merchant trade records and vessel documentation',
    available: true
  }
];

export const dynamic = 'force-dynamic';

export default function SlaveMerchantTradeRecordsPage() {
  const { profile } = useAuth();
  const isPremiumOrAdmin = profile?.subscription_status === 'paid' || profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Ship className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Slave Merchant Trade Records
            </h1>
            <p className="text-lg text-white/90">
              Historical documentation of slave trading companies and their operations
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
              This collection contains records from various slave trading companies and merchants who participated in the transatlantic slave trade. These documents provide crucial historical evidence of the commercial operations, transactions, and practices involved in the forced migration and enslavement of African peoples. The collection includes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Ship manifests and cargo documentation</li>
              <li>Trade ledgers and financial records</li>
              <li>Voyage logs and maritime documents</li>
              <li>Business correspondence and contracts</li>
              <li>Transaction records and sales documentation</li>
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
              Browse by Merchant Company
            </h2>
            <p className="text-gray-700">
              Explore records from individual slave trading companies
            </p>
          </div>

          {/* Subcollections Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcollections.map((subcollection) => (
              <Link
                key={subcollection.slug}
                href={`/collections/rac-vlc/${subcollection.slug}`}
              >
                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full border-2 border-transparent hover:border-brand-green">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-brand-tan rounded-full flex items-center justify-center flex-shrink-0">
                      <Ship className="w-6 h-6 text-brand-green" />
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

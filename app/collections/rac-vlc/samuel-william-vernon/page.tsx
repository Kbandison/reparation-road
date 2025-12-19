"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ship, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const subcollections = [
  {
    slug: 'brig-othello',
    title: 'Brig Othello',
    description: 'Slave trade records from the Brig Othello vessel',
    available: true
  },
  {
    slug: 'royal-charlotte',
    title: 'Royal Charlotte',
    description: 'Slave trade records from the Royal Charlotte vessel',
    available: true
  },
  {
    slug: 'schooner-sally',
    title: 'Schooner Sally',
    description: 'Slave trade records from the Schooner Sally vessel',
    available: true
  }
];

export const dynamic = 'force-dynamic';

export default function SamuelWilliamVernonPage() {
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
              Samuel and William Vernon Co.
            </h1>
            <p className="text-lg text-white/90">
              Slave merchant trade records and vessel documentation
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
              Samuel and William Vernon Co. was a prominent slave trading company. This collection contains records of their vessels, transactions, and operations in the transatlantic slave trade. The documents include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Ship manifests and cargo records</li>
              <li>Trade ledgers and transaction documents</li>
              <li>Voyage logs and documentation</li>
              <li>Business correspondence</li>
              <li>Financial records and accounts</li>
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
              Browse by Vessel
            </h2>
            <p className="text-gray-700">
              Explore records from individual ships operated by Samuel and William Vernon Co.
            </p>
          </div>

          {/* Subcollections Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcollections.map((subcollection) => (
              <Link
                key={subcollection.slug}
                href={`/collections/rac-vlc/samuel-william-vernon/${subcollection.slug}`}
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

"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, Scale, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const subcollections = [
  {
    slug: 'chesterfield',
    title: 'Chesterfield County',
    description: 'Virginia Order Books documenting Negro adjudgments from Chesterfield County',
    available: true
  },
  {
    slug: 'goochland',
    title: 'Goochland County',
    description: 'Virginia Order Books documenting Negro adjudgments from Goochland County',
    available: true
  },
  {
    slug: 'henrico',
    title: 'Henrico County',
    description: 'Virginia Order Books documenting Negro adjudgments from Henrico County',
    available: true
  },
  {
    slug: 'spotsylvania',
    title: 'Spotsylvania County',
    description: 'Virginia Order Books documenting Negro adjudgments from Spotsylvania County',
    available: true
  }
];

export const dynamic = 'force-dynamic';

export default function VirginiaOrderBooksPage() {
  const { profile } = useAuth();
  const isPremiumOrAdmin = profile?.subscription_status === 'paid' || profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Scale className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Virginia Order Books: Negro Adjudgments
            </h1>
            <p className="text-lg text-white/90">
              Court proceedings, legal judgments, and order books from Virginia courts
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
              Virginia Order Books contain court proceedings and legal judgments related to persons of color. These records provide crucial documentation of the legal status, rights, and treatment of enslaved and free Black individuals in Virginia's court system. The collection includes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Court orders and legal judgments</li>
              <li>Freedom suits and manumission records</li>
              <li>Documentation of legal status determinations</li>
              <li>Property disputes and estate settlements</li>
              <li>Criminal proceedings and civil cases</li>
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
              Explore court records from Virginia counties
            </p>
          </div>

          {/* Subcollections Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcollections.map((subcollection) => (
              <Link
                key={subcollection.slug}
                href={`/collections/virginia-order-books/${subcollection.slug}`}
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

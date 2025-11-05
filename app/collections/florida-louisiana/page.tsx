"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const subcollections = [
  {
    slug: 'colored-baptisms-1784-1793',
    title: 'Colored Baptisms 1784-1793 (Diocese of St Augustine)',
    description: 'Baptism records of colored individuals from the Diocese of St Augustine'
  },
  {
    slug: 'colored-baptisms-1807-1848',
    title: 'Colored Baptisms 1807-1848 (Diocese of St Augustine)',
    description: 'Baptism records of colored individuals from the Diocese of St Augustine'
  },
  {
    slug: 'colored-deaths-1785-1821',
    title: 'Colored Deaths 1785-1821 (Diocese of St Augustine)',
    description: 'Death records of colored individuals from the Diocese of St Augustine'
  },
  {
    slug: 'colored-marriages-1784-1882',
    title: 'Colored Marriages 1784-1882 (Diocese of St Augustine)',
    description: 'Marriage records of colored individuals from the Diocese of St Augustine'
  },
  {
    slug: 'mixed-baptisms-1793-1807',
    title: 'Mixed Baptisms 1793-1807 (Diocese of St Augustine)',
    description: 'Mixed baptism records from the Diocese of St Augustine'
  }
];

export const dynamic = 'force-dynamic';

export default function FloridaLouisianaPage() {
  const { profile } = useAuth();
  const isPremiumOrAdmin = profile?.subscription_status === 'paid' || profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              British/Spanish/French Florida and Louisiana
            </h1>
            <p className="text-lg text-white/90">
              Colonial records from Florida and Louisiana territories under British, Spanish, and French rule
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
              This collection contains vital records from the colonial period in Florida and Louisiana, documenting the lives of colored and enslaved individuals under British, Spanish, and French rule. These records include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Baptism records from the Diocese of St Augustine</li>
              <li>Marriage records spanning nearly a century</li>
              <li>Death records and burial information</li>
              <li>Mixed race documentation</li>
              <li>Colonial administrative records</li>
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
              Browse Subcollections
            </h2>
            <p className="text-gray-700">
              Explore diocesan records from colonial Florida and Louisiana
            </p>
          </div>

          {/* Subcollections Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcollections.map((subcollection) => (
              <Link
                key={subcollection.slug}
                href={`/collections/florida-louisiana/${subcollection.slug}`}
              >
                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full border-2 border-transparent hover:border-brand-green">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-brand-tan rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-brand-green" />
                    </div>
                    <span className="px-3 py-1 bg-brand-green text-white text-xs rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-brand-brown mb-2">
                    {subcollection.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {subcollection.description}
                  </p>
                  <div className="flex items-center text-brand-green font-semibold text-sm">
                    View Details
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

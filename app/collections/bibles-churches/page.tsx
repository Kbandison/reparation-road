"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, Book, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const subcollections = [
  {
    slug: 'alabama-episcopal',
    title: 'Enslaved Persons Mentioned in Alabama Episcopal Registers',
    description: 'Episcopal church records from Alabama documenting enslaved individuals',
    available: false
  },
  {
    slug: 'first-african-baptist-savannah',
    title: 'First African Baptist Church (Savannah)',
    description: 'Historic records from the First African Baptist Church in Savannah, Georgia',
    available: false
  },
  {
    slug: 'kentucky-catholic',
    title: 'Kentucky Enslaved Catholic Church Records',
    description: 'Catholic church records from Kentucky documenting enslaved persons',
    available: false
  },
  {
    slug: 'mother-bethel-ame',
    title: 'Mother Bethel AME (Philadelphia)',
    description: 'Records from Mother Bethel AME Church, the oldest AME church in the nation',
    available: false
  },
  {
    slug: 'nathan-morgan-bible',
    title: 'Nathan Morgan Bible',
    description: 'Family Bible records and inscriptions from the Nathan Morgan family',
    available: false
  },
  {
    slug: 'starlight-baptist',
    title: 'Starlight Baptist Church Registers',
    description: 'Baptist church membership and baptism registers',
    available: false
  }
];

export const dynamic = 'force-dynamic';

export default function BiblesChurchesPage() {
  const { profile } = useAuth();
  const isPremiumOrAdmin = profile?.subscription_status === 'paid' || profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Book className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Bibles and Churches Records
            </h1>
            <p className="text-lg text-white/90">
              Historical church records, Bible inscriptions, and religious institution documentation containing genealogical information
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
              Our Bibles and Churches Records collection contains valuable genealogical information from various religious institutions and family Bibles. These records often include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Birth, marriage, and death records</li>
              <li>Church membership rolls</li>
              <li>Baptism and confirmation records</li>
              <li>Family Bible inscriptions</li>
              <li>Burial and cemetery records</li>
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
              Explore our collection of church records and religious documents from various institutions
            </p>
          </div>

          {/* Subcollections Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcollections.map((subcollection) => (
              <Link
                key={subcollection.slug}
                href={`/collections/bibles-churches/${subcollection.slug}`}
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

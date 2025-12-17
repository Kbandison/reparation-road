"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, Users, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const subcollections = [
  {
    slug: 'enslaved-fleeing-to-indian-country',
    title: 'Enslaved People Fleeing to American Indian Country',
    description: 'Records of enslaved individuals who sought freedom in Native American territories',
    available: false
  },
  {
    slug: 'baker-dawes',
    title: 'Baker & Dawes',
    description: 'Baker Roll and Dawes Roll records documenting tribal enrollment',
    available: false
  },
  {
    slug: 'chickasaw-removal-1837-1847',
    title: 'Chickasaw Removal Records 1837-1847',
    description: 'Records documenting the forced removal of Chickasaw people during the Trail of Tears',
    available: false
  },
  {
    slug: 'choctaw-other-freedmen',
    title: 'Choctaw & Other Freedmen',
    description: 'Records of formerly enslaved people within Choctaw and other Native American nations',
    available: false
  },
  {
    slug: 'creek-census-1832',
    title: 'Creek Census 1832 (Parsons Abbott Roll)',
    description: 'Census of Creek Nation members conducted in 1832',
    available: true
  },
  {
    slug: 'early-cherokee-census',
    title: 'Early Cherokee Census',
    description: 'Early census records of Cherokee Nation members',
    available: true
  },
  {
    slug: 'letters-indian-affairs',
    title: 'Letters Related to Indian Affairs',
    description: 'Correspondence documenting interactions between Native American nations and the U.S. government',
    available: false
  },
  {
    slug: 'non-federal-tribal-info',
    title: 'Non-Federally Recognized Tribal Info',
    description: 'Information about tribes not federally recognized, including membership and history',
    available: false
  }
];

export const dynamic = 'force-dynamic';

export default function NativeAmericanRecordsPage() {
  const { profile } = useAuth();
  const isPremiumOrAdmin = profile?.subscription_status === 'paid' || profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Native American Records
            </h1>
            <p className="text-lg text-white/90">
              Historical records documenting Native American individuals and communities, including tribal rolls, census data, and freedmen records
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
              This collection documents the complex history of Native American nations and their interactions with African Americans, including enslaved persons who found refuge in tribal territories. These records include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Tribal enrollment records and census data</li>
              <li>Freedmen rolls documenting formerly enslaved tribal members</li>
              <li>Removal and relocation records from the Trail of Tears era</li>
              <li>Government correspondence and administrative documents</li>
              <li>Records of non-federally recognized tribes</li>
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
              Explore tribal records and documents related to Native American history
            </p>
          </div>

          {/* Subcollections Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcollections.map((subcollection) => (
              <Link
                key={subcollection.slug}
                href={`/collections/native-american-records/${subcollection.slug}`}
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

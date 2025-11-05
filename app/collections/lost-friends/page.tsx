"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';

const subcollections = [
  { slug: 'alabama', title: 'Alabama' },
  { slug: 'alaska', title: 'Alaska' },
  { slug: 'arizona', title: 'Arizona' },
  { slug: 'arkansas', title: 'Arkansas' },
  { slug: 'california', title: 'California' },
  { slug: 'colorado', title: 'Colorado' },
  { slug: 'connecticut', title: 'Connecticut' },
  { slug: 'delaware', title: 'Delaware' },
  { slug: 'florida', title: 'Florida' },
  { slug: 'georgia', title: 'Georgia' },
  { slug: 'hawaii', title: 'Hawaii' },
  { slug: 'idaho', title: 'Idaho' },
  { slug: 'illinois', title: 'Illinois' },
  { slug: 'indiana', title: 'Indiana' },
  { slug: 'iowa', title: 'Iowa' },
  { slug: 'kansas', title: 'Kansas' },
  { slug: 'kentucky', title: 'Kentucky' },
  { slug: 'louisiana', title: 'Louisiana' },
  { slug: 'maine', title: 'Maine' },
  { slug: 'maryland', title: 'Maryland' },
  { slug: 'massachusetts', title: 'Massachusetts' },
  { slug: 'michigan', title: 'Michigan' },
  { slug: 'minnesota', title: 'Minnesota' },
  { slug: 'mississippi', title: 'Mississippi' },
  { slug: 'missouri', title: 'Missouri' },
  { slug: 'montana', title: 'Montana' },
  { slug: 'nebraska', title: 'Nebraska' },
  { slug: 'nevada', title: 'Nevada' },
  { slug: 'new-hampshire', title: 'New Hampshire' },
  { slug: 'new-jersey', title: 'New Jersey' },
  { slug: 'new-mexico', title: 'New Mexico' },
  { slug: 'new-york', title: 'New York' },
  { slug: 'north-carolina', title: 'North Carolina' },
  { slug: 'north-dakota', title: 'North Dakota' },
  { slug: 'ohio', title: 'Ohio' },
  { slug: 'oklahoma', title: 'Oklahoma' },
  { slug: 'oregon', title: 'Oregon' },
  { slug: 'pennsylvania', title: 'Pennsylvania' },
  { slug: 'rhode-island', title: 'Rhode Island' },
  { slug: 'south-carolina', title: 'South Carolina' },
  { slug: 'south-dakota', title: 'South Dakota' },
  { slug: 'tennessee', title: 'Tennessee' },
  { slug: 'texas', title: 'Texas' },
  { slug: 'utah', title: 'Utah' },
  { slug: 'vermont', title: 'Vermont' },
  { slug: 'virginia', title: 'Virginia' },
  { slug: 'washington', title: 'Washington' },
  { slug: 'west-virginia', title: 'West Virginia' },
  { slug: 'wisconsin', title: 'Wisconsin' },
  { slug: 'wyoming', title: 'Wyoming' }
];

export const dynamic = 'force-dynamic';

export default function LostFriendsPage() {
  const { profile } = useAuth();
  const isPremiumOrAdmin = profile?.subscription_status === 'paid' || profile?.role === 'admin';
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStates = subcollections.filter(state =>
    state.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-darkgreen text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Search className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Lost Friends
            </h1>
            <p className="text-lg text-white/90">
              Historical advertisements from formerly enslaved individuals searching for family members separated by slavery
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
              The Lost Friends collection contains advertisements placed in newspapers by formerly enslaved individuals searching for family members from whom they were separated during slavery. These poignant ads include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Names of missing family members</li>
              <li>Last known locations before separation</li>
              <li>Physical descriptions</li>
              <li>Names of former enslavers</li>
              <li>Contact information for the searcher</li>
              <li>Family relationships and connections</li>
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

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-brand-brown mb-4 text-center">
              Browse by State
            </h2>
            <p className="text-gray-700 text-center mb-6">
              Select a state to view Lost Friends advertisements from that region
            </p>
            
            <div className="max-w-md mx-auto mb-8">
              <Input
                type="text"
                placeholder="Search states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* States Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStates.map((state) => (
              <Link
                key={state.slug}
                href={`/collections/lost-friends/${state.slug}`}
              >
                <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-brand-green">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-brand-brown">
                      {state.title}
                    </h3>
                    <Clock className="w-5 h-5 text-brand-green" />
                  </div>
                  <div className="flex items-center text-brand-green font-semibold text-sm">
                    View Ads
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredStates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No states found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

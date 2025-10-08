"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, ArrowLeft } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
  return (
    <div className="min-h-screen bg-brand-beige">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-brand-tan rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-brand-green">
              <Clock className="w-12 h-12 text-brand-green" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-brand-brown mb-4">
              {title}
            </h1>
            <div className="inline-block px-4 py-2 bg-brand-green text-white rounded-full text-sm font-semibold mb-6">
              Coming Soon
            </div>
            {description && (
              <p className="text-lg text-gray-700 mb-8">
                {description}
              </p>
            )}
            <p className="text-gray-600 mb-8">
              We&apos;re working hard to bring you this collection. This page will be available soon with
              searchable historical records and documents.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-brand-brown mb-4">
              Get Notified When This Collection Launches
            </h2>
            <p className="text-gray-600 mb-6">
              Want to be the first to know when this collection is available?
              Sign up for a free account or upgrade to premium for full access to all collections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/membership">
                <Button className="bg-brand-green hover:bg-brand-darkgreen">
                  View Membership Options
                </Button>
              </Link>
              <Link href="/collection">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Browse Available Collections
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-brand-tan rounded-lg p-6">
            <h3 className="font-semibold text-brand-brown mb-3">
              In the Meantime
            </h3>
            <p className="text-gray-700 mb-4">
              Explore our other available collections or book a consultation with our genealogy expert.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/collection">
                <Button variant="outline" size="sm">
                  Browse Collections
                </Button>
              </Link>
              <Link href="/booking">
                <Button variant="outline" size="sm">
                  Book Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

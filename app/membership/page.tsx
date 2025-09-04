"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Check, X, Star } from 'lucide-react';

const MembershipPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { user, profile } = useAuth();

  const freeFeatures = [
    'Browse collection landing pages',
    'View collection descriptions',
    'Access general historical information',
    'Create an account',
    'Basic customer support',
  ];

  const paidFeatures = [
    'Full access to all historical data tables',
    'Advanced search and filtering',
    'Download and export records',
    'Bookmark and save favorite records',
    'Priority customer support',
    'Early access to new collections',
    'Monthly research updates',
    'Priority booking for consultations',
  ];

  const handleGetStarted = (tier: 'free' | 'paid') => {
    if (!user) {
      setShowSignup(true);
    } else if (tier === 'paid' && profile?.subscription_status === 'free') {
      // TODO: Integrate with payment processor
      alert('Premium upgrade functionality will be integrated with payment processing');
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-brand-brown mb-6">
            Choose Your Membership
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the power of historical research with our comprehensive collection of Black history records. 
            Start your genealogical journey today.
          </p>
        </div>

        {/* Membership Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-brand-brown mb-2">Free</h2>
              <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
              <p className="text-gray-600">Get started with basic access</p>
            </div>

            <div className="space-y-4 mb-8">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <h4 className="font-semibold text-brand-brown mb-3">What's limited:</h4>
              <div className="space-y-2">
                <div className="flex items-center text-gray-500">
                  <X className="w-4 h-4 mr-2" />
                  <span className="text-sm">No access to historical data tables</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <X className="w-4 h-4 mr-2" />
                  <span className="text-sm">Limited search functionality</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <X className="w-4 h-4 mr-2" />
                  <span className="text-sm">No download capabilities</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleGetStarted('free')}
              variant="outline"
              className="w-full mt-8"
              disabled={!!(user && profile?.subscription_status === 'free')}
            >
              {user && profile?.subscription_status === 'free' ? 'Current Plan' : 'Get Started Free'}
            </Button>
          </div>

          {/* Paid Tier */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-brand-green p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-brand-green text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                <Star className="w-4 h-4 mr-1" />
                Most Popular
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-brand-brown mb-2">Premium</h2>
              <div className="text-4xl font-bold text-brand-green mb-2">$19.99</div>
              <p className="text-gray-600">per month</p>
            </div>

            <div className="space-y-4 mb-8">
              {paidFeatures.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-brand-green mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleGetStarted('paid')}
              className="w-full mt-8 bg-brand-green hover:bg-brand-darkgreen text-white"
              disabled={!!(user && profile?.subscription_status === 'paid')}
            >
              {user && profile?.subscription_status === 'paid' ? 'Current Plan' : 'Upgrade to Premium'}
            </Button>

            {!user && (
              <p className="text-sm text-gray-500 text-center mt-4">
                Start with a free account, upgrade anytime
              </p>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-brand-brown mb-8">
            Why Choose Reparation Road?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-tan rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-brown mb-2">Comprehensive Records</h3>
              <p className="text-gray-600">
                Access thousands of historical documents including slave compensation claims, 
                emigration records, and census rolls.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-tan rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-brown mb-2">Advanced Search</h3>
              <p className="text-gray-600">
                Powerful search tools to help you find your ancestors and trace your family history 
                through multiple historical collections.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-tan rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-brown mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Get guidance from genealogy experts and historians who specialize in 
                African American family research.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-brown mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-brand-brown mb-2">
                Can I upgrade or downgrade my membership at any time?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade to Premium at any time. If you decide to downgrade, 
                your access will continue until the end of your current billing period.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-brand-brown mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers. 
                All payments are processed securely through our payment partners.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-brand-brown mb-2">
                How often is new content added?
              </h3>
              <p className="text-gray-600">
                Premium members receive access to new historical records and collections 
                monthly, with major updates quarterly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modals */}
      {showLogin && (
        <LoginForm
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

      {showSignup && (
        <SignupForm
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
};

export default MembershipPage;
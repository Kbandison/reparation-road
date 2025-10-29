"use client";

import Link from "next/link";
import { Shield, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnauthorizedProps {
  title?: string;
  message?: string;
  showUpgrade?: boolean;
}

export const Unauthorized: React.FC<UnauthorizedProps> = ({
  title = "Access Restricted",
  message = "You don't have permission to view this content.",
  showUpgrade = false,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-beige via-brand-tan to-brand-beige flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-brand-green rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-brand-brown rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-brand-darkgreen rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Main Card */}
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-green opacity-20 rounded-full blur-xl"></div>
              <div className="relative bg-gradient-to-br from-brand-green to-brand-darkgreen p-6 rounded-full">
                {showUpgrade ? (
                  <Lock className="w-12 h-12 text-white" />
                ) : (
                  <Shield className="w-12 h-12 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-brand-brown mb-4">
              {title}
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              {message}
            </p>

            {showUpgrade && (
              <p className="text-brand-green font-semibold">
                Upgrade to Premium to access this collection
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">What you can do</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {showUpgrade ? (
              <>
                <Link href="/membership" className="block">
                  <Button className="w-full bg-brand-green hover:bg-brand-darkgreen text-white py-6 text-lg group">
                    Upgrade to Premium
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/collection" className="block">
                  <Button variant="outline" className="w-full py-6 text-lg border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white">
                    View Free Collections
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/" className="block">
                  <Button className="w-full bg-brand-green hover:bg-brand-darkgreen text-white py-6 text-lg group">
                    Return Home
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/collection" className="block">
                  <Button variant="outline" className="w-full py-6 text-lg border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white">
                    Browse Collections
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <Link href="/booking" className="text-brand-green font-semibold hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        {showUpgrade && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700">
                Premium members get access to <strong>27+ historical collections</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import React, { useState } from 'react';
import { Copy, Check, Quote } from 'lucide-react';
import { Button } from './button';

interface RecordCitationProps {
  collectionName: string;
  recordIdentifier: string;
  recordDetails?: {
    bookNo?: number;
    pageNo?: number;
    entryNo?: number;
    name?: string;
    date?: string;
  };
  accessDate?: string;
}

export function RecordCitation({
  collectionName,
  recordIdentifier,
  recordDetails,
  accessDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}: RecordCitationProps) {
  const [copied, setCopied] = useState(false);

  // Build citation string
  const buildCitation = () => {
    let citation = `"${recordIdentifier}," `;
    citation += `${collectionName}, `;

    if (recordDetails) {
      const parts = [];
      if (recordDetails.bookNo) parts.push(`Book ${recordDetails.bookNo}`);
      if (recordDetails.pageNo) parts.push(`Page ${recordDetails.pageNo}`);
      if (recordDetails.entryNo) parts.push(`Entry ${recordDetails.entryNo}`);
      if (parts.length > 0) {
        citation += `${parts.join(', ')}, `;
      }
    }

    citation += `Reparation Road (https://reparationroad.com), `;
    citation += `accessed ${accessDate}.`;

    return citation;
  };

  const citation = buildCitation();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy citation:', err);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <Quote className="w-4 h-4 text-brand-green" />
        <h4 className="text-sm font-semibold text-brand-brown">How to Cite This Record</h4>
      </div>
      <p className="text-sm text-gray-700 italic mb-3">
        {citation}
      </p>
      <Button
        onClick={handleCopy}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Citation
          </>
        )}
      </Button>
    </div>
  );
}

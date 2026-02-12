"use client";

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

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
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1 font-medium">Cite this record:</p>
          <p className="text-xs text-gray-500 italic">
            {citation}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          title="Copy citation"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-500" />
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

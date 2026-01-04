"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Quote } from 'lucide-react';
import { CitationData, generateAllCitations, formatCitationForDisplay } from '@/lib/citations';

interface CitationCardProps {
  data: CitationData;
  className?: string;
}

type CitationFormat = 'mla' | 'chicago' | 'apa' | 'bibtex';

export const CitationCard: React.FC<CitationCardProps> = ({ data, className = '' }) => {
  const [selectedFormat, setSelectedFormat] = useState<CitationFormat>('mla');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const citations = generateAllCitations(data);

  const handleCopy = async () => {
    const citation = citations[selectedFormat];
    // Remove markdown formatting for clipboard
    const plainText = citation.replace(/\*(.*?)\*/g, '$1');

    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy citation:', err);
    }
  };

  const formatLabels = {
    mla: 'MLA 9th',
    chicago: 'Chicago 17th',
    apa: 'APA 7th',
    bibtex: 'BibTeX',
  };

  if (!isExpanded) {
    return (
      <div className={`border rounded-lg p-4 bg-gray-50 ${className}`}>
        <Button
          onClick={() => setIsExpanded(true)}
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center gap-2"
        >
          <Quote className="w-4 h-4" />
          Cite this Record
        </Button>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-6 bg-gray-50 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-brand-brown flex items-center gap-2">
          <Quote className="w-5 h-5" />
          Citation
        </h4>
        <Button
          onClick={() => setIsExpanded(false)}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          Collapse
        </Button>
      </div>

      {/* Format Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(formatLabels) as CitationFormat[]).map((format) => (
          <button
            key={format}
            onClick={() => {
              setSelectedFormat(format);
              setCopied(false);
            }}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectedFormat === format
                ? 'bg-brand-green text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {formatLabels[format]}
          </button>
        ))}
      </div>

      {/* Citation Display */}
      <div className="bg-white border border-gray-200 rounded-md p-4 mb-3">
        {selectedFormat === 'bibtex' ? (
          <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800">
            {citations[selectedFormat]}
          </pre>
        ) : (
          <p
            className="text-sm text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: formatCitationForDisplay(citations[selectedFormat]),
            }}
          />
        )}
      </div>

      {/* Copy Button */}
      <Button
        onClick={handleCopy}
        variant="outline"
        size="sm"
        className="w-full flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Citation
          </>
        )}
      </Button>

      {/* Citation Guidelines */}
      <div className="mt-4 text-xs text-gray-600">
        <p className="mb-1">
          <strong>Note:</strong> Always verify citations against your style guide.
        </p>
        <p>
          This record is part of the {data.archiveName || 'Reparation Road Historical Archives'}.
        </p>
      </div>
    </div>
  );
};

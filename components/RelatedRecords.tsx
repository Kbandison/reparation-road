"use client";

import React, { useState, useEffect } from 'react';
import { findRelevantRecords, RelevantRecord, RelevantRecordsConfig } from '@/lib/relevantRecords';
import { Link2, Loader2, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface RelatedRecordsProps {
  config: RelevantRecordsConfig;
  className?: string;
}

export const RelatedRecords: React.FC<RelatedRecordsProps> = ({ config, className = '' }) => {
  const [relatedRecords, setRelatedRecords] = useState<RelevantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      try {
        const records = await findRelevantRecords(config);
        setRelatedRecords(records);
      } catch (error) {
        console.error('Error loading related records:', error);
      } finally {
        setLoading(false);
      }
    };

    if (config.currentRecord) {
      fetchRelated();
    }
  }, [config]);

  if (loading) {
    return (
      <div className={`border rounded-lg p-6 bg-gray-50 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
          <span className="ml-2 text-sm text-gray-600">Finding related records...</span>
        </div>
      </div>
    );
  }

  if (relatedRecords.length === 0) {
    return (
      <div className={`border rounded-lg p-6 bg-gray-50 ${className}`}>
        <h4 className="font-semibold text-brand-brown mb-2 flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Related Records
        </h4>
        <div className="text-center py-6">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-600">No related records found</p>
          <p className="text-xs text-gray-500 mt-1">
            We couldn't find other records with matching details
          </p>
        </div>
      </div>
    );
  }

  const displayRecords = isExpanded ? relatedRecords : relatedRecords.slice(0, 3);

  return (
    <div className={`border rounded-lg p-6 bg-gradient-to-br from-gray-50 to-white ${className}`}>
      <h4 className="font-semibold text-brand-brown mb-4 flex items-center gap-2">
        <Link2 className="w-5 h-5" />
        Related Records
        <span className="text-sm font-normal text-gray-500">
          ({relatedRecords.length} found)
        </span>
      </h4>

      <div className="space-y-3">
        {displayRecords.map((record) => (
          <Link
            key={record.id}
            href={record.url}
            className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-brand-green hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h5 className="font-medium text-gray-900 group-hover:text-brand-green transition-colors">
                    {record.identifier}
                  </h5>
                  <div className="flex-shrink-0">
                    <div
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: record.relevanceScore >= 50
                          ? '#dcfce7'
                          : record.relevanceScore >= 25
                          ? '#fef9c3'
                          : '#fee2e2',
                        color: record.relevanceScore >= 50
                          ? '#166534'
                          : record.relevanceScore >= 25
                          ? '#854d0e'
                          : '#991b1b'
                      }}
                    >
                      {record.relevanceScore >= 50 ? 'High' : record.relevanceScore >= 25 ? 'Medium' : 'Low'} Match
                    </div>
                  </div>
                </div>

                {record.snippet && (
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">
                    {record.snippet}
                  </p>
                )}

                <div className="flex flex-wrap gap-1">
                  {record.relevanceReasons.slice(0, 2).map((reason, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-brand-green/10 text-brand-green px-2 py-0.5 rounded"
                    >
                      {reason}
                    </span>
                  ))}
                  {record.relevanceReasons.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{record.relevanceReasons.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-green flex-shrink-0 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {relatedRecords.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full text-sm text-brand-green hover:text-brand-darkgreen font-medium py-2 px-4 border border-brand-green/30 rounded-lg hover:bg-brand-green/5 transition-colors"
        >
          {isExpanded ? 'Show Less' : `Show ${relatedRecords.length - 3} More Related Records`}
        </button>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>How we find related records:</strong> We match based on location, time period, names,
          and other shared details to help you discover connections.
        </p>
      </div>
    </div>
  );
};

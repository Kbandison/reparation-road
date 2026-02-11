"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link2, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface RelatedRecord {
  id: string;
  name: string;
  collection: string;
  collectionSlug: string;
  details: string;
}

interface RelatedRecordsProps {
  currentRecordId: string;
  currentTable: string;
  searchTerms: {
    name?: string;
    location?: string;
    occupation?: string;
  };
  collectionSlug: string;
  maxResults?: number;
}

// Define related tables for cross-collection searching
const RELATED_TABLES = [
  {
    table: 'register_free_persons_jefferson',
    collection: 'Register of Free Persons - Jefferson',
    slug: 'slave-claims-commission/register-free-persons-jefferson',
    nameField: 'name',
    locationField: 'residence'
  },
  {
    table: 'register_free_persons_baldwin',
    collection: 'Register of Free Persons - Baldwin',
    slug: 'slave-claims-commission/register-free-persons-baldwin',
    nameField: 'name',
    locationField: 'residence'
  },
  {
    table: 'register_free_persons_camden',
    collection: 'Register of Free Persons - Camden',
    slug: 'slave-claims-commission/register-free-persons-camden',
    nameField: 'name',
    locationField: 'residence'
  },
  {
    table: 'register_free_persons_hancock',
    collection: 'Register of Free Persons - Hancock',
    slug: 'slave-claims-commission/register-free-persons-hancock',
    nameField: 'name',
    locationField: 'residence'
  },
  {
    table: 'register_free_persons_lincoln',
    collection: 'Register of Free Persons - Lincoln',
    slug: 'slave-claims-commission/register-free-persons-lincoln',
    nameField: 'name',
    locationField: 'residence'
  },
  {
    table: 'register_free_persons_lumpkin',
    collection: 'Register of Free Persons - Lumpkin',
    slug: 'slave-claims-commission/register-free-persons-lumpkin',
    nameField: 'name',
    locationField: 'residence'
  },
  {
    table: 'slave_compensation_claims',
    collection: 'Slave Compensation Claims',
    slug: 'slave-compensation',
    nameField: 'first_name',
    locationField: 'owner_residence'
  },
  {
    table: 'emmigrants_to_liberia',
    collection: 'Emigrants to Liberia',
    slug: 'acs/emigrants-to-liberia',
    nameField: 'name',
    locationField: 'state_of_origin'
  },
  {
    table: 'aa_revolutionary_soldiers',
    collection: 'Revolutionary Soldiers',
    slug: 'revolutionary-soldiers',
    nameField: 'soldier_name',
    locationField: 'state'
  },
  {
    table: 'cherokee_henderson',
    collection: 'Cherokee Henderson Census',
    slug: 'native-american-records/early-cherokee-census/cherokee-henderson',
    nameField: 'head_of_family',
    locationField: 'residence'
  },
  {
    table: 'slave-importation-ga',
    collection: 'Georgia Slave Importation Records',
    slug: 'slave-importation/georgia',
    nameField: 'name',
    locationField: 'location'
  }
];

export function RelatedRecords({
  currentRecordId,
  currentTable,
  searchTerms,
  collectionSlug,
  maxResults = 5
}: RelatedRecordsProps) {
  const [relatedRecords, setRelatedRecords] = useState<RelatedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminRelated, setAdminRelated] = useState<RelatedRecord[]>([]);

  useEffect(() => {
    const fetchRelatedRecords = async () => {
      if (!searchTerms.name && !searchTerms.location) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const results: RelatedRecord[] = [];

      // First, check for admin-defined related records
      try {
        const { data: adminData } = await supabase
          .from('related_records')
          .select('*')
          .or(`source_record_id.eq.${currentRecordId},target_record_id.eq.${currentRecordId}`)
          .limit(maxResults);

        if (adminData && adminData.length > 0) {
          // Process admin-defined relationships
          for (const relation of adminData) {
            const targetId = relation.source_record_id === currentRecordId
              ? relation.target_record_id
              : relation.source_record_id;

            setAdminRelated(prev => [...prev, {
              id: targetId,
              name: relation.target_name || 'Related Record',
              collection: relation.target_collection,
              collectionSlug: relation.target_collection_slug,
              details: relation.relationship_note || ''
            }]);
          }
        }
      } catch {
        // Table may not exist yet, continue with auto-matching
      }

      // Search for related records by name similarity
      if (searchTerms.name) {
        const nameParts = searchTerms.name.toLowerCase().split(' ').filter(p => p.length > 2);

        for (const tableConfig of RELATED_TABLES) {
          // Skip current table
          if (tableConfig.table === currentTable) continue;

          try {
            for (const namePart of nameParts.slice(0, 2)) { // Search by first 2 name parts
              const { data, error } = await supabase
                .from(tableConfig.table)
                .select('id, ' + tableConfig.nameField + ', ' + tableConfig.locationField)
                .ilike(tableConfig.nameField, `%${namePart}%`)
                .neq('id', currentRecordId)
                .limit(3);

              if (!error && data && Array.isArray(data)) {
                for (const rawRecord of data) {
                  const record = rawRecord as unknown as { id: string; [key: string]: unknown };
                  const recordId = record.id;
                  // Avoid duplicates
                  if (recordId && !results.find(r => r.id === recordId)) {
                    results.push({
                      id: recordId,
                      name: String(record[tableConfig.nameField] || 'Unknown'),
                      collection: tableConfig.collection,
                      collectionSlug: tableConfig.slug,
                      details: String(record[tableConfig.locationField] || '')
                    });
                  }
                }
              }
            }
          } catch (err) {
            // Table might not exist or have different schema
            console.debug(`Skipping ${tableConfig.table}:`, err);
          }
        }
      }

      setRelatedRecords(results.slice(0, maxResults));
      setLoading(false);
    };

    fetchRelatedRecords();
  }, [currentRecordId, currentTable, searchTerms, maxResults]);

  const allRelated = [...adminRelated, ...relatedRecords];

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-4 h-4 text-brand-green" />
          <h4 className="text-sm font-semibold text-brand-brown">Related Records</h4>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-brand-green" />
        </div>
      </div>
    );
  }

  if (allRelated.length === 0) {
    return null; // Don't show section if no related records found
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-brand-green" />
        <h4 className="text-sm font-semibold text-brand-brown">Related Records</h4>
      </div>
      <div className="space-y-2">
        {allRelated.map((record) => (
          <Link
            key={record.id}
            href={`/collections/${record.collectionSlug}?record=${record.id}`}
            className="block bg-white rounded-lg p-3 border border-gray-200 hover:border-brand-green hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-brand-brown text-sm">{record.name}</p>
                <p className="text-xs text-gray-500">{record.collection}</p>
                {record.details && (
                  <p className="text-xs text-gray-400">{record.details}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

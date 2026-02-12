"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link2, ChevronRight, Loader2, Star } from 'lucide-react';
import Link from 'next/link';

interface RelatedRecord {
  id: string;
  name: string;
  collection: string;
  collectionSlug: string;
  details: string;
  isAdminDefined?: boolean;
  isFeatured?: boolean;
  customBadge?: string | null;
  priority?: number;
}

interface AutoMatchSettings {
  auto_match_enabled: boolean;
  match_by_name: boolean;
  match_by_location: boolean;
  match_by_enslaver: boolean;
  match_by_date: boolean;
  max_auto_results: number;
  min_name_length: number;
}

const DEFAULT_SETTINGS: AutoMatchSettings = {
  auto_match_enabled: true,
  match_by_name: true,
  match_by_location: true,
  match_by_enslaver: false,
  match_by_date: false,
  max_auto_results: 5,
  min_name_length: 3
};

interface RelatedRecordsProps {
  currentRecordId: string;
  currentTable: string;
  searchTerms: {
    name?: string;
    location?: string;
    occupation?: string;
    enslaver?: string;
    date?: string;
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
  const [settings, setSettings] = useState<AutoMatchSettings>(DEFAULT_SETTINGS);

  // Fetch admin settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'related_records_config')
          .single();

        if (data?.value) {
          setSettings(data.value as AutoMatchSettings);
        }
      } catch {
        // Table may not exist yet, use defaults
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchRelatedRecords = async () => {
      setLoading(true);
      const adminResults: RelatedRecord[] = [];
      const autoResults: RelatedRecord[] = [];

      // First, check for admin-defined related records
      try {
        const { data: adminData } = await supabase
          .from('related_records')
          .select('*')
          .or(`source_record_id.eq.${currentRecordId},target_record_id.eq.${currentRecordId}`)
          .order('display_priority', { ascending: false })
          .limit(maxResults);

        if (adminData && adminData.length > 0) {
          // Process admin-defined relationships (bidirectional)
          for (const relation of adminData) {
            // Determine if current record is source or target
            const isSource = relation.source_record_id === currentRecordId;

            // Check if this relationship should be shown (bidirectional check)
            if (!isSource && !relation.is_bidirectional) {
              continue; // Skip one-way relationships when viewing target
            }

            // Get the OTHER record's info (the one we want to display)
            const relatedId = isSource ? relation.target_record_id : relation.source_record_id;
            const relatedName = isSource ? relation.target_name : relation.source_name;
            const relatedCollection = isSource ? relation.target_collection : relation.source_collection;
            const relatedSlug = isSource ? relation.target_collection_slug : relation.source_collection_slug;

            // Build details string with relationship type and note
            let details = '';
            if (relation.relationship_type && relation.relationship_type !== 'custom') {
              const typeLabels: Record<string, string> = {
                'family': 'Family Member',
                'same_enslaver': 'Same Enslaver',
                'same_location': 'Same Location',
                'same_voyage': 'Same Voyage',
                'same_transaction': 'Same Transaction',
                'mentioned_together': 'Mentioned Together'
              };
              details = typeLabels[relation.relationship_type] || relation.relationship_type;
            }
            if (relation.relationship_note) {
              details = details ? `${details} - ${relation.relationship_note}` : relation.relationship_note;
            }

            adminResults.push({
              id: relatedId,
              name: relatedName || 'Related Record',
              collection: relatedCollection,
              collectionSlug: relatedSlug,
              details,
              isAdminDefined: true,
              isFeatured: relation.is_featured || false,
              customBadge: relation.custom_badge,
              priority: relation.display_priority || 5
            });
          }
        }
      } catch {
        // Table may not exist yet, continue with auto-matching
      }

      // Auto-matching: Only run if enabled in admin settings
      if (settings.auto_match_enabled) {
        const effectiveMaxResults = settings.max_auto_results || maxResults;
        const minNameLength = settings.min_name_length || 3;

        // Search by name if enabled and we have a name
        if (settings.match_by_name && searchTerms.name) {
          const nameParts = searchTerms.name.toLowerCase().split(' ').filter(p => p.length >= minNameLength);

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
                    // Avoid duplicates (check both auto and admin results)
                    if (recordId &&
                        autoResults.length < effectiveMaxResults &&
                        !autoResults.find(r => r.id === recordId) &&
                        !adminResults.find(r => r.id === recordId)) {
                      autoResults.push({
                        id: recordId,
                        name: String(record[tableConfig.nameField] || 'Unknown'),
                        collection: tableConfig.collection,
                        collectionSlug: tableConfig.slug,
                        details: String(record[tableConfig.locationField] || ''),
                        priority: 0 // Auto-matched have lowest priority
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

        // Search by location if enabled and we have a location
        if (settings.match_by_location && searchTerms.location) {
          for (const tableConfig of RELATED_TABLES) {
            if (tableConfig.table === currentTable) continue;
            if (!tableConfig.locationField) continue;

            try {
              const { data, error } = await supabase
                .from(tableConfig.table)
                .select('id, ' + tableConfig.nameField + ', ' + tableConfig.locationField)
                .ilike(tableConfig.locationField, `%${searchTerms.location}%`)
                .neq('id', currentRecordId)
                .limit(3);

              if (!error && data && Array.isArray(data)) {
                for (const rawRecord of data) {
                  const record = rawRecord as unknown as { id: string; [key: string]: unknown };
                  const recordId = record.id;
                  if (recordId &&
                      autoResults.length < effectiveMaxResults &&
                      !autoResults.find(r => r.id === recordId) &&
                      !adminResults.find(r => r.id === recordId)) {
                    autoResults.push({
                      id: recordId,
                      name: String(record[tableConfig.nameField] || 'Unknown'),
                      collection: tableConfig.collection,
                      collectionSlug: tableConfig.slug,
                      details: `Location: ${String(record[tableConfig.locationField] || '')}`,
                      priority: 0
                    });
                  }
                }
              }
            } catch (err) {
              console.debug(`Skipping ${tableConfig.table} location search:`, err);
            }
          }
        }

        // Search by enslaver if enabled and we have an enslaver
        if (settings.match_by_enslaver && searchTerms.enslaver) {
          for (const tableConfig of RELATED_TABLES) {
            if (tableConfig.table === currentTable) continue;
            // Check if table has an enslaver-like field
            const enslaverFields = ['enslaver', 'owner', 'owner_name', 'master', 'claimant'];

            for (const enslaverField of enslaverFields) {
              try {
                const { data, error } = await supabase
                  .from(tableConfig.table)
                  .select('id, ' + tableConfig.nameField + ', ' + tableConfig.locationField)
                  .ilike(enslaverField, `%${searchTerms.enslaver}%`)
                  .neq('id', currentRecordId)
                  .limit(3);

                if (!error && data && Array.isArray(data)) {
                  for (const rawRecord of data) {
                    const record = rawRecord as unknown as { id: string; [key: string]: unknown };
                    const recordId = record.id;
                    if (recordId &&
                        autoResults.length < effectiveMaxResults &&
                        !autoResults.find(r => r.id === recordId) &&
                        !adminResults.find(r => r.id === recordId)) {
                      autoResults.push({
                        id: recordId,
                        name: String(record[tableConfig.nameField] || 'Unknown'),
                        collection: tableConfig.collection,
                        collectionSlug: tableConfig.slug,
                        details: `Same Enslaver: ${searchTerms.enslaver}`,
                        priority: 0
                      });
                    }
                  }
                }
              } catch {
                // Field doesn't exist on this table, continue
              }
            }
          }
        }

        // Search by date if enabled and we have a date
        if (settings.match_by_date && searchTerms.date) {
          // Extract year from date for broader matching
          const yearMatch = searchTerms.date.match(/\d{4}/);
          if (yearMatch) {
            const year = yearMatch[0];
            for (const tableConfig of RELATED_TABLES) {
              if (tableConfig.table === currentTable) continue;
              const dateFields = ['date', 'year', 'date_registered', 'registration_date', 'created_at'];

              for (const dateField of dateFields) {
                try {
                  const { data, error } = await supabase
                    .from(tableConfig.table)
                    .select('id, ' + tableConfig.nameField + ', ' + tableConfig.locationField)
                    .ilike(dateField, `%${year}%`)
                    .neq('id', currentRecordId)
                    .limit(3);

                  if (!error && data && Array.isArray(data)) {
                    for (const rawRecord of data) {
                      const record = rawRecord as unknown as { id: string; [key: string]: unknown };
                      const recordId = record.id;
                      if (recordId &&
                          autoResults.length < effectiveMaxResults &&
                          !autoResults.find(r => r.id === recordId) &&
                          !adminResults.find(r => r.id === recordId)) {
                        autoResults.push({
                          id: recordId,
                          name: String(record[tableConfig.nameField] || 'Unknown'),
                          collection: tableConfig.collection,
                          collectionSlug: tableConfig.slug,
                          details: `Same Time Period: ${year}`,
                          priority: 0
                        });
                      }
                    }
                  }
                } catch {
                  // Field doesn't exist on this table, continue
                }
              }
            }
          }
        }
      }

      // Sort admin results by priority (featured first, then by priority number)
      adminResults.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.priority || 0) - (a.priority || 0);
      });

      // Combine results: admin-defined first (sorted), then auto-matched
      const effectiveMaxResults = settings.max_auto_results || maxResults;
      const combined = [...adminResults, ...autoResults.slice(0, effectiveMaxResults - adminResults.length)];
      setRelatedRecords(combined);
      setLoading(false);
    };

    fetchRelatedRecords();
  }, [currentRecordId, currentTable, searchTerms, maxResults, collectionSlug, settings]);

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

  if (relatedRecords.length === 0) {
    return null; // Don't show section if no related records found
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-brand-green" />
        <h4 className="text-sm font-semibold text-brand-brown">Related Records</h4>
      </div>
      <div className="space-y-2">
        {relatedRecords.map((record) => (
          <Link
            key={record.id}
            href={`/collections/${record.collectionSlug}?record=${record.id}`}
            className={`block bg-white rounded-lg p-3 border transition-all ${
              record.isFeatured
                ? 'border-yellow-300 bg-yellow-50/30 hover:border-yellow-400 hover:shadow-sm'
                : 'border-gray-200 hover:border-brand-green hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-brand-brown text-sm">{record.name}</p>
                  {record.isFeatured && (
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  )}
                  {record.customBadge && (
                    <span className="px-1.5 py-0.5 bg-brand-green/10 text-brand-green text-[10px] rounded font-medium">
                      {record.customBadge}
                    </span>
                  )}
                  {record.isAdminDefined && !record.customBadge && (
                    <span className="px-1.5 py-0.5 bg-brand-green/10 text-brand-green text-[10px] rounded font-medium">
                      Linked
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{record.collection}</p>
                {record.details && (
                  <p className="text-xs text-gray-400 italic">{record.details}</p>
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

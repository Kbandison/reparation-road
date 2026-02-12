"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Link2,
  Search,
  Plus,
  Trash2,
  ArrowRight,
  Loader2,
  ChevronLeft,
  X,
  Check
} from 'lucide-react';

// All searchable collections
const COLLECTIONS = [
  { table: 'slave-importation-ga', name: 'Georgia Slave Importation Records', slug: 'slave-importation/georgia', nameField: 'name', secondaryField: 'by_whom_enslaved' },
  { table: 'slave_merchants_austin_laurens', name: 'Austin & Laurens Slave Merchant Records', slug: 'rac-vlc/austin-laurens', nameField: 'to_whom_sold', secondaryField: 'location' },
  { table: 'slave_compensation_claims', name: 'Slave Compensation Claims', slug: 'slave-compensation', nameField: 'first_name', secondaryField: 'owner_name' },
  { table: 'register_free_persons_jefferson', name: 'Register of Free Persons - Jefferson', slug: 'slave-claims-commission/register-free-persons-jefferson', nameField: 'name', secondaryField: 'residence' },
  { table: 'register_free_persons_baldwin', name: 'Register of Free Persons - Baldwin', slug: 'slave-claims-commission/register-free-persons-baldwin', nameField: 'name', secondaryField: 'residence' },
  { table: 'register_free_persons_camden', name: 'Register of Free Persons - Camden', slug: 'slave-claims-commission/register-free-persons-camden', nameField: 'name', secondaryField: 'residence' },
  { table: 'register_free_persons_hancock', name: 'Register of Free Persons - Hancock', slug: 'slave-claims-commission/register-free-persons-hancock', nameField: 'name', secondaryField: 'residence' },
  { table: 'register_free_persons_lincoln', name: 'Register of Free Persons - Lincoln', slug: 'slave-claims-commission/register-free-persons-lincoln', nameField: 'name', secondaryField: 'residence' },
  { table: 'register_free_persons_lumpkin', name: 'Register of Free Persons - Lumpkin', slug: 'slave-claims-commission/register-free-persons-lumpkin', nameField: 'name', secondaryField: 'residence' },
  { table: 'register_free_persons_columbia', name: 'Register of Free Persons - Columbia', slug: 'slave-claims-commission/register-free-persons-columbia', nameField: 'name', secondaryField: 'residence' },
  { table: 'emmigrants_to_liberia', name: 'Emigrants to Liberia', slug: 'acs/emigrants-to-liberia', nameField: 'name', secondaryField: 'state_of_origin' },
  { table: 'cherokee_henderson', name: 'Cherokee Henderson Census', slug: 'native-american-records/early-cherokee-census/cherokee-henderson', nameField: 'head_of_family', secondaryField: 'residence' },
  { table: 'aa_revolutionary_soldiers', name: 'Revolutionary Soldiers', slug: 'revolutionary-soldiers', nameField: 'soldier_name', secondaryField: 'state' },
];

const RELATIONSHIP_TYPES = [
  { value: 'family', label: 'Family Member' },
  { value: 'same_enslaver', label: 'Same Enslaver' },
  { value: 'same_location', label: 'Same Location' },
  { value: 'same_voyage', label: 'Same Voyage' },
  { value: 'same_transaction', label: 'Same Transaction' },
  { value: 'mentioned_together', label: 'Mentioned Together' },
  { value: 'custom', label: 'Custom Relationship' },
];

interface SearchResult {
  id: string;
  name: string;
  secondary: string;
  table: string;
  collection: string;
  slug: string;
}

interface RelatedRecord {
  id: string;
  source_record_id: string;
  source_name: string;
  source_collection: string;
  source_collection_slug: string;
  target_record_id: string;
  target_name: string;
  target_collection: string;
  target_collection_slug: string;
  relationship_type: string;
  relationship_note: string;
  created_at: string;
}

const RelatedRecordsAdmin = () => {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  // State
  const [existingRelations, setExistingRelations] = useState<RelatedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New relationship form
  const [step, setStep] = useState<'select-source' | 'select-target' | 'confirm'>('select-source');
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [sourceResults, setSourceResults] = useState<SearchResult[]>([]);
  const [targetResults, setTargetResults] = useState<SearchResult[]>([]);
  const [selectedSource, setSelectedSource] = useState<SearchResult | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<SearchResult | null>(null);
  const [relationshipType, setRelationshipType] = useState('custom');
  const [relationshipNote, setRelationshipNote] = useState('');
  const [searchingSource, setSearchingSource] = useState(false);
  const [searchingTarget, setSearchingTarget] = useState(false);

  // Filter for existing relations
  const [filterSearch, setFilterSearch] = useState('');

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, profile, authLoading, router]);

  // Fetch existing relationships
  const fetchRelationships = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('related_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching relationships:', error);
        // Table might not exist yet
        setExistingRelations([]);
      } else {
        setExistingRelations(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setExistingRelations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchRelationships();
    }
  }, [profile, fetchRelationships]);

  // Search for records
  const searchRecords = async (query: string, isSource: boolean) => {
    if (query.length < 2) {
      if (isSource) setSourceResults([]);
      else setTargetResults([]);
      return;
    }

    if (isSource) setSearchingSource(true);
    else setSearchingTarget(true);

    const results: SearchResult[] = [];

    for (const collection of COLLECTIONS) {
      try {
        const { data, error } = await supabase
          .from(collection.table)
          .select(`id, ${collection.nameField}, ${collection.secondaryField}`)
          .or(`${collection.nameField}.ilike.%${query}%,${collection.secondaryField}.ilike.%${query}%`)
          .limit(5);

        if (!error && data) {
          for (const record of data) {
            const r = record as Record<string, unknown>;
            results.push({
              id: r.id as string,
              name: String(r[collection.nameField] || 'Unknown'),
              secondary: String(r[collection.secondaryField] || ''),
              table: collection.table,
              collection: collection.name,
              slug: collection.slug,
            });
          }
        }
      } catch {
        // Skip collections that error
      }
    }

    if (isSource) {
      setSourceResults(results.slice(0, 20));
      setSearchingSource(false);
    } else {
      // Filter out the source record from target results
      const filtered = selectedSource
        ? results.filter(r => r.id !== selectedSource.id)
        : results;
      setTargetResults(filtered.slice(0, 20));
      setSearchingTarget(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sourceSearch) searchRecords(sourceSearch, true);
    }, 300);
    return () => clearTimeout(timer);
  }, [sourceSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (targetSearch) searchRecords(targetSearch, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [targetSearch, selectedSource]);

  // Create relationship
  const createRelationship = async () => {
    if (!selectedSource || !selectedTarget) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('related_records')
        .insert({
          source_record_id: selectedSource.id,
          source_table: selectedSource.table,
          source_name: selectedSource.name,
          source_collection: selectedSource.collection,
          source_collection_slug: selectedSource.slug,
          target_record_id: selectedTarget.id,
          target_table: selectedTarget.table,
          target_name: selectedTarget.name,
          target_collection: selectedTarget.collection,
          target_collection_slug: selectedTarget.slug,
          relationship_type: relationshipType,
          relationship_note: relationshipNote,
          created_by: user?.id,
        });

      if (error) throw error;

      // Reset form
      setSelectedSource(null);
      setSelectedTarget(null);
      setSourceSearch('');
      setTargetSearch('');
      setRelationshipType('custom');
      setRelationshipNote('');
      setStep('select-source');

      // Refresh list
      await fetchRelationships();
    } catch (err) {
      console.error('Error creating relationship:', err);
      alert('Failed to create relationship. The table may not exist yet - please run the migration first.');
    } finally {
      setSaving(false);
    }
  };

  // Delete relationship
  const deleteRelationship = async (id: string) => {
    if (!confirm('Are you sure you want to delete this relationship?')) return;

    try {
      const { error } = await supabase
        .from('related_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchRelationships();
    } catch (err) {
      console.error('Error deleting relationship:', err);
      alert('Failed to delete relationship');
    }
  };

  // Filter existing relations
  const filteredRelations = existingRelations.filter(r =>
    !filterSearch ||
    r.source_name?.toLowerCase().includes(filterSearch.toLowerCase()) ||
    r.target_name?.toLowerCase().includes(filterSearch.toLowerCase()) ||
    r.source_collection?.toLowerCase().includes(filterSearch.toLowerCase()) ||
    r.target_collection?.toLowerCase().includes(filterSearch.toLowerCase()) ||
    r.relationship_note?.toLowerCase().includes(filterSearch.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-beige py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/admin')}
            variant="outline"
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          <div className="flex items-center mb-2">
            <Link2 className="w-8 h-8 text-brand-green mr-3" />
            <h1 className="text-4xl font-bold text-brand-brown">Related Records Manager</h1>
          </div>
          <p className="text-gray-600">
            Create and manage relationships between records across different collections.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create New Relationship */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-brand-brown mb-6 flex items-center">
              <Plus className="w-6 h-6 mr-2" />
              Create New Relationship
            </h2>

            {/* Step 1: Select Source */}
            {step === 'select-source' && (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Step 1: Search for the <strong>source record</strong> (the record you want to add a relationship to).
                </p>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search by name, location, or other details..."
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchingSource && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-green" />
                  </div>
                )}

                {sourceResults.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {sourceResults.map((result) => (
                      <button
                        key={`${result.table}-${result.id}`}
                        onClick={() => {
                          setSelectedSource(result);
                          setStep('select-target');
                          setSourceResults([]);
                        }}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-brand-green hover:bg-brand-tan/10 transition-colors"
                      >
                        <p className="font-medium text-brand-brown">{result.name}</p>
                        <p className="text-sm text-gray-600">{result.collection}</p>
                        {result.secondary && (
                          <p className="text-xs text-gray-400">{result.secondary}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {sourceSearch.length >= 2 && !searchingSource && sourceResults.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No records found</p>
                )}
              </div>
            )}

            {/* Step 2: Select Target */}
            {step === 'select-target' && selectedSource && (
              <div>
                <div className="bg-brand-tan/20 p-3 rounded-lg mb-4">
                  <p className="text-xs text-gray-500 mb-1">Source Record:</p>
                  <p className="font-medium text-brand-brown">{selectedSource.name}</p>
                  <p className="text-sm text-gray-600">{selectedSource.collection}</p>
                  <button
                    onClick={() => {
                      setSelectedSource(null);
                      setStep('select-source');
                    }}
                    className="text-xs text-red-600 hover:underline mt-1"
                  >
                    Change
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Step 2: Search for the <strong>related record</strong> you want to link.
                </p>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search for related record..."
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchingTarget && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-green" />
                  </div>
                )}

                {targetResults.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {targetResults.map((result) => (
                      <button
                        key={`${result.table}-${result.id}`}
                        onClick={() => {
                          setSelectedTarget(result);
                          setStep('confirm');
                          setTargetResults([]);
                        }}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-brand-green hover:bg-brand-tan/10 transition-colors"
                      >
                        <p className="font-medium text-brand-brown">{result.name}</p>
                        <p className="text-sm text-gray-600">{result.collection}</p>
                        {result.secondary && (
                          <p className="text-xs text-gray-400">{result.secondary}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {targetSearch.length >= 2 && !searchingTarget && targetResults.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No records found</p>
                )}
              </div>
            )}

            {/* Step 3: Confirm & Add Details */}
            {step === 'confirm' && selectedSource && selectedTarget && (
              <div>
                <div className="bg-brand-tan/20 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Source:</p>
                      <p className="font-medium text-brand-brown text-sm">{selectedSource.name}</p>
                      <p className="text-xs text-gray-600">{selectedSource.collection}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-brand-green flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Related:</p>
                      <p className="font-medium text-brand-brown text-sm">{selectedTarget.name}</p>
                      <p className="text-xs text-gray-600">{selectedTarget.collection}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTarget(null);
                      setStep('select-target');
                    }}
                    className="text-xs text-red-600 hover:underline mt-2"
                  >
                    Change target
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship Type
                    </label>
                    <select
                      value={relationshipType}
                      onChange={(e) => setRelationshipType(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {RELATIONSHIP_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note (Optional)
                    </label>
                    <textarea
                      value={relationshipNote}
                      onChange={(e) => setRelationshipNote(e.target.value)}
                      placeholder="Add any notes about this relationship..."
                      className="w-full border rounded-lg px-3 py-2 h-24 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setSelectedSource(null);
                        setSelectedTarget(null);
                        setStep('select-source');
                        setRelationshipType('custom');
                        setRelationshipNote('');
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={createRelationship}
                      disabled={saving}
                      className="flex-1 bg-brand-green hover:bg-brand-darkgreen"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Create Relationship
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Existing Relationships */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-brand-brown mb-6 flex items-center">
              <Link2 className="w-6 h-6 mr-2" />
              Existing Relationships ({existingRelations.length})
            </h2>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Filter relationships..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredRelations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {existingRelations.length === 0
                    ? 'No relationships created yet. Create one using the form on the left.'
                    : 'No relationships match your filter.'
                  }
                </p>
              ) : (
                filteredRelations.map((relation) => (
                  <div
                    key={relation.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-brand-tan/30 text-brand-brown text-xs rounded">
                            {RELATIONSHIP_TYPES.find(t => t.value === relation.relationship_type)?.label || relation.relationship_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div>
                            <p className="font-medium text-brand-brown">{relation.source_name}</p>
                            <p className="text-xs text-gray-500">{relation.source_collection}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-brand-brown">{relation.target_name}</p>
                            <p className="text-xs text-gray-500">{relation.target_collection}</p>
                          </div>
                        </div>
                        {relation.relationship_note && (
                          <p className="text-xs text-gray-600 mt-2 italic">
                            &ldquo;{relation.relationship_note}&rdquo;
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteRelationship(relation.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete relationship"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">How it works</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Relationships you create here will appear in the &ldquo;Related Records&rdquo; section when users view either record</li>
            <li>Relationships are bidirectional - if you link A to B, users viewing B will also see A</li>
            <li>The automatic name/location matching will still work alongside your manual relationships</li>
            <li>Use relationship types and notes to help users understand why records are connected</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RelatedRecordsAdmin;

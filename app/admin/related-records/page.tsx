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
  Check,
  Star,
  Filter,
  Settings2,
  User,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';

// All searchable collections
const COLLECTIONS = [
  { table: 'slave-importation-ga', name: 'Georgia Slave Importation Records', slug: 'slave-importation/georgia', nameField: 'name', locationField: 'location', secondaryField: 'by_whom_enslaved' },
  { table: 'slave_merchants_austin_laurens', name: 'Austin & Laurens Slave Merchant Records', slug: 'rac-vlc/austin-laurens', nameField: 'to_whom_sold', locationField: 'location', secondaryField: 'date_sold' },
  { table: 'slave_compensation_claims', name: 'Slave Compensation Claims', slug: 'slave-compensation', nameField: 'first_name', locationField: 'owner_residence', secondaryField: 'owner_name' },
  { table: 'register_free_persons_jefferson', name: 'Register of Free Persons - Jefferson', slug: 'slave-claims-commission/register-free-persons-jefferson', nameField: 'name', locationField: 'residence', secondaryField: 'occupation' },
  { table: 'register_free_persons_baldwin', name: 'Register of Free Persons - Baldwin', slug: 'slave-claims-commission/register-free-persons-baldwin', nameField: 'name', locationField: 'residence', secondaryField: 'occupation' },
  { table: 'register_free_persons_camden', name: 'Register of Free Persons - Camden', slug: 'slave-claims-commission/register-free-persons-camden', nameField: 'name', locationField: 'residence', secondaryField: 'occupation' },
  { table: 'register_free_persons_hancock', name: 'Register of Free Persons - Hancock', slug: 'slave-claims-commission/register-free-persons-hancock', nameField: 'name', locationField: 'residence', secondaryField: 'occupation' },
  { table: 'register_free_persons_lincoln', name: 'Register of Free Persons - Lincoln', slug: 'slave-claims-commission/register-free-persons-lincoln', nameField: 'name', locationField: 'residence', secondaryField: 'occupation' },
  { table: 'register_free_persons_lumpkin', name: 'Register of Free Persons - Lumpkin', slug: 'slave-claims-commission/register-free-persons-lumpkin', nameField: 'name', locationField: 'residence', secondaryField: 'occupation' },
  { table: 'register_free_persons_columbia', name: 'Register of Free Persons - Columbia', slug: 'slave-claims-commission/register-free-persons-columbia', nameField: 'name', locationField: 'residence', secondaryField: 'occupation' },
  { table: 'emmigrants_to_liberia', name: 'Emigrants to Liberia', slug: 'acs/emigrants-to-liberia', nameField: 'name', locationField: 'state_of_origin', secondaryField: 'destination' },
  { table: 'cherokee_henderson', name: 'Cherokee Henderson Census', slug: 'native-american-records/early-cherokee-census/cherokee-henderson', nameField: 'head_of_family', locationField: 'residence', secondaryField: 'county' },
  { table: 'aa_revolutionary_soldiers', name: 'Revolutionary Soldiers', slug: 'revolutionary-soldiers', nameField: 'soldier_name', locationField: 'state', secondaryField: 'regiment' },
];

const RELATIONSHIP_TYPES = [
  { value: 'family', label: 'Family Member', icon: Users },
  { value: 'same_enslaver', label: 'Same Enslaver', icon: User },
  { value: 'same_location', label: 'Same Location', icon: MapPin },
  { value: 'same_voyage', label: 'Same Voyage', icon: Link2 },
  { value: 'same_transaction', label: 'Same Transaction', icon: Link2 },
  { value: 'mentioned_together', label: 'Mentioned Together', icon: Link2 },
  { value: 'custom', label: 'Custom Relationship', icon: Settings2 },
];

interface SearchResult {
  id: string;
  name: string;
  location: string;
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
  display_priority: number;
  is_bidirectional: boolean;
  is_featured: boolean;
  custom_badge: string | null;
  created_at: string;
}

const RelatedRecordsAdmin = () => {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  // State
  const [existingRelations, setExistingRelations] = useState<RelatedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search filters
  const [searchMode, setSearchMode] = useState<'all' | 'name' | 'location'>('all');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');

  // New relationship form
  const [step, setStep] = useState<'select-source' | 'select-target' | 'confirm'>('select-source');
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [sourceResults, setSourceResults] = useState<SearchResult[]>([]);
  const [targetResults, setTargetResults] = useState<SearchResult[]>([]);
  const [selectedSource, setSelectedSource] = useState<SearchResult | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<SearchResult | null>(null);
  const [searchingSource, setSearchingSource] = useState(false);
  const [searchingTarget, setSearchingTarget] = useState(false);

  // Relationship options
  const [relationshipType, setRelationshipType] = useState('custom');
  const [relationshipNote, setRelationshipNote] = useState('');
  const [displayPriority, setDisplayPriority] = useState(5);
  const [isBidirectional, setIsBidirectional] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [customBadge, setCustomBadge] = useState('');

  // Filter for existing relations
  const [filterSearch, setFilterSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

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
        .order('display_priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching relationships:', error);
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

  // Search for records with filters
  const searchRecords = async (query: string, isSource: boolean) => {
    if (query.length < 2) {
      if (isSource) setSourceResults([]);
      else setTargetResults([]);
      return;
    }

    if (isSource) setSearchingSource(true);
    else setSearchingTarget(true);

    const results: SearchResult[] = [];
    const collectionsToSearch = selectedCollection === 'all'
      ? COLLECTIONS
      : COLLECTIONS.filter(c => c.table === selectedCollection);

    for (const collection of collectionsToSearch) {
      try {
        // Build the search query based on search mode
        let searchQuery = supabase.from(collection.table).select('*');

        if (searchMode === 'name') {
          searchQuery = searchQuery.ilike(collection.nameField, `%${query}%`);
        } else if (searchMode === 'location') {
          searchQuery = searchQuery.ilike(collection.locationField, `%${query}%`);
        } else {
          // Search all fields
          searchQuery = searchQuery.or(
            `${collection.nameField}.ilike.%${query}%,${collection.locationField}.ilike.%${query}%,${collection.secondaryField}.ilike.%${query}%`
          );
        }

        const { data, error } = await searchQuery.limit(10);

        if (!error && data) {
          for (const record of data) {
            const r = record as unknown as Record<string, unknown>;
            results.push({
              id: String(r.id || ''),
              name: String(r[collection.nameField] || 'Unknown'),
              location: String(r[collection.locationField] || ''),
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
      setSourceResults(results.slice(0, 30));
      setSearchingSource(false);
    } else {
      const filtered = selectedSource
        ? results.filter(r => r.id !== selectedSource.id)
        : results;
      setTargetResults(filtered.slice(0, 30));
      setSearchingTarget(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sourceSearch) searchRecords(sourceSearch, true);
    }, 300);
    return () => clearTimeout(timer);
  }, [sourceSearch, searchMode, selectedCollection]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (targetSearch) searchRecords(targetSearch, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [targetSearch, selectedSource, searchMode, selectedCollection]);

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
          display_priority: displayPriority,
          is_bidirectional: isBidirectional,
          is_featured: isFeatured,
          custom_badge: customBadge || null,
          created_by: user?.id,
        });

      if (error) throw error;

      // Reset form
      resetForm();
      await fetchRelationships();
    } catch (err) {
      console.error('Error creating relationship:', err);
      alert('Failed to create relationship. Make sure the migration has been run.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedSource(null);
    setSelectedTarget(null);
    setSourceSearch('');
    setTargetSearch('');
    setRelationshipType('custom');
    setRelationshipNote('');
    setDisplayPriority(5);
    setIsBidirectional(true);
    setIsFeatured(false);
    setCustomBadge('');
    setStep('select-source');
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
  const filteredRelations = existingRelations.filter(r => {
    const matchesSearch = !filterSearch ||
      r.source_name?.toLowerCase().includes(filterSearch.toLowerCase()) ||
      r.target_name?.toLowerCase().includes(filterSearch.toLowerCase()) ||
      r.source_collection?.toLowerCase().includes(filterSearch.toLowerCase()) ||
      r.target_collection?.toLowerCase().includes(filterSearch.toLowerCase()) ||
      r.relationship_note?.toLowerCase().includes(filterSearch.toLowerCase()) ||
      r.custom_badge?.toLowerCase().includes(filterSearch.toLowerCase());

    const matchesType = filterType === 'all' || r.relationship_type === filterType;

    return matchesSearch && matchesType;
  });

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
      <div className="container mx-auto px-4 max-w-7xl">
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

            {/* Search Filters */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Search Filters</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Search by</label>
                  <select
                    value={searchMode}
                    onChange={(e) => setSearchMode(e.target.value as 'all' | 'name' | 'location')}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All Fields</option>
                    <option value="name">Name Only</option>
                    <option value="location">Location Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Collection</label>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All Collections</option>
                    {COLLECTIONS.map(c => (
                      <option key={c.table} value={c.table}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 1: Select Source */}
            {step === 'select-source' && (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Step 1: Search for the <strong>source record</strong>.
                </p>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder={searchMode === 'name' ? 'Search by name...' : searchMode === 'location' ? 'Search by location...' : 'Search by name, location, or details...'}
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
                  <div className="space-y-2 max-h-80 overflow-y-auto">
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
                        <div className="flex gap-4 text-xs text-gray-400 mt-1">
                          {result.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {result.location}
                            </span>
                          )}
                          {result.secondary && <span>{result.secondary}</span>}
                        </div>
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
                  {selectedSource.location && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {selectedSource.location}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      setSelectedSource(null);
                      setStep('select-source');
                    }}
                    className="text-xs text-red-600 hover:underline mt-2"
                  >
                    Change
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Step 2: Search for the <strong>related record</strong>.
                </p>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder={searchMode === 'name' ? 'Search by name...' : searchMode === 'location' ? 'Search by location...' : 'Search by name, location, or details...'}
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
                  <div className="space-y-2 max-h-80 overflow-y-auto">
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
                        <div className="flex gap-4 text-xs text-gray-400 mt-1">
                          {result.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {result.location}
                            </span>
                          )}
                          {result.secondary && <span>{result.secondary}</span>}
                        </div>
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
                  {/* Relationship Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {RELATIONSHIP_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            onClick={() => setRelationshipType(type.value)}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-colors ${
                              relationshipType === type.value
                                ? 'border-brand-green bg-brand-green/10 text-brand-green'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {type.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Badge */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Badge (Optional)
                    </label>
                    <Input
                      value={customBadge}
                      onChange={(e) => setCustomBadge(e.target.value)}
                      placeholder="e.g., Mother, Brother, Sold Together..."
                      maxLength={30}
                    />
                    <p className="text-xs text-gray-400 mt-1">Shows as a label on the related record</p>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note (Optional)
                    </label>
                    <textarea
                      value={relationshipNote}
                      onChange={(e) => setRelationshipNote(e.target.value)}
                      placeholder="Add details about this relationship..."
                      className="w-full border rounded-lg px-3 py-2 h-20 resize-none text-sm"
                    />
                  </div>

                  {/* Display Options */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Settings2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Display Options</span>
                    </div>

                    <div className="space-y-3">
                      {/* Priority */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Display Priority (1-10, higher shows first)
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={displayPriority}
                          onChange={(e) => setDisplayPriority(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Low</span>
                          <span className="font-medium text-brand-green">{displayPriority}</span>
                          <span>High</span>
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isBidirectional}
                            onChange={(e) => setIsBidirectional(e.target.checked)}
                            className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                          />
                          <span className="text-sm text-gray-700">Show on both records</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="rounded border-gray-300 text-brand-green focus:ring-brand-green"
                          />
                          <Star className={`w-4 h-4 ${isFeatured ? 'text-yellow-500' : 'text-gray-400'}`} />
                          <span className="text-sm text-gray-700">Featured</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={resetForm}
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

            {/* Filters */}
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Filter relationships..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                {RELATIONSHIP_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredRelations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {existingRelations.length === 0
                    ? 'No relationships created yet.'
                    : 'No relationships match your filter.'
                  }
                </p>
              ) : (
                filteredRelations.map((relation) => (
                  <div
                    key={relation.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      relation.is_featured
                        ? 'border-yellow-300 bg-yellow-50/50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-brand-tan/30 text-brand-brown text-xs rounded">
                            {RELATIONSHIP_TYPES.find(t => t.value === relation.relationship_type)?.label || relation.relationship_type}
                          </span>
                          {relation.custom_badge && (
                            <span className="px-2 py-0.5 bg-brand-green/10 text-brand-green text-xs rounded font-medium">
                              {relation.custom_badge}
                            </span>
                          )}
                          {relation.is_featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                          {!relation.is_bidirectional && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                              One-way
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">
                            Priority: {relation.display_priority}
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
          <h3 className="text-lg font-semibold text-blue-800 mb-3">How it works</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">Search Options</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>All Fields:</strong> Search name, location, and other details</li>
                <li><strong>Name Only:</strong> Search only by person/entity name</li>
                <li><strong>Location Only:</strong> Search by residence, state, or location</li>
                <li>Filter by specific collection to narrow results</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Display Options</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Priority:</strong> Higher priority relationships show first</li>
                <li><strong>Bidirectional:</strong> Show on both records (or just source)</li>
                <li><strong>Featured:</strong> Highlight important relationships</li>
                <li><strong>Custom Badge:</strong> Add a label like &ldquo;Mother&rdquo; or &ldquo;Sold Together&rdquo;</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatedRecordsAdmin;

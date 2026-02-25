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
  Settings2,
  User,
  MapPin,
  Users,
  Sliders,
  Save
} from 'lucide-react';

// All searchable collections

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
  min_name_length: 3,
};

const RelatedRecordsAdmin = () => {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  // State
  const [existingRelations, setExistingRelations] = useState<RelatedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'relationships' | 'settings'>('relationships');

  // Auto-match settings
  const [settings, setSettings] = useState<AutoMatchSettings>(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsChanged, setSettingsChanged] = useState(false);

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

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      setSettingsLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'related_records_config')
        .single();

      if (error) {
        // Table might not exist or no record found - use defaults
        console.log('Settings not found, using defaults. Error:', error.message);
      } else if (data?.value) {
        setSettings(data.value as AutoMatchSettings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // Save settings
  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: 'related_records_config',
          value: settings,
          description: 'Configuration for automatic related records matching',
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error('Supabase error:', error.message, error.details, error.hint);
        throw new Error(error.message || 'Unknown database error');
      }
      setSettingsChanged(false);
      alert('Settings saved successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error saving settings:', errorMessage);
      alert(`Failed to save settings: ${errorMessage}\n\nMake sure:\n1. Migration 005_related_records_settings.sql has been run\n2. You are logged in as an admin`);
    } finally {
      setSettingsSaving(false);
    }
  };

  // Update a setting
  const updateSetting = <K extends keyof AutoMatchSettings>(key: K, value: AutoMatchSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSettingsChanged(true);
  };

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
      fetchSettings();
    }
  }, [profile, fetchRelationships, fetchSettings]);

  // Search for records using the shared search API
  const searchRecords = async (query: string, isSource: boolean) => {
    if (query.length < 2) {
      if (isSource) setSourceResults([]);
      else setTargetResults([]);
      return;
    }

    if (isSource) setSearchingSource(true);
    else setSearchingTarget(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`);
      const data = await response.json();

      const results: SearchResult[] = (data.results || [])
        .filter((r: Record<string, unknown>) => !r._isCollection && r.id && r._table)
        .map((r: Record<string, unknown>) => ({
          id: String(r.id),
          name: String(r._identifier || r.name || r.soldier_name || r.head_of_family || r.first_name || r.to_whom_sold || r.enslaver_family || 'Unknown'),
          location: String(r.residence || r.state || r.location || r.state_of_origin || r.owner_residence || r.state_county || ''),
          secondary: String(r.occupation || r.regiment || r.date_sold || r.by_whom_enslaved || r.date || ''),
          table: String(r._table),
          collection: String(r._collection),
          slug: String(r._collectionSlug),
        }));

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
    } catch (err) {
      console.error('Search error:', err);
      if (isSource) setSearchingSource(false);
      else setSearchingTarget(false);
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
          display_priority: displayPriority,
          is_bidirectional: isBidirectional,
          is_featured: isFeatured,
          custom_badge: customBadge || null,
          created_by: user?.id,
        });

      if (error) throw error;

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
            Create manual relationships and configure automatic matching settings.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('relationships')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'relationships'
                ? 'bg-brand-green text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Link2 className="w-4 h-4 inline mr-2" />
            Manual Relationships
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-brand-green text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sliders className="w-4 h-4 inline mr-2" />
            Auto-Match Settings
          </button>
        </div>

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
            <h2 className="text-2xl font-semibold text-brand-brown mb-6 flex items-center">
              <Sliders className="w-6 h-6 mr-2" />
              Auto-Match Settings
            </h2>
            <p className="text-gray-600 mb-4">
              Configure how related records are automatically found based on matching criteria.
              These settings affect all collection pages.
            </p>

            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> If you get an error saving, run the migration{' '}
                <code className="bg-blue-100 px-1 rounded">005_related_records_settings.sql</code>{' '}
                in your Supabase SQL Editor.
              </p>
            </div>

            {settingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Master Toggle */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-medium text-brand-brown">Enable Auto-Matching</p>
                      <p className="text-sm text-gray-500">
                        Automatically find related records based on matching criteria
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.auto_match_enabled}
                      onChange={(e) => updateSetting('auto_match_enabled', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                    />
                  </label>
                </div>

                {/* Match Criteria */}
                <div className={settings.auto_match_enabled ? '' : 'opacity-50 pointer-events-none'}>
                  <h3 className="text-lg font-medium text-brand-brown mb-4">Match By</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.match_by_name}
                        onChange={(e) => updateSetting('match_by_name', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Name</p>
                        <p className="text-xs text-gray-500">Match by person/entity name</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.match_by_location}
                        onChange={(e) => updateSetting('match_by_location', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Location</p>
                        <p className="text-xs text-gray-500">Match by residence/state</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.match_by_enslaver}
                        onChange={(e) => updateSetting('match_by_enslaver', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Enslaver</p>
                        <p className="text-xs text-gray-500">Match by enslaver name</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={settings.match_by_date}
                        onChange={(e) => updateSetting('match_by_date', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                      />
                      <div>
                        <p className="font-medium text-gray-900">Date</p>
                        <p className="text-xs text-gray-500">Match by date/year</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Numeric Settings */}
                <div className={settings.auto_match_enabled ? '' : 'opacity-50 pointer-events-none'}>
                  <h3 className="text-lg font-medium text-brand-brown mb-4">Limits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Auto Results
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={settings.max_auto_results}
                        onChange={(e) => updateSetting('max_auto_results', parseInt(e.target.value) || 5)}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">Max auto-matched records to show</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Name Length
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="10"
                        value={settings.min_name_length}
                        onChange={(e) => updateSetting('min_name_length', parseInt(e.target.value) || 3)}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">Min characters for name matching</p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={saveSettings}
                    disabled={settingsSaving || !settingsChanged}
                    className="bg-brand-green hover:bg-brand-darkgreen"
                  >
                    {settingsSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Settings
                  </Button>
                  {settingsChanged && (
                    <span className="ml-3 text-sm text-orange-600">Unsaved changes</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Relationships Tab */}
        {activeTab === 'relationships' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Create New Relationship */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-brand-brown mb-6 flex items-center">
                <Plus className="w-6 h-6 mr-2" />
                Create Manual Relationship
              </h2>

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
                      placeholder="Search by name or location..."
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
                          {result.location && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {result.location}
                            </p>
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
                      placeholder="Search by name or location..."
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
                          {result.location && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {result.location}
                            </p>
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
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Priority (1-10, higher shows first)
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
                      <Button onClick={resetForm} variant="outline" className="flex-1">
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
                        Create
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

              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Filter..."
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
        )}
      </div>
    </div>
  );
};

export default RelatedRecordsAdmin;

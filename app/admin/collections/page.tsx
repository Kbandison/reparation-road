"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Book,
  FileText,
  Image as ImageIcon,
  Upload,
  Save,
  X,
  Loader2
} from 'lucide-react';
import Image from 'next/image';

interface ArchivePage {
  id: string;
  collection_slug: string;
  book_no: number;
  page_no: number;
  slug: string;
  image_path: string;
  title: string | null;
  year: number | null;
  location: string | null;
  tags: string[];
  ocr_text: string;
  created_at: string;
}

interface Collection {
  slug: string;
  name: string;
  pageCount: number;
  description?: string;
  tableType: 'archive_pages' | 'slave_compensation_claims' | 'emmigrants_to_liberia' | 'liberation_census_rolls' | 'revolutionary_soldiers' | 'coming_soon';
  tableName?: string;
}

// Predefined collections that should always appear
const PREDEFINED_COLLECTIONS: Omit<Collection, 'pageCount'>[] = [
  {
    slug: 'inspection-roll',
    name: 'Inspection Roll of Negroes',
    description: 'Historical inspection roll documents',
    tableType: 'archive_pages',
    tableName: 'archive_pages'
  },
  {
    slug: 'slave-compensation',
    name: 'Slave Compensation Claims',
    description: 'Post-Civil War compensation claims records',
    tableType: 'slave_compensation_claims',
    tableName: 'slave_compensation_claims'
  },
  {
    slug: 'acs-emigrants-to-liberia',
    name: 'ACS: Emigrants to Liberia',
    description: 'American Colonization Society emigrant records',
    tableType: 'emmigrants_to_liberia',
    tableName: 'emmigrants_to_liberia'
  },
  {
    slug: 'acs-liberation-census-rolls',
    name: 'ACS: Liberian Census Rolls',
    description: 'Census records from Liberia',
    tableType: 'liberation_census_rolls',
    tableName: 'liberation_census_rolls'
  },
  {
    slug: 'revolutionary-soldiers',
    name: 'African-American Revolutionary Soldiers',
    description: 'Revolutionary War service records',
    tableType: 'revolutionary_soldiers',
    tableName: 'revolutionary_soldiers'
  },
  {
    slug: 'bibles-churches',
    name: 'Bibles and Churches Records',
    description: 'Historical church and Bible records',
    tableType: 'coming_soon'
  },
  {
    slug: 'florida-louisiana',
    name: 'British/Spanish/French Florida and Louisiana',
    description: 'Colonial records from Florida and Louisiana',
    tableType: 'coming_soon'
  },
  {
    slug: 'clubs-organizations',
    name: 'Clubs and Organizations',
    description: 'African-American social organizations',
    tableType: 'coming_soon'
  },
  {
    slug: 'confederate-payrolls',
    name: 'Confederate Payrolls',
    description: 'Confederate army payroll records',
    tableType: 'coming_soon'
  },
  {
    slug: 'east-indians-native-americans',
    name: 'East Indians and Native Americans in MD/VA',
    description: 'Records from Maryland and Virginia',
    tableType: 'coming_soon'
  },
  {
    slug: 'bills-of-exchange',
    name: 'English Bills of Exchange',
    description: 'Financial transaction records',
    tableType: 'coming_soon'
  },
  {
    slug: 'ex-slave-pension',
    name: 'Ex-slave Pension and Fraud Files',
    description: 'Pension applications and related documents',
    tableType: 'coming_soon'
  },
  {
    slug: 'free-black-census-1790',
    name: 'Free Black Heads of Household, 1790 Census',
    description: 'First US Census free Black households',
    tableType: 'coming_soon'
  },
  {
    slug: 'freedmen-refugee-contraband',
    name: 'Freedmen, Refugee and Contraband Records',
    description: 'Post-Civil War freedmen records',
    tableType: 'coming_soon'
  },
  {
    slug: 'fugitive-slave-cases',
    name: 'Fugitive and Slave Case Files',
    description: 'Legal case files and court records',
    tableType: 'coming_soon'
  },
  {
    slug: 'lost-friends',
    name: 'Lost Friends in Last Seen Ads',
    description: 'Historical missing persons advertisements',
    tableType: 'coming_soon'
  },
  {
    slug: 'native-american-records',
    name: 'Native American Records',
    description: 'Indigenous peoples historical documents',
    tableType: 'coming_soon'
  },
  {
    slug: 'georgia-passports',
    name: 'Passports Issued by Governors of Georgia 1785-1809',
    description: 'Early Georgia travel documents',
    tableType: 'coming_soon'
  },
  {
    slug: 'slave-claims-commission',
    name: 'Records of Slave Claims Commission',
    description: 'Commission records and claims',
    tableType: 'coming_soon'
  },
  {
    slug: 'rac-vlc',
    name: 'Records of the RAC and VOC',
    description: 'Royal African Company and Dutch East India Company',
    tableType: 'coming_soon'
  },
  {
    slug: 'tennessee-registers',
    name: 'Registers of Formerly Enslaved Tennessee',
    description: 'Tennessee emancipation registers',
    tableType: 'coming_soon'
  },
  {
    slug: 'mississippi-registers',
    name: 'Registers of Formerly Enslaved Mississippi',
    description: 'Mississippi emancipation registers',
    tableType: 'coming_soon'
  },
  {
    slug: 'slave-importation',
    name: 'Slave Importation Declaration',
    description: 'Import declarations and manifests',
    tableType: 'coming_soon'
  },
  {
    slug: 'slave-narratives',
    name: 'Slave Narratives',
    description: 'First-person accounts and narratives',
    tableType: 'coming_soon'
  },
  {
    slug: 'slave-voyages',
    name: 'Slave Voyages',
    description: 'Trans-Atlantic slave trade database',
    tableType: 'coming_soon'
  },
  {
    slug: 'southwest-georgia',
    name: 'Southwest Georgia Obits and Burials',
    description: 'Obituaries and burial records',
    tableType: 'coming_soon'
  },
  {
    slug: 'virginia-order-books',
    name: 'Virginia Order Books. Negro Adjudgments',
    description: 'Court order books and judgments',
    tableType: 'coming_soon'
  },
  {
    slug: 'virginia-property-tithes',
    name: 'Virginia Personal Property and Tithes Tables',
    description: 'Property and tax records',
    tableType: 'coming_soon'
  }
];

const AdminCollectionsPage = () => {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [pages, setPages] = useState<ArchivePage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [dbRecords, setDbRecords] = useState<Record<string, unknown>[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [editTableName, setEditTableName] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, profile, loading, router]);

  const fetchCollections = React.useCallback(async () => {
    try {
      setLoadingData(true);

      // Fetch counts for each table type
      const [archivePagesData, compensationData, emigrantsData, censusData, revolutionaryData] = await Promise.all([
        supabase.from('archive_pages').select('collection_slug'),
        supabase.from('slave_compensation_claims').select('id', { count: 'exact', head: true }),
        supabase.from('emmigrants_to_liberia').select('id', { count: 'exact', head: true }),
        supabase.from('liberation_census_rolls').select('id', { count: 'exact', head: true }),
        supabase.from('revolutionary_soldiers').select('id', { count: 'exact', head: true })
      ]);

      // Group archive_pages by collection slug
      const archiveMap = new Map<string, number>();
      archivePagesData.data?.forEach((page) => {
        const count = archiveMap.get(page.collection_slug) || 0;
        archiveMap.set(page.collection_slug, count + 1);
      });

      // Map table counts
      const tableCounts = {
        'slave_compensation_claims': compensationData.count || 0,
        'emmigrants_to_liberia': emigrantsData.count || 0,
        'liberation_census_rolls': censusData.count || 0,
        'revolutionary_soldiers': revolutionaryData.count || 0
      };

      // Build collections list with appropriate counts
      const collectionsList: Collection[] = PREDEFINED_COLLECTIONS.map((predef) => {
        let count = 0;

        if (predef.tableType === 'archive_pages') {
          count = archiveMap.get(predef.slug) || 0;
        } else if (predef.tableName && predef.tableName in tableCounts) {
          count = tableCounts[predef.tableName as keyof typeof tableCounts];
        }

        return {
          ...predef,
          pageCount: count,
        };
      });

      // Add any additional archive_pages collections not in predefined list
      Array.from(archiveMap.entries()).forEach(([slug, count]) => {
        if (!PREDEFINED_COLLECTIONS.some((c) => c.slug === slug)) {
          collectionsList.push({
            slug,
            name: formatCollectionName(slug),
            pageCount: count,
            tableType: 'archive_pages',
            tableName: 'archive_pages'
          });
        }
      });

      // Filter out collections with 0 records/pages (empty collections)
      const filteredList = collectionsList.filter((c) => c.pageCount > 0 || c.tableType === 'coming_soon');

      setCollections(filteredList.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchCollections();
    }
  }, [profile, fetchCollections]);

  const fetchPages = async (collectionSlug: string) => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('archive_pages')
        .select('*')
        .eq('collection_slug', collectionSlug)
        .order('book_no', { ascending: true })
        .order('page_no', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchDatabaseRecords = async (tableName: string) => {
    try {
      setDbLoading(true);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('id', { ascending: true })
        .limit(50); // Limit to first 50 records

      if (error) throw error;
      setDbRecords(data || []);
    } catch (error) {
      console.error('Error fetching database records:', error);
      setDbRecords([]);
    } finally {
      setDbLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToStorage = async (file: File, recordName: string): Promise<string> => {
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${recordName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
      const filePath = `images/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('revolutionary_soldiers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('revolutionary_soldiers')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image to storage');
    }
  };

  const handleEditRecord = (record: Record<string, unknown>, tableName: string) => {
    setEditingRecord(record);
    setEditTableName(tableName);
    setFormData({ ...record });

    // Set image preview for revolutionary_soldiers
    if (tableName === 'revolutionary_soldiers' && record.image) {
      setImagePreview(record.image as string);
    } else {
      setImagePreview('');
    }
    setImageFile(null);
  };

  const handleSaveRecord = async () => {
    if (!editingRecord || !editTableName) return;

    try {
      setUploading(true);
      let updatedFormData = { ...formData };

      // Handle image upload for revolutionary_soldiers
      if (editTableName === 'revolutionary_soldiers' && imageFile) {
        const recordName = (formData.name as string) || 'soldier';
        const imageUrl = await uploadImageToStorage(imageFile, recordName);
        updatedFormData = { ...updatedFormData, image: imageUrl };
      }

      const { error } = await supabase
        .from(editTableName)
        .update(updatedFormData)
        .eq('id', editingRecord.id);

      if (error) throw error;

      alert('Record updated successfully');
      setEditingRecord(null);
      setEditTableName(null);
      setFormData({});
      setImageFile(null);
      setImagePreview('');

      // Refresh the database records
      if (selectedCollection) {
        const collection = collections.find((c) => c.slug === selectedCollection);
        if (collection?.tableName) {
          await fetchDatabaseRecords(collection.tableName);
        }
      }
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setEditTableName(null);
    setFormData({});
    setImageFile(null);
    setImagePreview('');
  };

  const formatCollectionName = (slug: string): string => {
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleSelectCollection = (slug: string) => {
    setSelectedCollection(slug);
    const collection = collections.find(c => c.slug === slug);

    if (!collection) return;

    // Fetch data based on collection type
    if (collection.tableType === 'archive_pages') {
      fetchPages(slug);
    } else if (collection.tableName && collection.tableType !== 'coming_soon') {
      fetchDatabaseRecords(collection.tableName);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('archive_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      // Refresh the page list
      if (selectedCollection) {
        fetchPages(selectedCollection);
      }
      fetchCollections();

      alert('Page deleted successfully');
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Failed to delete page');
    }
  };

  const filteredPages = pages.filter(
    (page) =>
      page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.ocr_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `Book ${page.book_no} Page ${page.page_no}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown">Loading collection management...</p>
        </div>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-brand-brown flex items-center gap-3">
                <Book className="w-10 h-10" />
                Collection Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage historical documents and archive pages
              </p>
            </div>
            <Button
              onClick={() => router.push('/admin/collections/new')}
              className="bg-brand-green hover:bg-brand-darkgreen flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Page
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Collections Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-brand-brown mb-4">Collections</h2>
              <p className="text-sm text-gray-600 mb-4">
                {collections.length} collection{collections.length !== 1 ? 's' : ''}
              </p>

              <div className="space-y-2">
                {collections.map((collection) => (
                  <button
                    key={collection.slug}
                    onClick={() => handleSelectCollection(collection.slug)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCollection === collection.slug
                        ? 'bg-brand-green text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-brand-brown'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{collection.name}</p>
                          {collection.tableType !== 'archive_pages' && collection.tableType !== 'coming_soon' && (
                            <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                              selectedCollection === collection.slug
                                ? 'bg-white/20 text-white'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              DB
                            </span>
                          )}
                          {collection.tableType === 'coming_soon' && (
                            <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                              selectedCollection === collection.slug
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              Soon
                            </span>
                          )}
                        </div>
                        {collection.description && (
                          <p
                            className={`text-xs mt-1 ${
                              selectedCollection === collection.slug
                                ? 'text-white/70'
                                : 'text-gray-400'
                            }`}
                          >
                            {collection.description}
                          </p>
                        )}
                        <p
                          className={`text-xs mt-1 ${
                            selectedCollection === collection.slug
                              ? 'text-white/80'
                              : 'text-gray-500'
                          }`}
                        >
                          {collection.pageCount} {collection.tableType === 'archive_pages' ? 'page' : 'record'}{collection.pageCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <FileText className="w-5 h-5 flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ))}

                {collections.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No collections found</p>
                )}
              </div>
            </div>
          </div>

          {/* Pages List */}
          <div className="lg:col-span-2">
            {selectedCollection ? (
              (() => {
                const collection = collections.find((c) => c.slug === selectedCollection);

                // Show "Coming Soon" message
                if (collection?.tableType === 'coming_soon') {
                  return (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        {collection.name}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        This collection is coming soon. Data management will be available once the collection is implemented.
                      </p>
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  );
                }

                // Show database records table for database-backed collections
                if (
                  collection &&
                  (collection.tableType === 'slave_compensation_claims' ||
                    collection.tableType === 'emmigrants_to_liberia' ||
                    collection.tableType === 'liberation_census_rolls' ||
                    collection.tableType === 'revolutionary_soldiers')
                ) {
                  return (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-semibold text-brand-brown">
                            {collection.name}
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">
                            {collection.pageCount} record{collection.pageCount !== 1 ? 's' : ''} • Database Collection
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            // Navigate to dedicated admin page for full CRUD
                            if (collection.slug === 'slave-compensation') {
                              router.push('/admin/collections/slave-compensation');
                            } else if (collection.slug === 'acs-emigrants-to-liberia') {
                              router.push('/admin/collections/emigrants-to-liberia');
                            } else if (collection.slug === 'acs-liberation-census-rolls') {
                              router.push('/admin/collections/liberation-census-rolls');
                            } else if (collection.slug === 'revolutionary-soldiers') {
                              router.push('/admin/collections/revolutionary-soldiers');
                            }
                          }}
                          className="bg-brand-green hover:bg-brand-darkgreen flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add New Record
                        </Button>
                      </div>

                      {/* Search */}
                      <div className="mb-6">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            type="search"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {dbLoading ? (
                        <div className="text-center py-12">
                          <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-gray-500">Loading records...</p>
                        </div>
                      ) : dbRecords.length > 0 ? (
                        (() => {
                          // Filter database records based on search term
                          const filteredDbRecords = dbRecords.filter(record =>
                            Object.values(record).some(value =>
                              value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                            )
                          );

                          return (
                            <>
                              {searchTerm && (
                                <p className="text-sm text-gray-600 mb-4">
                                  Showing {filteredDbRecords.length} of {dbRecords.length} records
                                </p>
                              )}
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-gray-50 border-b">
                                    <tr>
                                      {Object.keys(dbRecords[0]).slice(0, 5).map((key) => (
                                        <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                          {key.replace(/_/g, ' ')}
                                        </th>
                                      ))}
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {filteredDbRecords.length === 0 ? (
                                      <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                                          No records found matching &quot;{searchTerm}&quot;
                                        </td>
                                      </tr>
                                    ) : (
                                      filteredDbRecords.slice(0, 50).map((record) => (
                                <tr key={String(record.id)} className="hover:bg-gray-50">
                                  {Object.values(record).slice(0, 5).map((value, idx) => (
                                    <td key={idx} className="px-4 py-3 text-sm text-gray-600">
                                      {value !== null && value !== undefined ? String(value).substring(0, 50) : '-'}
                                    </td>
                                  ))}
                                  <td className="px-4 py-3 text-sm">
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => {
                                          if (collection.tableName) {
                                            handleEditRecord(record, collection.tableName);
                                          }
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="flex items-center gap-1"
                                      >
                                        <Edit className="w-3 h-3" />
                                        Edit
                                      </Button>
                                      <Button
                                        onClick={async () => {
                                          if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
                                            return;
                                          }

                                          try {
                                            const { error } = await supabase
                                              .from(collection.tableName || '')
                                              .delete()
                                              .eq('id', record.id);

                                            if (error) throw error;

                                            alert('Record deleted successfully');
                                            // Refresh the data
                                            if (collection.tableName) {
                                              fetchDatabaseRecords(collection.tableName);
                                            }
                                            fetchCollections();
                                          } catch (error) {
                                            console.error('Error deleting record:', error);
                                            alert('Failed to delete record');
                                          }
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50 flex items-center gap-1"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        Delete
                                      </Button>
                                    </div>
                                  </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                                <div className="mt-4 text-sm text-gray-600 text-center">
                                  Showing first {Math.min(filteredDbRecords.length, 50)} of {filteredDbRecords.length} filtered records
                                </div>
                              </div>
                            </>
                          );
                        })()
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-500">No records found</p>
                        </div>
                      )}
                    </div>
                  );
                }

                // Default: archive_pages management
                return (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold text-brand-brown">
                        {formatCollectionName(selectedCollection)}
                      </h2>
                      <Button
                        onClick={() =>
                          router.push(`/admin/collections/new?collection=${selectedCollection}`)
                        }
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Page
                      </Button>
                    </div>

                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search pages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Pages Grid */}
                <div className="space-y-4">
                  {filteredPages.map((page) => (
                    <div
                      key={page.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-brand-green transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4 flex-1">
                          {page.image_path && (
                            <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-brand-brown">
                              {page.title || `Book ${page.book_no}, Page ${page.page_no}`}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Book {page.book_no} • Page {page.page_no}
                              {page.year && ` • ${page.year}`}
                              {page.location && ` • ${page.location}`}
                            </p>
                            {page.tags && page.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {page.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-brand-tan text-brand-brown text-xs rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {page.tags.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                                    +{page.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                            {page.ocr_text && (
                              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                {page.ocr_text.substring(0, 150)}...
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => router.push(`/admin/collections/edit/${page.id}`)}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeletePage(page.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredPages.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No pages found</p>
                    </div>
                  )}
                </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Select a Collection
                </h3>
                <p className="text-gray-500">
                  Choose a collection from the sidebar to view and manage its pages
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Record Modal */}
      {editingRecord && editTableName && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand-brown">Edit Record</h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Image Upload Section (only for revolutionary_soldiers) */}
              {editTableName === 'revolutionary_soldiers' && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soldier Image
                  </label>

                  <div className="flex gap-4">
                    {/* Image Preview */}
                    <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden relative border-2 border-gray-200">
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                          sizes="192px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-gray-300 mb-2" />
                          <p className="text-sm text-gray-400">No image</p>
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-brand-green transition-colors text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Click to upload new image
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>

                      {imageFile && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ New image selected: {imageFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {Object.keys(formData)
                  .filter((key) => key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'image')
                  .map((key) => (
                    <div key={key} className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <Input
                        type={typeof formData[key] === 'number' ? 'number' : 'text'}
                        value={formData[key]?.toString() || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({
                            ...formData,
                            [key]: typeof formData[key] === 'number' && value ? parseInt(value) : value
                          });
                        }}
                        className="w-full"
                      />
                    </div>
                  ))}
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleSaveRecord}
                  disabled={uploading}
                  className="bg-brand-green hover:bg-brand-darkgreen flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollectionsPage;

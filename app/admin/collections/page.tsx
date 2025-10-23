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
  Database
} from 'lucide-react';

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
  tableType: 'archive_pages' | 'slave_compensation_claims' | 'emmigrants_to_liberia' | 'liberation_census_rolls' | 'coming_soon';
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
    tableType: 'coming_soon'
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

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, profile, loading, router]);

  const fetchCollections = React.useCallback(async () => {
    try {
      setLoadingData(true);

      // Fetch counts for each table type
      const [archivePagesData, compensationData, emigrantsData, censusData] = await Promise.all([
        supabase.from('archive_pages').select('collection_slug'),
        supabase.from('slave_compensation_claims').select('id', { count: 'exact', head: true }),
        supabase.from('emmigrants_to_liberia').select('id', { count: 'exact', head: true }),
        supabase.from('liberation_census_rolls').select('id', { count: 'exact', head: true })
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
        'liberation_census_rolls': censusData.count || 0
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

      setCollections(collectionsList.sort((a, b) => a.name.localeCompare(b.name)));
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

  const formatCollectionName = (slug: string): string => {
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleSelectCollection = (slug: string) => {
    setSelectedCollection(slug);
    fetchPages(slug);
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

                // Show database management message for non-archive_pages collections
                if (collection?.tableType !== 'archive_pages' && collection?.tableType !== 'coming_soon') {
                  return (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-brand-brown">
                          {collection.name}
                        </h2>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                          Database Collection
                        </span>
                      </div>

                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                              Database-Backed Collection
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>
                                This collection uses structured database records in the <code className="bg-blue-100 px-1 rounded">{collection.tableName}</code> table.
                              </p>
                              <p className="mt-2">
                                <strong>Record Count:</strong> {collection.pageCount} record{collection.pageCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-semibold text-brand-brown mb-2">Management Options</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Manage records in this collection using the dedicated admin interface.
                          </p>
                          <div className="flex gap-3">
                            {collection.slug === 'slave-compensation' && (
                              <Button
                                onClick={() => router.push('/admin/collections/slave-compensation')}
                                className="bg-brand-green hover:bg-brand-darkgreen flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Manage Records
                              </Button>
                            )}
                            {collection.slug === 'acs-emigrants-to-liberia' && (
                              <Button
                                onClick={() => router.push('/admin/collections/emigrants-to-liberia')}
                                className="bg-brand-green hover:bg-brand-darkgreen flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Manage Records
                              </Button>
                            )}
                            {collection.slug === 'acs-liberation-census-rolls' && (
                              <Button
                                onClick={() => router.push('/admin/collections/liberation-census-rolls')}
                                className="bg-brand-green hover:bg-brand-darkgreen flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Manage Records
                              </Button>
                            )}
                            <Button
                              onClick={() => router.push('/collection')}
                              variant="outline"
                            >
                              View on Site
                            </Button>
                            <Button
                              onClick={() => window.open(`https://supabase.com/dashboard/project/_/editor/${collection.tableName}`, '_blank')}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Database className="w-4 h-4" />
                              Supabase
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-semibold text-brand-brown mb-2">Table Structure</h3>
                          <p className="text-sm text-gray-600">
                            View the collection on the public site to see the current data structure and records.
                          </p>
                        </div>
                      </div>
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
    </div>
  );
};

export default AdminCollectionsPage;

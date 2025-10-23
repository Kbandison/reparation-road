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
  Upload
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
}

// Predefined collections that should always appear
// Note: Only collections with actual archive_pages implementations are included here
const PREDEFINED_COLLECTIONS: Omit<Collection, 'pageCount'>[] = [
  {
    slug: 'inspection-roll',
    name: 'Inspection Roll of Negroes',
    description: 'Historical inspection roll documents'
  },
  {
    slug: 'slave-compensation',
    name: 'Slave Compensation Claims',
    description: 'Post-Civil War compensation claims records'
  },
  {
    slug: 'acs-emigrants-to-liberia',
    name: 'ACS: Emigrants to Liberia',
    description: 'American Colonization Society emigrant records'
  },
  {
    slug: 'acs-liberation-census-rolls',
    name: 'ACS: Liberian Census Rolls',
    description: 'Census records from Liberia'
  },
  {
    slug: 'revolutionary-soldiers',
    name: 'African-American Revolutionary Soldiers',
    description: 'Revolutionary War service records'
  },
  {
    slug: 'bibles-churches',
    name: 'Bibles and Churches Records',
    description: 'Historical church and Bible records'
  },
  {
    slug: 'florida-louisiana',
    name: 'British/Spanish/French Florida and Louisiana',
    description: 'Colonial records from Florida and Louisiana'
  },
  {
    slug: 'clubs-organizations',
    name: 'Clubs and Organizations',
    description: 'African-American social organizations'
  },
  {
    slug: 'confederate-payrolls',
    name: 'Confederate Payrolls',
    description: 'Confederate army payroll records'
  },
  {
    slug: 'east-indians-native-americans',
    name: 'East Indians and Native Americans in MD/VA',
    description: 'Records from Maryland and Virginia'
  },
  {
    slug: 'bills-of-exchange',
    name: 'English Bills of Exchange',
    description: 'Financial transaction records'
  },
  {
    slug: 'ex-slave-pension',
    name: 'Ex-slave Pension and Fraud Files',
    description: 'Pension applications and related documents'
  },
  {
    slug: 'free-black-census-1790',
    name: 'Free Black Heads of Household, 1790 Census',
    description: 'First US Census free Black households'
  },
  {
    slug: 'freedmen-refugee-contraband',
    name: 'Freedmen, Refugee and Contraband Records',
    description: 'Post-Civil War freedmen records'
  },
  {
    slug: 'fugitive-slave-cases',
    name: 'Fugitive and Slave Case Files',
    description: 'Legal case files and court records'
  },
  {
    slug: 'lost-friends',
    name: 'Lost Friends in Last Seen Ads',
    description: 'Historical missing persons advertisements'
  },
  {
    slug: 'native-american-records',
    name: 'Native American Records',
    description: 'Indigenous peoples historical documents'
  },
  {
    slug: 'georgia-passports',
    name: 'Passports Issued by Governors of Georgia 1785-1809',
    description: 'Early Georgia travel documents'
  },
  {
    slug: 'slave-claims-commission',
    name: 'Records of Slave Claims Commission',
    description: 'Commission records and claims'
  },
  {
    slug: 'rac-vlc',
    name: 'Records of the RAC and VOC',
    description: 'Royal African Company and Dutch East India Company'
  },
  {
    slug: 'tennessee-registers',
    name: 'Registers of Formerly Enslaved Tennessee',
    description: 'Tennessee emancipation registers'
  },
  {
    slug: 'mississippi-registers',
    name: 'Registers of Formerly Enslaved Mississippi',
    description: 'Mississippi emancipation registers'
  },
  {
    slug: 'slave-importation',
    name: 'Slave Importation Declaration',
    description: 'Import declarations and manifests'
  },
  {
    slug: 'slave-narratives',
    name: 'Slave Narratives',
    description: 'First-person accounts and narratives'
  },
  {
    slug: 'slave-voyages',
    name: 'Slave Voyages',
    description: 'Trans-Atlantic slave trade database'
  },
  {
    slug: 'southwest-georgia',
    name: 'Southwest Georgia Obits and Burials',
    description: 'Obituaries and burial records'
  },
  {
    slug: 'virginia-order-books',
    name: 'Virginia Order Books. Negro Adjudgments',
    description: 'Court order books and judgments'
  },
  {
    slug: 'virginia-property-tithes',
    name: 'Virginia Personal Property and Tithes Tables',
    description: 'Property and tax records'
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
      const { data, error } = await supabase
        .from('archive_pages')
        .select('collection_slug');

      if (error) throw error;

      // Group by collection and count pages
      const collectionMap = new Map<string, number>();
      data?.forEach((page) => {
        const count = collectionMap.get(page.collection_slug) || 0;
        collectionMap.set(page.collection_slug, count + 1);
      });

      // Start with predefined collections and merge with database counts
      const collectionsList: Collection[] = PREDEFINED_COLLECTIONS.map((predef) => ({
        ...predef,
        pageCount: collectionMap.get(predef.slug) || 0,
      }));

      // Add any additional collections found in database that aren't predefined
      Array.from(collectionMap.entries()).forEach(([slug, count]) => {
        if (!PREDEFINED_COLLECTIONS.some((c) => c.slug === slug)) {
          collectionsList.push({
            slug,
            name: formatCollectionName(slug),
            pageCount: count,
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
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-2">
                        <p className="font-medium">{collection.name}</p>
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
                          {collection.pageCount} page{collection.pageCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <FileText className="w-5 h-5 flex-shrink-0" />
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

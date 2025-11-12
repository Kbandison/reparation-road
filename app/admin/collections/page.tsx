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
  Loader2,
  Link as LinkIcon
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

interface SubCollection {
  slug: string;
  name: string;
  pageCount?: number;
  description?: string;
  tableType: 'archive_pages' | 'slave_compensation_claims' | 'emmigrants_to_liberia' | 'liberation_census_rolls' | 'revolutionary_soldiers' | 'free_black_heads_of_household' | 'enslaved_persons_alabama' | 'enslaved_catholic_kentuky' | 'slave_voyages' | 'ex_slave_pension' | 'coming_soon';
  tableName?: string;
}

interface Collection {
  slug: string;
  name: string;
  pageCount: number;
  description?: string;
  tableType: 'archive_pages' | 'slave_compensation_claims' | 'emmigrants_to_liberia' | 'liberation_census_rolls' | 'revolutionary_soldiers' | 'free_black_heads_of_household' | 'enslaved_persons_alabama' | 'enslaved_catholic_kentuky' | 'slave_voyages' | 'ex_slave_pension' | 'coming_soon';
  tableName?: string;
  subcollections?: SubCollection[];
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
    tableType: 'coming_soon',
    subcollections: [
      {
        slug: 'alabama-episcopal',
        name: 'Alabama Episcopal Registers',
        description: 'Enslaved persons mentioned in Alabama Episcopal church records',
        tableType: 'enslaved_persons_alabama',
        tableName: 'enslaved_persons_alabama'
      },
      {
        slug: 'kentucky-catholic',
        name: 'Kentucky Catholic Church Records',
        description: 'Enslaved persons in Kentucky Catholic baptism records',
        tableType: 'enslaved_catholic_kentuky',
        tableName: 'enslaved_catholic_kentuky'
      }
    ]
  },
  {
    slug: 'florida-louisiana',
    name: 'British/Spanish/French Florida and Louisiana',
    description: 'Colonial records from Florida and Louisiana',
    tableType: 'coming_soon',
    subcollections: [
      {
        slug: 'colored-baptisms-1784-1793',
        name: 'Colored Baptisms 1784-1793 (Diocese of St Augustine)',
        description: 'Baptism records of colored individuals from the Diocese of St Augustine spanning 1784-1793',
        tableType: 'coming_soon'
      },
      {
        slug: 'colored-baptisms-1807-1848',
        name: 'Colored Baptisms 1807-1848 (Diocese of St Augustine)',
        description: 'Baptism records of colored individuals from the Diocese of St Augustine spanning 1807-1848',
        tableType: 'coming_soon'
      },
      {
        slug: 'colored-deaths-1785-1821',
        name: 'Colored Deaths 1785-1821 (Diocese of St Augustine)',
        description: 'Death records of colored individuals from the Diocese of St Augustine spanning 1785-1821',
        tableType: 'coming_soon'
      },
      {
        slug: 'colored-marriages-1784-1882',
        name: 'Colored Marriages 1784-1882 (Diocese of St Augustine)',
        description: 'Marriage records of colored individuals from the Diocese of St Augustine spanning 1784-1882',
        tableType: 'coming_soon'
      },
      {
        slug: 'mixed-baptisms-1793-1807',
        name: 'Mixed Baptisms 1793-1807 (Diocese of St Augustine)',
        description: 'Mixed baptism records from the Diocese of St Augustine spanning 1793-1807',
        tableType: 'coming_soon'
      }
    ]
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
    tableType: 'coming_soon',
    subcollections: [
      {
        slug: 'case-files-formerly-enslaved',
        name: 'Case Files Concerning the Formerly Enslaved',
        description: 'Individual case files related to pension claims by formerly enslaved persons',
        tableType: 'ex_slave_pension',
        tableName: 'ex-slave-pension'
      },
      {
        slug: 'national-ex-slave-relief',
        name: 'Case Files: National Ex-Slave Mutual Relief Assn. of the US',
        description: 'Case files from the National Ex-Slave Mutual Relief Association pension fraud investigation',
        tableType: 'coming_soon'
      },
      {
        slug: 'correspondence-1892-1898',
        name: 'Chronological Correspondence: 1892-1898',
        description: 'Correspondence related to ex-slave pension fraud investigations from 1892-1898',
        tableType: 'coming_soon'
      },
      {
        slug: 'correspondence-1899-1904',
        name: 'Chronological Correspondence: 1899-1904',
        description: 'Correspondence related to ex-slave pension fraud investigations from 1899-1904',
        tableType: 'coming_soon'
      },
      {
        slug: 'correspondence-1905-1909',
        name: 'Chronological Correspondence: 1905-1909',
        description: 'Correspondence related to ex-slave pension fraud investigations from 1905-1909',
        tableType: 'coming_soon'
      },
      {
        slug: 'correspondence-1910-1917',
        name: 'Chronological Correspondence: 1910-1917',
        description: 'Correspondence related to ex-slave pension fraud investigations from 1910-1917',
        tableType: 'coming_soon'
      },
      {
        slug: 'correspondence-1918-1922',
        name: 'Chronological Correspondence: 1918-1922',
        description: 'Correspondence related to ex-slave pension fraud investigations from 1918-1922',
        tableType: 'coming_soon'
      }
    ]
  },
  {
    slug: 'free-black-census-1790',
    name: 'Free Black Heads of Household, 1790 Census',
    description: 'First US Census free Black households',
    tableType: 'free_black_heads_of_household',
    tableName: 'free_black_heads_of_household'
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
    tableType: 'coming_soon',
    subcollections: [
      { slug: 'alabama', name: 'Alabama', tableType: 'coming_soon' },
      { slug: 'alaska', name: 'Alaska', tableType: 'coming_soon' },
      { slug: 'arizona', name: 'Arizona', tableType: 'coming_soon' },
      { slug: 'arkansas', name: 'Arkansas', tableType: 'coming_soon' },
      { slug: 'california', name: 'California', tableType: 'coming_soon' },
      { slug: 'colorado', name: 'Colorado', tableType: 'coming_soon' },
      { slug: 'connecticut', name: 'Connecticut', tableType: 'coming_soon' },
      { slug: 'delaware', name: 'Delaware', tableType: 'coming_soon' },
      { slug: 'florida', name: 'Florida', tableType: 'coming_soon' },
      { slug: 'georgia', name: 'Georgia', tableType: 'coming_soon' },
      { slug: 'hawaii', name: 'Hawaii', tableType: 'coming_soon' },
      { slug: 'idaho', name: 'Idaho', tableType: 'coming_soon' },
      { slug: 'illinois', name: 'Illinois', tableType: 'coming_soon' },
      { slug: 'indiana', name: 'Indiana', tableType: 'coming_soon' },
      { slug: 'iowa', name: 'Iowa', tableType: 'coming_soon' },
      { slug: 'kansas', name: 'Kansas', tableType: 'coming_soon' },
      { slug: 'kentucky', name: 'Kentucky', tableType: 'coming_soon' },
      { slug: 'louisiana', name: 'Louisiana', tableType: 'coming_soon' },
      { slug: 'maine', name: 'Maine', tableType: 'coming_soon' },
      { slug: 'maryland', name: 'Maryland', tableType: 'coming_soon' },
      { slug: 'massachusetts', name: 'Massachusetts', tableType: 'coming_soon' },
      { slug: 'michigan', name: 'Michigan', tableType: 'coming_soon' },
      { slug: 'minnesota', name: 'Minnesota', tableType: 'coming_soon' },
      { slug: 'mississippi', name: 'Mississippi', tableType: 'coming_soon' },
      { slug: 'missouri', name: 'Missouri', tableType: 'coming_soon' },
      { slug: 'montana', name: 'Montana', tableType: 'coming_soon' },
      { slug: 'nebraska', name: 'Nebraska', tableType: 'coming_soon' },
      { slug: 'nevada', name: 'Nevada', tableType: 'coming_soon' },
      { slug: 'new-hampshire', name: 'New Hampshire', tableType: 'coming_soon' },
      { slug: 'new-jersey', name: 'New Jersey', tableType: 'coming_soon' },
      { slug: 'new-mexico', name: 'New Mexico', tableType: 'coming_soon' },
      { slug: 'new-york', name: 'New York', tableType: 'coming_soon' },
      { slug: 'north-carolina', name: 'North Carolina', tableType: 'coming_soon' },
      { slug: 'north-dakota', name: 'North Dakota', tableType: 'coming_soon' },
      { slug: 'ohio', name: 'Ohio', tableType: 'coming_soon' },
      { slug: 'oklahoma', name: 'Oklahoma', tableType: 'coming_soon' },
      { slug: 'oregon', name: 'Oregon', tableType: 'coming_soon' },
      { slug: 'pennsylvania', name: 'Pennsylvania', tableType: 'coming_soon' },
      { slug: 'rhode-island', name: 'Rhode Island', tableType: 'coming_soon' },
      { slug: 'south-carolina', name: 'South Carolina', tableType: 'coming_soon' },
      { slug: 'south-dakota', name: 'South Dakota', tableType: 'coming_soon' },
      { slug: 'tennessee', name: 'Tennessee', tableType: 'coming_soon' },
      { slug: 'texas', name: 'Texas', tableType: 'coming_soon' },
      { slug: 'utah', name: 'Utah', tableType: 'coming_soon' },
      { slug: 'vermont', name: 'Vermont', tableType: 'coming_soon' },
      { slug: 'virginia', name: 'Virginia', tableType: 'coming_soon' },
      { slug: 'washington', name: 'Washington', tableType: 'coming_soon' },
      { slug: 'west-virginia', name: 'West Virginia', tableType: 'coming_soon' },
      { slug: 'wisconsin', name: 'Wisconsin', tableType: 'coming_soon' },
      { slug: 'wyoming', name: 'Wyoming', tableType: 'coming_soon' }
    ]
  },
  {
    slug: 'native-american-records',
    name: 'Native American Records',
    description: 'Indigenous peoples historical documents',
    tableType: 'coming_soon',
    subcollections: [
      {
        slug: 'enslaved-fleeing-to-indian-country',
        name: 'Enslaved people fleeing to American Indian country',
        description: 'Records of enslaved persons who escaped to Native American territories',
        tableType: 'coming_soon'
      },
      {
        slug: 'baker-dawes',
        name: 'Baker & Dawes',
        description: 'Baker Roll and Dawes Commission records for Native American enrollment',
        tableType: 'coming_soon'
      },
      {
        slug: 'chickasaw-removal-1837-1847',
        name: 'Chickasaw Removal Records 1837-1847',
        description: 'Records documenting the forced removal of Chickasaw Nation members',
        tableType: 'coming_soon'
      },
      {
        slug: 'choctaw-other-freedmen',
        name: 'Choctaw & Other Freedmen',
        description: 'Records of freedmen associated with the Choctaw Nation and other tribes',
        tableType: 'coming_soon'
      },
      {
        slug: 'creek-census-1832',
        name: 'Creek Census 1832 (Parsons Abbott Roll)',
        description: 'Census of Creek Nation members conducted in 1832',
        tableType: 'coming_soon'
      },
      {
        slug: 'early-cherokee-census',
        name: 'Early Cherokee Census',
        description: 'Early census records of the Cherokee Nation',
        tableType: 'coming_soon'
      },
      {
        slug: 'letters-indian-affairs',
        name: 'Letters related to Indian Affairs',
        description: 'Correspondence and documents related to Native American affairs',
        tableType: 'coming_soon'
      },
      {
        slug: 'non-federal-tribal-info',
        name: 'Non-Federally Recognized Tribal Info',
        description: 'Information about tribes not recognized by the federal government',
        tableType: 'coming_soon'
      }
    ]
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
    tableType: 'slave_voyages',
    tableName: 'slave_voyages'
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
    tableType: 'coming_soon',
    subcollections: [
      {
        slug: 'chesterfield-county-1747-1821',
        name: 'Chesterfield County 1747-1821',
        description: 'Personal property and tithe records from Chesterfield County spanning 1747-1821',
        tableType: 'coming_soon'
      },
      {
        slug: 'franklin-county',
        name: 'Franklin County',
        description: 'Personal property and tithe records from Franklin County, Virginia',
        tableType: 'coming_soon'
      },
      {
        slug: 'hanover-county-1782-1786',
        name: 'Hanover County 1782-1786',
        description: 'Personal property and tithe records from Hanover County spanning 1782-1786',
        tableType: 'coming_soon'
      },
      {
        slug: 'lancaster-county',
        name: 'Lancaster County',
        description: 'Personal property and tithe records from Lancaster County, Virginia',
        tableType: 'coming_soon'
      },
      {
        slug: 'richmond',
        name: 'Richmond',
        description: 'Personal property and tithe records from Richmond, Virginia',
        tableType: 'coming_soon'
      }
    ]
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
  const [currentDbPage, setCurrentDbPage] = useState(1);
  const itemsPerDbPage = 50;

  // Archive pages editing states
  const [editingArchivePage, setEditingArchivePage] = useState<ArchivePage | null>(null);
  const [archivePageFormData, setArchivePageFormData] = useState({
    collection_slug: '',
    book_no: 1,
    page_no: 1,
    title: '',
    year: new Date().getFullYear(),
    location: '',
    tags: [] as string[],
    ocr_text: '',
  });
  const [archivePageImageSource, setArchivePageImageSource] = useState<'url' | 'upload'>('url');
  const [archivePageImageUrl, setArchivePageImageUrl] = useState('');
  const [archivePageImageFile, setArchivePageImageFile] = useState<File | null>(null);
  const [archivePageImagePreview, setArchivePageImagePreview] = useState<string>('');
  const [archivePageTagInput, setArchivePageTagInput] = useState('');
  const [archivePageSaving, setArchivePageSaving] = useState(false);

  // Helper function to find collection including subcollections
  const findCollection = (slug: string): Collection | undefined => {
    // First search in main collections
    const mainCollection = collections.find((c) => c.slug === slug);
    if (mainCollection) return mainCollection;

    // If not found, search in subcollections
    for (const collection of collections) {
      if (collection.subcollections) {
        const subcollection = collection.subcollections.find((sub) => sub.slug === slug);
        if (subcollection) {
          return subcollection as Collection;
        }
      }
    }
    return undefined;
  };

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, profile, loading, router]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentDbPage(1);
  }, [searchTerm]);

  const fetchCollections = React.useCallback(async () => {
    try {
      setLoadingData(true);

      // Fetch counts for each table type
      const [archivePagesData, compensationData, emigrantsData, censusData, revolutionaryData, freeBlackData, alabamaData, kentuckyData, slaveVoyagesData, exSlavePensionData] = await Promise.all([
        supabase.from('archive_pages').select('collection_slug'),
        supabase.from('slave_compensation_claims').select('id', { count: 'exact', head: true }),
        supabase.from('emmigrants_to_liberia').select('id', { count: 'exact', head: true }),
        supabase.from('liberation_census_rolls').select('id', { count: 'exact', head: true }),
        supabase.from('revolutionary_soldiers').select('id', { count: 'exact', head: true }),
        supabase.from('free_black_heads_of_household').select('id', { count: 'exact', head: true }),
        supabase.from('enslaved_persons_alabama').select('id', { count: 'exact', head: true }),
        supabase.from('enslaved_catholic_kentuky').select('page', { count: 'exact', head: true }),
        supabase.from('slave_voyages').select('id', { count: 'exact', head: true }),
        supabase.from('ex-slave-pension').select('id', { count: 'exact', head: true })
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
        'revolutionary_soldiers': revolutionaryData.count || 0,
        'free_black_heads_of_household': freeBlackData.count || 0,
        'enslaved_persons_alabama': alabamaData.count || 0,
        'enslaved_catholic_kentuky': kentuckyData.count || 0,
        'slave_voyages': slaveVoyagesData.count || 0,
        'ex-slave-pension': exSlavePensionData.count || 0
      };

      // Build collections list with appropriate counts
      const collectionsList: Collection[] = PREDEFINED_COLLECTIONS.map((predef) => {
        let count = 0;

        if (predef.tableType === 'archive_pages') {
          count = archiveMap.get(predef.slug) || 0;
        } else if (predef.tableName && predef.tableName in tableCounts) {
          count = tableCounts[predef.tableName as keyof typeof tableCounts];
        }

        // Process subcollections if they exist
        let subcollectionsWithCounts: SubCollection[] | undefined;
        if (predef.subcollections) {
          subcollectionsWithCounts = predef.subcollections.map((sub) => {
            let subCount = 0;
            if (sub.tableType === 'archive_pages') {
              subCount = archiveMap.get(sub.slug) || 0;
            } else if (sub.tableName && sub.tableName in tableCounts) {
              subCount = tableCounts[sub.tableName as keyof typeof tableCounts];
            }
            return {
              ...sub,
              pageCount: subCount
            };
          });
        }

        return {
          ...predef,
          pageCount: count,
          subcollections: subcollectionsWithCounts
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
      console.log(`Fetching records from ${tableName}...`);

      // Kentucky Catholic table uses 'page' as identifier, not 'id'
      const orderColumn = tableName === 'enslaved_catholic_kentuky' ? 'baptism_date' : 'id';

      const allRecords: Record<string, unknown>[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;
      let batchCount = 0;
      const maxBatches = 200; // Safety limit: max 200k records

      while (hasMore && batchCount < maxBatches) {
        console.log(`Fetching batch ${batchCount + 1}, offset ${from}...`);

        // For ex-slave-pension table, include related image table
        let data: Record<string, unknown>[] | null = null;
        let error = null;

        if (tableName === 'ex-slave-pension') {
          const result = await supabase
            .from(tableName)
            .select('*, ex_slave_pension_images(public_url)')
            .order(orderColumn, { ascending: true })
            .range(from, from + batchSize - 1);
          data = result.data as Record<string, unknown>[] | null;
          error = result.error;
        } else {
          const result = await supabase
            .from(tableName)
            .select('*')
            .order(orderColumn, { ascending: true })
            .range(from, from + batchSize - 1);
          data = result.data;
          error = result.error;
        }

        if (error) throw error;

        if (data && data.length > 0) {
          allRecords.push(...data);
          from += batchSize;
          hasMore = data.length === batchSize;
          batchCount++;
          console.log(`Batch ${batchCount} fetched: ${data.length} records. Total: ${allRecords.length}`);
        } else {
          hasMore = false;
        }
      }

      if (batchCount >= maxBatches) {
        console.warn(`Reached maximum batch limit (${maxBatches}). Some records may not be loaded.`);
      }

      console.log(`Finished fetching ${allRecords.length} records from ${tableName}`);
      setDbRecords(allRecords);
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

      console.log('Uploading image:', { fileName, filePath, fileSize: file.size });

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('revolutionary-soldiers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase storage error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from storage upload');
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('revolutionary-soldiers')
        .getPublicUrl(data.path);

      console.log('Public URL:', publicUrl);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);

      // Provide more specific error messages
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message;
        if (errorMessage.includes('not found')) {
          throw new Error('Storage bucket "revolutionary-soldiers" does not exist. Please create it in Supabase first.');
        } else if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
          throw new Error('Permission denied. Please check storage bucket policies in Supabase.');
        } else {
          throw new Error(`Upload failed: ${errorMessage}`);
        }
      }

      throw new Error('Failed to upload image to storage. Check console for details.');
    }
  };

  const handleEditRecord = (record: Record<string, unknown>, tableName: string) => {
    setEditingRecord(record);
    setEditTableName(tableName);
    setFormData({ ...record });

    // Set image preview for any record with image fields
    let imageUrl: string | null = null;

    // Check direct image fields
    if (record.image && typeof record.image === 'string') {
      imageUrl = record.image;
    } else if (record.image_url && typeof record.image_url === 'string') {
      imageUrl = record.image_url;
    } else if (record.image_path && typeof record.image_path === 'string') {
      imageUrl = record.image_path;
    } else if (record.photo && typeof record.photo === 'string') {
      imageUrl = record.photo;
    }
    // Check for related image tables (like ex_slave_pension_images)
    else if (record.ex_slave_pension_images) {
      // Handle array (one-to-many relationship)
      if (Array.isArray(record.ex_slave_pension_images) && record.ex_slave_pension_images.length > 0) {
        const imgData = record.ex_slave_pension_images[0] as Record<string, unknown>;
        if (imgData.public_url && typeof imgData.public_url === 'string') {
          imageUrl = imgData.public_url;
        }
      }
      // Handle object (one-to-one relationship)
      else if (typeof record.ex_slave_pension_images === 'object' && !Array.isArray(record.ex_slave_pension_images)) {
        const imgData = record.ex_slave_pension_images as Record<string, unknown>;
        if (imgData.public_url && typeof imgData.public_url === 'string') {
          imageUrl = imgData.public_url;
        }
      }
    }

    setImagePreview(imageUrl || '');
    setImageFile(null);
  };

  const handleSaveRecord = async () => {
    if (!editingRecord || !editTableName) return;

    try {
      setUploading(true);
      let updatedFormData = { ...formData };

      console.log('Saving record to table:', editTableName);
      console.log('Record ID:', editingRecord.id);
      console.log('Form data before processing:', updatedFormData);

      // Handle image upload for any table with image fields
      if (imageFile) {
        const recordName = (formData.name as string) || (formData.title as string) || `record-${editingRecord.id}`;
        const imageUrl = await uploadImageToStorage(imageFile, recordName);

        // Determine which image field to update based on what exists in the record
        if ('image' in editingRecord) {
          updatedFormData = { ...updatedFormData, image: imageUrl };
        } else if ('image_url' in editingRecord) {
          updatedFormData = { ...updatedFormData, image_url: imageUrl };
        } else if ('image_path' in editingRecord) {
          updatedFormData = { ...updatedFormData, image_path: imageUrl };
        } else if ('photo' in editingRecord) {
          updatedFormData = { ...updatedFormData, photo: imageUrl };
        } else {
          // Default to 'image' field if no image field exists
          updatedFormData = { ...updatedFormData, image: imageUrl };
        }
      }

      // Remove id and other system fields from update data
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, created_at: _created_at, updated_at: _updated_at, ...dataToUpdate } = updatedFormData;

      console.log('Data to update:', dataToUpdate);

      const { data, error } = await supabase
        .from(editTableName)
        .update(dataToUpdate)
        .eq('id', editingRecord.id)
        .select();

      console.log('Update response:', { data, error });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('No rows were updated. The record may not exist or you may not have permission to update it.');
      }

      // Close modal and reset state immediately
      setEditingRecord(null);
      setEditTableName(null);
      setFormData({});
      setImageFile(null);
      setImagePreview('');
      setUploading(false);

      alert('Record updated successfully');

      // Refresh the database records in the background
      if (selectedCollection) {
        const collection = findCollection(selectedCollection);
        if (collection?.tableName) {
          console.log('Refreshing database records...');
          fetchDatabaseRecords(collection.tableName).catch(err => {
            console.error('Error refreshing records:', err);
          });
        }
      }
    } catch (error) {
      console.error('Error updating record:', error);
      setUploading(false);
      if (error instanceof Error) {
        alert(`Failed to update record: ${error.message}`);
      } else {
        alert('Failed to update record');
      }
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
    const collection = findCollection(slug);

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

  // Archive page editing handlers
  const handleEditArchivePage = (page: ArchivePage) => {
    setEditingArchivePage(page);
    setArchivePageFormData({
      collection_slug: page.collection_slug || '',
      book_no: page.book_no || 1,
      page_no: page.page_no || 1,
      title: page.title || '',
      year: page.year || new Date().getFullYear(),
      location: page.location || '',
      tags: page.tags || [],
      ocr_text: page.ocr_text || '',
    });
    setArchivePageImageUrl(page.image_path || '');
    setArchivePageImagePreview(page.image_path || '');
    setArchivePageImageSource('url');
    setArchivePageImageFile(null);
    setArchivePageTagInput('');
  };

  const handleCancelArchivePageEdit = () => {
    setEditingArchivePage(null);
    setArchivePageFormData({
      collection_slug: '',
      book_no: 1,
      page_no: 1,
      title: '',
      year: new Date().getFullYear(),
      location: '',
      tags: [],
      ocr_text: '',
    });
    setArchivePageImageUrl('');
    setArchivePageImagePreview('');
    setArchivePageImageSource('url');
    setArchivePageImageFile(null);
    setArchivePageTagInput('');
  };

  const handleArchivePageImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      setArchivePageImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setArchivePageImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddArchivePageTag = () => {
    if (archivePageTagInput.trim() && !archivePageFormData.tags.includes(archivePageTagInput.trim())) {
      setArchivePageFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, archivePageTagInput.trim()],
      }));
      setArchivePageTagInput('');
    }
  };

  const handleRemoveArchivePageTag = (tagToRemove: string) => {
    setArchivePageFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const uploadArchivePageImageToStorage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${archivePageFormData.collection_slug}/book-${archivePageFormData.book_no}/page-${archivePageFormData.page_no}.${fileExt}`;
      const filePath = `archives/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('archives')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      const { data } = supabase.storage.from('archives').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadArchivePageImageToStorage:', error);
      throw error;
    }
  };

  const handleSaveArchivePage = async () => {
    if (!editingArchivePage) return;

    setArchivePageSaving(true);
    try {
      // Get image path
      let imagePath = archivePageImageUrl;
      if (archivePageImageSource === 'upload' && archivePageImageFile) {
        imagePath = await uploadArchivePageImageToStorage(archivePageImageFile);
      }

      if (!imagePath) {
        throw new Error('Please provide an image URL or upload an image file');
      }

      // Update slug if book/page numbers changed
      const slug = `${archivePageFormData.collection_slug}-book-${archivePageFormData.book_no}-page-${archivePageFormData.page_no}`;

      // Prepare update data
      const updateData = {
        collection_slug: archivePageFormData.collection_slug,
        book_no: archivePageFormData.book_no,
        page_no: archivePageFormData.page_no,
        slug,
        image_path: imagePath,
        title: archivePageFormData.title || null,
        year: archivePageFormData.year || null,
        location: archivePageFormData.location || null,
        tags: archivePageFormData.tags,
        ocr_text: archivePageFormData.ocr_text,
        updated_at: new Date().toISOString(),
      };

      // Update in database
      const { error } = await supabase
        .from('archive_pages')
        .update(updateData)
        .eq('id', editingArchivePage.id);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Refresh the page list
      if (selectedCollection) {
        fetchPages(selectedCollection);
      }
      fetchCollections();

      alert('Page updated successfully!');
      handleCancelArchivePageEdit();
    } catch (error) {
      console.error('Error updating page:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update page';
      alert(errorMessage);
    } finally {
      setArchivePageSaving(false);
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
                  <div key={collection.slug}>
                    <button
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

                    {/* Render subcollections if they exist */}
                    {collection.subcollections && collection.subcollections.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        {collection.subcollections.map((subcollection) => (
                          <button
                            key={subcollection.slug}
                            onClick={() => handleSelectCollection(subcollection.slug)}
                            className={`w-full text-left p-2 rounded-lg transition-colors text-sm ${
                              selectedCollection === subcollection.slug
                                ? 'bg-brand-green text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-brand-brown'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 pr-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">{subcollection.name}</p>
                                  {subcollection.tableType !== 'archive_pages' && subcollection.tableType !== 'coming_soon' && (
                                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                                      selectedCollection === subcollection.slug
                                        ? 'bg-white/20 text-white'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      DB
                                    </span>
                                  )}
                                </div>
                                {subcollection.description && (
                                  <p
                                    className={`text-xs mt-1 ${
                                      selectedCollection === subcollection.slug
                                        ? 'text-white/70'
                                        : 'text-gray-400'
                                    }`}
                                  >
                                    {subcollection.description}
                                  </p>
                                )}
                                <p
                                  className={`text-xs mt-1 ${
                                    selectedCollection === subcollection.slug
                                      ? 'text-white/80'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {subcollection.pageCount} record{subcollection.pageCount !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
                const collection = findCollection(selectedCollection);

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
                    collection.tableType === 'revolutionary_soldiers' ||
                    collection.tableType === 'free_black_heads_of_household' ||
                    collection.tableType === 'enslaved_persons_alabama' ||
                    collection.tableType === 'enslaved_catholic_kentuky' ||
                    collection.tableType === 'slave_voyages' ||
                    collection.tableType === 'ex_slave_pension')
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

                          // Pagination calculations
                          const totalDbPages = Math.ceil(filteredDbRecords.length / itemsPerDbPage);
                          const startDbIndex = (currentDbPage - 1) * itemsPerDbPage;
                          const endDbIndex = startDbIndex + itemsPerDbPage;
                          const currentDbRecords = filteredDbRecords.slice(startDbIndex, endDbIndex);

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
                                      {Object.keys(dbRecords[0])
                                        .filter(key => {
                                          // Filter out system fields and image fields
                                          return key !== 'id' &&
                                                 key !== 'created_at' &&
                                                 key !== 'updated_at' &&
                                                 key !== 'image' &&
                                                 key !== 'image_url' &&
                                                 key !== 'image_path' &&
                                                 key !== 'photo' &&
                                                 key !== 'ex_slave_pension_images';
                                        })
                                        .slice(0, 5)
                                        .map((key) => (
                                          <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            {key.replace(/_/g, ' ')}
                                          </th>
                                        ))}
                                      {(dbRecords[0].image !== undefined ||
                                        dbRecords[0].image_url !== undefined ||
                                        dbRecords[0].image_path !== undefined ||
                                        dbRecords[0].photo !== undefined ||
                                        dbRecords[0].ex_slave_pension_images !== undefined) && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                          Has Image
                                        </th>
                                      )}
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {filteredDbRecords.length === 0 ? (
                                      <tr>
                                        <td colSpan={(dbRecords[0].image !== undefined || dbRecords[0].image_url !== undefined || dbRecords[0].image_path !== undefined || dbRecords[0].photo !== undefined || dbRecords[0].ex_slave_pension_images !== undefined) ? 7 : 6} className="px-4 py-12 text-center text-gray-500">
                                          No records found matching &quot;{searchTerm}&quot;
                                        </td>
                                      </tr>
                                    ) : (
                                      currentDbRecords.map((record) => (
                                <tr key={String(record.id)} className="hover:bg-gray-50">
                                  {Object.entries(record)
                                    .filter(([key]) => {
                                      // Filter out system fields and image fields
                                      return key !== 'id' &&
                                             key !== 'created_at' &&
                                             key !== 'updated_at' &&
                                             key !== 'image' &&
                                             key !== 'image_url' &&
                                             key !== 'image_path' &&
                                             key !== 'photo';
                                    })
                                    .slice(0, 5)
                                    .map(([, value], idx) => (
                                      <td key={idx} className="px-4 py-3 text-sm text-gray-600">
                                        {value !== null && value !== undefined ? String(value).substring(0, 50) : '-'}
                                      </td>
                                    ))}
                                  {(record.image !== undefined ||
                                    record.image_url !== undefined ||
                                    record.image_path !== undefined ||
                                    record.photo !== undefined ||
                                    record.ex_slave_pension_images !== undefined) && (
                                    <td className="px-4 py-3 text-sm text-gray-600 font-semibold">
                                      {(() => {
                                        if (record.image || record.image_url || record.image_path || record.photo) return 'Y';
                                        if (record.ex_slave_pension_images) {
                                          // Handle array
                                          if (Array.isArray(record.ex_slave_pension_images) && record.ex_slave_pension_images.length > 0) {
                                            const imgData = record.ex_slave_pension_images[0] as Record<string, unknown>;
                                            return imgData.public_url ? 'Y' : 'N';
                                          }
                                          // Handle object
                                          else if (typeof record.ex_slave_pension_images === 'object' && !Array.isArray(record.ex_slave_pension_images)) {
                                            const imgData = record.ex_slave_pension_images as Record<string, unknown>;
                                            return imgData.public_url ? 'Y' : 'N';
                                          }
                                        }
                                        return 'N';
                                      })()}
                                    </td>
                                  )}
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

                                {/* Pagination for database records */}
                                {totalDbPages > 1 && (
                                  <div className="flex justify-center items-center gap-4 mt-6">
                                    <Button
                                      onClick={() => setCurrentDbPage(prev => Math.max(prev - 1, 1))}
                                      disabled={currentDbPage === 1}
                                      variant="outline"
                                      size="sm"
                                    >
                                      Previous
                                    </Button>

                                    <div className="flex gap-2">
                                      {Array.from({ length: Math.min(5, totalDbPages) }, (_, i) => {
                                        const pageNum = currentDbPage <= 3
                                          ? i + 1
                                          : currentDbPage >= totalDbPages - 2
                                          ? totalDbPages - 4 + i
                                          : currentDbPage - 2 + i;

                                        if (pageNum < 1 || pageNum > totalDbPages) return null;

                                        return (
                                          <Button
                                            key={pageNum}
                                            onClick={() => setCurrentDbPage(pageNum)}
                                            variant={currentDbPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            className={currentDbPage === pageNum ? "bg-brand-green hover:bg-brand-darkgreen" : ""}
                                          >
                                            {pageNum}
                                          </Button>
                                        );
                                      })}
                                    </div>

                                    <Button
                                      onClick={() => setCurrentDbPage(prev => Math.min(prev + 1, totalDbPages))}
                                      disabled={currentDbPage === totalDbPages}
                                      variant="outline"
                                      size="sm"
                                    >
                                      Next
                                    </Button>
                                  </div>
                                )}

                                <div className="mt-4 text-sm text-gray-600 text-center">
                                  Page {currentDbPage} of {totalDbPages} ({startDbIndex + 1}-{Math.min(endDbIndex, filteredDbRecords.length)} of {filteredDbRecords.length} record{filteredDbRecords.length !== 1 ? 's' : ''})
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
                            onClick={() => handleEditArchivePage(page)}
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
              {/* Image Upload Section (for any table with image fields) */}
              {(editingRecord.image !== undefined ||
                editingRecord.image_url !== undefined ||
                editingRecord.image_path !== undefined ||
                editingRecord.photo !== undefined ||
                editingRecord.ex_slave_pension_images !== undefined) && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image
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
                  .filter((key) =>
                    key !== 'id' &&
                    key !== 'created_at' &&
                    key !== 'updated_at' &&
                    key !== 'image' &&
                    key !== 'image_url' &&
                    key !== 'image_path' &&
                    key !== 'photo' &&
                    key !== 'ex_slave_pension_images'
                  )
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

      {/* Edit Archive Page Modal */}
      {editingArchivePage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-lg">
              <h2 className="text-2xl font-bold text-brand-brown">Edit Archive Page</h2>
              <button
                onClick={handleCancelArchivePageEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-brand-brown mb-4">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-brown mb-1">
                      Collection Slug *
                    </label>
                    <Input
                      value={archivePageFormData.collection_slug}
                      onChange={(e) => setArchivePageFormData({ ...archivePageFormData, collection_slug: e.target.value })}
                      required
                      placeholder="e.g., inspection-roll"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-brown mb-1">
                      Title (Optional)
                    </label>
                    <Input
                      value={archivePageFormData.title}
                      onChange={(e) => setArchivePageFormData({ ...archivePageFormData, title: e.target.value })}
                      placeholder="Page title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-brown mb-1">
                      Book Number *
                    </label>
                    <Input
                      type="number"
                      value={archivePageFormData.book_no}
                      onChange={(e) => setArchivePageFormData({ ...archivePageFormData, book_no: parseInt(e.target.value) })}
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-brown mb-1">
                      Page Number *
                    </label>
                    <Input
                      type="number"
                      value={archivePageFormData.page_no}
                      onChange={(e) => setArchivePageFormData({ ...archivePageFormData, page_no: parseInt(e.target.value) })}
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-brown mb-1">
                      Year (Optional)
                    </label>
                    <Input
                      type="number"
                      value={archivePageFormData.year}
                      onChange={(e) => setArchivePageFormData({ ...archivePageFormData, year: parseInt(e.target.value) })}
                      min="1600"
                      max="2100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-brown mb-1">
                      Location (Optional)
                    </label>
                    <Input
                      value={archivePageFormData.location}
                      onChange={(e) => setArchivePageFormData({ ...archivePageFormData, location: e.target.value })}
                      placeholder="e.g., Virginia"
                    />
                  </div>
                </div>
              </div>

              {/* Image Section */}
              <div>
                <h3 className="text-lg font-semibold text-brand-brown mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Document Image
                </h3>
                <div className="space-y-4">
                  {/* Image Source Toggle */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setArchivePageImageSource('url')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                        archivePageImageSource === 'url'
                          ? 'border-brand-green bg-brand-green/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <LinkIcon className="w-6 h-6 mx-auto mb-2" />
                      <p className="font-medium">Image URL</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setArchivePageImageSource('upload')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                        archivePageImageSource === 'upload'
                          ? 'border-brand-green bg-brand-green/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Upload className="w-6 h-6 mx-auto mb-2" />
                      <p className="font-medium">Upload New File</p>
                    </button>
                  </div>

                  {/* URL Input */}
                  {archivePageImageSource === 'url' && (
                    <div>
                      <label className="block text-sm font-medium text-brand-brown mb-1">
                        Image URL *
                      </label>
                      <Input
                        type="url"
                        value={archivePageImageUrl}
                        onChange={(e) => setArchivePageImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  )}

                  {/* File Upload */}
                  {archivePageImageSource === 'upload' && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleArchivePageImageSelect}
                        className="hidden"
                        id="archive-image-upload"
                      />
                      <label htmlFor="archive-image-upload">
                        <Button
                          type="button"
                          onClick={() => document.getElementById('archive-image-upload')?.click()}
                          variant="outline"
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <Upload className="w-5 h-5" />
                          {archivePageImageFile ? 'Change Image' : 'Select New Image File'}
                        </Button>
                      </label>
                      {archivePageImageFile && (
                        <p className="text-sm text-gray-600 mt-2">
                          Selected: {archivePageImageFile.name}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Image Preview */}
                  {archivePageImagePreview && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-brand-brown mb-2">Current/Preview</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={archivePageImagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Transcription Section */}
              <div>
                <h3 className="text-lg font-semibold text-brand-brown mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Transcription (OCR Text)
                </h3>
                <textarea
                  value={archivePageFormData.ocr_text}
                  onChange={(e) => setArchivePageFormData({ ...archivePageFormData, ocr_text: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green font-mono text-sm"
                  placeholder="Enter the transcribed text from the document..."
                />
              </div>

              {/* Tags Section */}
              <div>
                <h3 className="text-lg font-semibold text-brand-brown mb-4">Tags</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={archivePageTagInput}
                      onChange={(e) => setArchivePageTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArchivePageTag())}
                      placeholder="Add a tag"
                    />
                    <Button type="button" onClick={handleAddArchivePageTag} variant="outline">
                      Add
                    </Button>
                  </div>

                  {archivePageFormData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {archivePageFormData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-brand-tan text-brand-brown rounded-full flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveArchivePageTag(tag)}
                            className="hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex gap-4 bg-gray-50 rounded-b-lg">
              <Button
                onClick={handleSaveArchivePage}
                disabled={archivePageSaving}
                className="flex-1 bg-brand-green hover:bg-brand-darkgreen flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {archivePageSaving ? 'Saving...' : 'Update Page'}
              </Button>
              <Button
                onClick={handleCancelArchivePageEdit}
                variant="outline"
                disabled={archivePageSaving}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollectionsPage;

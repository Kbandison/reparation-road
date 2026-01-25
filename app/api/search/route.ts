import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Define all collections and subcollections for searching
const COLLECTIONS_DIRECTORY = [
  { name: 'African Colonization Society', slug: 'acs', keywords: ['acs', 'liberia', 'colonization', 'emigrant', 'american colonization society'] },
  { name: 'ACS: Emigrants to Liberia', slug: 'acs-emigrants-to-liberia', parent: 'acs', keywords: ['emigrant', 'liberia', 'acs', 'migration'] },
  { name: 'ACS: Liberian Census Rolls', slug: 'acs-liberation-census-rolls', parent: 'acs', keywords: ['census', 'liberia', 'acs', 'population'] },
  { name: 'African-American Revolutionary Soldiers', slug: 'revolutionary-soldiers', keywords: ['revolutionary war', 'soldier', 'military', 'independence', 'patriots'] },
  { name: 'Bibles and Churches Records', slug: 'bibles-churches', keywords: ['church', 'bible', 'baptism', 'marriage', 'religious'] },
  { name: 'British/Spanish/French Florida and Louisiana', slug: 'florida-louisiana', keywords: ['florida', 'louisiana', 'spanish', 'french', 'british', 'colonial'] },
  { name: 'Colored Deaths 1785-1821 (Diocese of St Augustine)', slug: 'florida-louisiana/colored-deaths-1785-1821', parent: 'florida-louisiana', keywords: ['death', 'burial', 'florida', 'st augustine', 'diocese'] },
  { name: 'Colored Marriages 1784-1882 (Diocese of St Augustine)', slug: 'florida-louisiana/colored-marriages-1784-1882', parent: 'florida-louisiana', keywords: ['marriage', 'wedding', 'florida', 'st augustine', 'diocese'] },
  { name: 'Ex-slave Pension and Fraud Files', slug: 'ex-slave-pension', keywords: ['pension', 'fraud', 'benefit', 'formerly enslaved'] },
  { name: 'Free Black Heads of Household, First US Census 1790', slug: 'free-black-census-1790', keywords: ['census', 'free black', '1790', 'household', 'population'] },
  { name: 'Freedmen, Refugee and Contraband Records', slug: 'freedmen-refugee-contraband', keywords: ['freedmen', 'refugee', 'contraband', 'civil war', 'emancipation'] },
  { name: 'Fugitive and Slave Case Files', slug: 'fugitive-slave-cases', keywords: ['fugitive', 'runaway', 'court', 'legal', 'case'] },
  { name: 'Inspection Roll of Negroes', slug: 'inspection-roll', keywords: ['inspection', 'roll', 'colonial', 'british'] },
  { name: 'Lost Friends in Last Seen Ads', slug: 'lost-friends', keywords: ['lost friends', 'advertisement', 'newspaper', 'reunion', 'last seen'] },
  { name: 'Native American Records', slug: 'native-american-records', keywords: ['native american', 'indian', 'tribal', 'cherokee', 'creek', 'chickasaw', 'choctaw'] },
  { name: 'Records of Slave Claims Commission', slug: 'slave-claims-commission', keywords: ['claims', 'compensation', 'commission', 'free persons', 'georgia'] },
  { name: 'Records of the RAC and VOC', slug: 'rac-vlc', keywords: ['rac', 'voc', 'dutch', 'merchant', 'trade', 'slave trade'] },
  { name: 'Slave Compensation Claims', slug: 'slave-compensation', keywords: ['compensation', 'claims', 'post civil war', 'southern claims'] },
  { name: 'Slave Importation Declaration', slug: 'slave-importation', keywords: ['importation', 'declaration', 'manifest', 'trade'] },
  { name: 'Georgia Slave Importation Records', slug: 'slave-importation/slave-importation-georgia', parent: 'slave-importation', keywords: ['georgia', 'importation', 'declaration'] },
  { name: 'Kentucky Slave Importation Records', slug: 'slave-importation/slave-importation-kentucky', parent: 'slave-importation', keywords: ['kentucky', 'importation', 'declaration'] },
  { name: 'Mississippi Slave Importation Records', slug: 'slave-importation/mississippi', parent: 'slave-importation', keywords: ['mississippi', 'importation', 'declaration'] },
  { name: 'Slave Narratives', slug: 'slave-narratives', keywords: ['narrative', 'testimony', 'interview', 'wpa', 'story'] },
  { name: 'Slave Voyages', slug: 'slave-voyages', keywords: ['voyage', 'ship', 'transatlantic', 'middle passage', 'vessel'] },
  { name: 'Virginia Order Books', slug: 'virginia-order-books', keywords: ['virginia', 'order book', 'court', 'adjudgment', 'legal'] },
  { name: 'Virginia Personal Property and Tithes Tables', slug: 'virginia-property-tithes', keywords: ['virginia', 'property', 'tithe', 'tax', 'assessment'] }
];

// Define searchable tables and their key fields - based on actual database schema
const SEARCHABLE_TABLES = [
  {
    table: 'slave_compensation_claims',
    collection: 'Slave Compensation Claims',
    collectionSlug: 'slave-compensation',
    searchFields: ['first_name', 'last_name', 'place_of_birth', 'former_slave_owner', 'owner_residence', 'regiment'],
    displayFields: ['first_name', 'last_name', 'age', 'place_of_birth', 'former_slave_owner'],
    identifierFields: ['first_name', 'last_name']
  },
  {
    table: 'archive_pages',
    collection: 'Inspection Roll of Negroes',
    collectionSlug: 'inspection-roll',
    searchFields: ['ocr_text', 'title', 'location'],
    displayFields: ['title', 'book_no', 'page_no', 'location', 'year'],
    identifierFields: ['title']
  },
  {
    table: 'emmigrants_to_liberia',
    collection: 'ACS: Emigrants to Liberia',
    collectionSlug: 'acs-emigrants-to-liberia',
    searchFields: ['name', 'state_of_origin', 'emancipated_by', 'location_on_arrival', 'profession'],
    displayFields: ['name', 'age', 'state_of_origin', 'emancipated_by'],
    identifierFields: ['name']
  },
  {
    table: 'liberation_census_rolls',
    collection: 'ACS: Liberian Census Rolls',
    collectionSlug: 'acs-liberation-census-rolls',
    searchFields: ['name', 'town', 'where_born', 'profession', 'education'],
    displayFields: ['name', 'age', 'town', 'profession'],
    identifierFields: ['name']
  },
  {
    table: 'aa_revolutionary_soldiers',
    collection: 'African-American Revolutionary Soldiers',
    collectionSlug: 'revolutionary-soldiers',
    searchFields: ['soldier_name', 'state', 'regiment', 'period_of_service', 'remarks'],
    displayFields: ['soldier_name', 'state', 'regiment', 'period_of_service'],
    identifierFields: ['soldier_name']
  },
  {
    table: 'free_black_heads_of_household',
    collection: 'Free Black Heads of Household (1790 Census)',
    collectionSlug: 'free-black-census-1790',
    searchFields: ['name', 'state', 'notes'],
    displayFields: ['name', 'state', 'num_in_family'],
    identifierFields: ['name']
  },
  {
    table: 'enslaved_persons_alabama',
    collection: 'Enslaved Persons - Alabama',
    collectionSlug: 'bibles-churches/enslaved-persons-alabama',
    searchFields: ['name', 'Parish', 'Minister', 'Parents', 'Notes'],
    displayFields: ['name', 'Entry Type', 'Parish', 'Minister'],
    identifierFields: ['name']
  },
  {
    table: 'enslaved_catholic_kentuky',
    collection: 'Enslaved Catholic Kentucky',
    collectionSlug: 'bibles-churches/enslaved-catholic-kentucky',
    searchFields: ['child', 'church', 'county', 'mother_s_first', 'father_s_first', 'transcription'],
    displayFields: ['child', 'church', 'baptism_date', 'county'],
    identifierFields: ['child']
  },
  {
    table: 'slave_voyages',
    collection: 'Slave Voyages',
    collectionSlug: 'slave-voyages',
    searchFields: ['place_where_vessel_s_voyage_began_imp', 'principal_place_where_captives_were_landed_imp', 'principal_place_where_captives_were_purchased', 'flag_of_vessel_imp'],
    displayFields: ['voyage_id', 'year_arrived_with_captives', 'flag_of_vessel_imp', 'total_disembarked_imp'],
    identifierFields: ['voyage_id']
  },
  {
    table: 'register_free_persons_jefferson',
    collection: 'Register of Free Persons of Color, Jefferson',
    collectionSlug: 'slave-claims-commission/register-free-persons-jefferson',
    searchFields: ['name', 'residence', 'occupation', 'place_of_nativity', 'ocr_text'],
    displayFields: ['name', 'residence', 'occupation', 'age'],
    identifierFields: ['name']
  },
  {
    table: 'register_free_persons_baldwin',
    collection: 'Register of Free Persons of Color, Baldwin',
    collectionSlug: 'slave-claims-commission/register-free-persons-baldwin',
    searchFields: ['name', 'residence', 'occupation', 'place_of_nativity', 'ocr_text'],
    displayFields: ['name', 'residence', 'occupation'],
    identifierFields: ['name']
  },
  {
    table: 'register_free_persons_camden',
    collection: 'Register of Free Persons of Color, Camden',
    collectionSlug: 'slave-claims-commission/register-free-persons-camden',
    searchFields: ['name', 'residence', 'occupation', 'place_of_nativity', 'ocr_text'],
    displayFields: ['name', 'residence', 'occupation', 'age'],
    identifierFields: ['name']
  },
  {
    table: 'register_free_persons_colombia',
    collection: 'Register of Free Persons of Color, Columbia',
    collectionSlug: 'slave-claims-commission/register-free-persons-columbia',
    searchFields: ['name', 'residence', 'occupation', 'place_of_nativity', 'ocr_text'],
    displayFields: ['name', 'residence', 'occupation'],
    identifierFields: ['name']
  },
  {
    table: 'register_free_persons_hancock',
    collection: 'Register of Free Persons of Color, Hancock',
    collectionSlug: 'slave-claims-commission/register-free-persons-hancock',
    searchFields: ['name', 'residence', 'occupation', 'place_of_nativity', 'ocr_text'],
    displayFields: ['name', 'residence', 'occupation', 'age'],
    identifierFields: ['name']
  },
  {
    table: 'register_free_persons_lincoln',
    collection: 'Register of Free Persons of Color, Lincoln',
    collectionSlug: 'slave-claims-commission/register-free-persons-lincoln',
    searchFields: ['name', 'residence', 'occupation', 'place_of_nativity', 'ocr_text'],
    displayFields: ['name', 'residence', 'occupation', 'age'],
    identifierFields: ['name']
  },
  {
    table: 'register_free_persons_lumpkin',
    collection: 'Register of Free Persons of Color, Lumpkin',
    collectionSlug: 'slave-claims-commission/register-free-persons-lumpkin',
    searchFields: ['name', 'residence', 'occupation', 'place_of_nativity', 'ocr_text'],
    displayFields: ['name', 'residence', 'occupation', 'age'],
    identifierFields: ['name']
  },
  {
    table: 'register_free_persons_thomas',
    collection: 'Register of Free Persons of Color, Thomas',
    collectionSlug: 'slave-claims-commission/register-free-persons-thomas',
    searchFields: ['name', 'residence', 'occupation', 'place_of_nativity', 'ocr_text'],
    displayFields: ['name', 'residence', 'occupation'],
    identifierFields: ['name']
  },
  {
    table: 'register_free_persons_warren',
    collection: 'Register of Free Persons of Color, Warren',
    collectionSlug: 'slave-claims-commission/register-free-persons-warren',
    searchFields: ['name', 'residence', 'occupation', 'place_of_nativity', 'ocr_text'],
    displayFields: ['name', 'residence', 'occupation'],
    identifierFields: ['name']
  },
  {
    table: 'cherokee_henderson',
    collection: 'Cherokee Census - Henderson Roll',
    collectionSlug: 'native-american-records/early-cherokee-census/cherokee-henderson',
    searchFields: ['head_of_family', 'residence', 'ocr_text'],
    displayFields: ['head_of_family', 'residence', 'cherokees', 'household_total'],
    identifierFields: ['head_of_family']
  },
  {
    table: 'slave_merchants_austin_laurens',
    collection: 'Austin & Laurens Slave Merchant Records',
    collectionSlug: 'rac-vlc/austin-laurens',
    searchFields: ['to_whom_sold', 'location', 'date_sold', 'ocr_text'],
    displayFields: ['date_sold', 'to_whom_sold', 'location'],
    identifierFields: ['to_whom_sold', 'date_sold']
  },
  {
    table: 'slave_importation_ms',
    collection: 'Slave Importation - Mississippi',
    collectionSlug: 'slave-importation/mississippi',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'va_personal_hanover',
    collection: 'Virginia Personal Property - Hanover County',
    collectionSlug: 'virginia-property-tithes/hanover',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'va_personal_henrico',
    collection: 'Virginia Personal Property - Henrico County',
    collectionSlug: 'virginia-property-tithes/henrico',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'va_books_chesterfield',
    collection: 'Virginia Order Books - Chesterfield County',
    collectionSlug: 'virginia-order-books/chesterfield',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'va_books_goochland',
    collection: 'Virginia Order Books - Goochland County',
    collectionSlug: 'virginia-order-books/goochland',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'va_books_henrico',
    collection: 'Virginia Order Books - Henrico County',
    collectionSlug: 'virginia-order-books/henrico',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'va_books_spotsylvania',
    collection: 'Virginia Order Books - Spotsylvania County',
    collectionSlug: 'virginia-order-books/spotsylvania',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'slave_merchants_othello',
    collection: 'Slave Merchants - Samuel and William Vernon Co. - Brig Othello',
    collectionSlug: 'rac-vlc/samuel-william-vernon/brig-othello',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'slave_merchants_charlotte',
    collection: 'Slave Merchants - Samuel and William Vernon Co. - Royal Charlotte',
    collectionSlug: 'rac-vlc/samuel-william-vernon/royal-charlotte',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'slave_merchants_schooner',
    collection: 'Slave Merchants - Samuel and William Vernon Co. - Schooner Sally',
    collectionSlug: 'rac-vlc/samuel-william-vernon/schooner-sally',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'colored-deaths',
    collection: 'Colored Deaths 1785-1821 (Diocese of St Augustine)',
    collectionSlug: 'florida-louisiana/colored-deaths-1785-1821',
    searchFields: ['latin_transcription', 'english_transcription', 'notes', 'page_number'],
    displayFields: ['page_number', 'has_transcription'],
    identifierFields: ['page_number']
  },
  {
    table: 'colored-marriages',
    collection: 'Colored Marriages 1784-1882 (Diocese of St Augustine)',
    collectionSlug: 'florida-louisiana/colored-marriages-1784-1882',
    searchFields: ['latin_transcription', 'english_transcription', 'notes', 'page_number'],
    displayFields: ['page_number', 'has_transcription'],
    identifierFields: ['page_number']
  },
  {
    table: 'slave-importation-ga',
    collection: 'Georgia Slave Importation Records',
    collectionSlug: 'slave-importation/slave-importation-georgia',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'slave-importation-ky',
    collection: 'Kentucky Slave Importation Records',
    collectionSlug: 'slave-importation/slave-importation-kentucky',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  }
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '50');
    const suggest = searchParams.get('suggest') === 'true';

    console.log('[SEARCH API] Query:', query);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        results: [],
        suggestions: [],
        message: 'Query too short'
      });
    }

    const searchTerm = query.trim().toLowerCase();
    const allResults: any[] = [];
    const suggestions = new Set<string>();
    const errors: any[] = [];

    // Search collections and subcollections
    const matchingCollections = COLLECTIONS_DIRECTORY.filter(collection => {
      const nameMatch = collection.name.toLowerCase().includes(searchTerm);
      const keywordMatch = collection.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm));
      return nameMatch || keywordMatch;
    }).map(collection => ({
      id: `collection-${collection.slug}`,
      _collection: collection.name,
      _collectionSlug: collection.slug,
      _table: 'collection',
      _identifier: collection.name,
      _snippet: `Browse the ${collection.name} collection`,
      _isCollection: true,
      _type: collection.parent ? 'subcollection' : 'collection'
    }));

    allResults.push(...matchingCollections);

    // Search across all tables
    for (const config of SEARCHABLE_TABLES) {
      try {
        console.log(`[SEARCH API] Searching ${config.table}...`);

        // Build the search query for this table
        let supabaseQuery = supabase
          .from(config.table)
          .select('*');

        // Add OR conditions for each searchable field
        const orConditions = config.searchFields
          .map(field => `${field}.ilike.%${searchTerm}%`)
          .join(',');

        supabaseQuery = supabaseQuery.or(orConditions);

        const { data, error } = await supabaseQuery.limit(limit);

        if (error) {
          console.error(`[SEARCH API] Error searching ${config.table}:`, error);
          errors.push({ table: config.table, error: error.message });
          continue;
        }

        console.log(`[SEARCH API] ${config.table} returned ${data?.length || 0} results`);

        if (data && data.length > 0) {
          // Add collection info to each result
          const resultsWithCollection = data.map((record: any) => {
            // Extract identifier for display
            const identifier = config.identifierFields
              .map(field => record[field])
              .filter(Boolean)
              .join(' - ');

            // Extract search snippet (highlight matching field)
            let snippet = '';
            for (const field of config.searchFields) {
              const value = record[field];
              if (value && typeof value === 'string' && value.toLowerCase().includes(searchTerm)) {
                snippet = value;
                break;
              }
            }

            // Add to suggestions if in suggest mode
            if (suggest) {
              config.identifierFields.forEach(field => {
                if (record[field]) suggestions.add(record[field]);
              });
            }

            return {
              ...record,
              _collection: config.collection,
              _collectionSlug: config.collectionSlug,
              _table: config.table,
              _identifier: identifier,
              _snippet: snippet
            };
          });

          allResults.push(...resultsWithCollection);
        }
      } catch (err) {
        console.error(`Error processing table ${config.table}:`, err);
      }
    }

    // Sort results by relevance (collections first, then exact matches, then partial matches)
    allResults.sort((a, b) => {
      // Prioritize collections
      const aIsCollection = a._isCollection || false;
      const bIsCollection = b._isCollection || false;
      if (aIsCollection && !bIsCollection) return -1;
      if (!aIsCollection && bIsCollection) return 1;

      // Then exact matches
      const aExact = a._identifier?.toLowerCase() === searchTerm;
      const bExact = b._identifier?.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Then starts with
      const aStarts = a._identifier?.toLowerCase().startsWith(searchTerm);
      const bStarts = b._identifier?.toLowerCase().startsWith(searchTerm);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return 0;
    });

    console.log(`[SEARCH API] Total results: ${allResults.length}`);

    return NextResponse.json({
      results: allResults.slice(0, limit),
      suggestions: suggest ? Array.from(suggestions).slice(0, 10) : [],
      total: allResults.length,
      query: query,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

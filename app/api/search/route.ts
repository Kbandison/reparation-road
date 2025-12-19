import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    table: 'revolutionary_soldiers',
    collection: 'African-American Revolutionary Soldiers',
    collectionSlug: 'revolutionary-soldiers',
    searchFields: ['name', 'state', 'regiment'],
    displayFields: ['name', 'state', 'regiment'],
    identifierFields: ['name']
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
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'register_free_persons_baldwin',
    collection: 'Register of Free Persons of Color, Baldwin',
    collectionSlug: 'slave-claims-commission/register-free-persons-baldwin',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'register_free_persons_camden',
    collection: 'Register of Free Persons of Color, Camden',
    collectionSlug: 'slave-claims-commission/register-free-persons-camden',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'register_free_persons_colombia',
    collection: 'Register of Free Persons of Color, Colombia',
    collectionSlug: 'slave-claims-commission/register-free-persons-columbia',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'register_free_persons_hancock',
    collection: 'Register of Free Persons of Color, Hancock',
    collectionSlug: 'slave-claims-commission/register-free-persons-hancock',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'register_free_persons_lincoln',
    collection: 'Register of Free Persons of Color, Lincoln',
    collectionSlug: 'slave-claims-commission/register-free-persons-lincoln',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'register_free_persons_lumpkin',
    collection: 'Register of Free Persons of Color, Lumpkin',
    collectionSlug: 'slave-claims-commission/register-free-persons-lumpkin',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'register_free_persons_richmond',
    collection: 'Register of Free Persons of Color, Richmond',
    collectionSlug: 'slave-claims-commission/register-free-persons-richmond',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'register_free_persons_thomas',
    collection: 'Register of Free Persons of Color, Thomas',
    collectionSlug: 'slave-claims-commission/register-free-persons-thomas',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'register_free_persons_warren',
    collection: 'Register of Free Persons of Color, Warren',
    collectionSlug: 'slave-claims-commission/register-free-persons-warren',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
  },
  {
    table: 'cherokee_henderson',
    collection: 'Cherokee Census - Henderson Roll',
    collectionSlug: 'native-american-records/early-cherokee-census/cherokee-henderson',
    searchFields: ['ocr_text'],
    displayFields: ['book_no', 'page_no'],
    identifierFields: ['book_no', 'page_no']
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

    // Sort results by relevance (exact matches first)
    allResults.sort((a, b) => {
      const aExact = a._identifier?.toLowerCase() === searchTerm;
      const bExact = b._identifier?.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

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

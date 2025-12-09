import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Define searchable tables and their key fields
const SEARCHABLE_TABLES = [
  {
    table: 'slave_compensation_claims',
    collection: 'Slave Compensation Claims',
    collectionSlug: 'slave-compensation',
    searchFields: ['first_name', 'last_name', 'place_of_birth', 'owner_name'],
    displayFields: ['first_name', 'last_name', 'age', 'place_of_birth', 'owner_name'],
    identifierFields: ['first_name', 'last_name']
  },
  {
    table: 'archive_pages',
    collection: 'Inspection Roll of Negroes',
    collectionSlug: 'inspection-roll',
    searchFields: ['ocr_text', 'title', 'location', 'tags'],
    displayFields: ['title', 'book_no', 'page_no', 'location', 'year'],
    identifierFields: ['title', 'book_no', 'page_no']
  },
  {
    table: 'emmigrants_to_liberia',
    collection: 'ACS: Emigrants to Liberia',
    collectionSlug: 'acs-emigrants-to-liberia',
    searchFields: ['name', 'age', 'sex', 'residence', 'former_owner'],
    displayFields: ['name', 'age', 'sex', 'residence', 'former_owner'],
    identifierFields: ['name']
  },
  {
    table: 'liberation_census_rolls',
    collection: 'ACS: Liberian Census Rolls',
    collectionSlug: 'acs-liberation-census-rolls',
    searchFields: ['name', 'age', 'occupation', 'location'],
    displayFields: ['name', 'age', 'occupation', 'location'],
    identifierFields: ['name']
  },
  {
    table: 'revolutionary_soldiers',
    collection: 'African-American Revolutionary Soldiers',
    collectionSlug: 'revolutionary-soldiers',
    searchFields: ['name', 'state', 'service_type', 'regiment'],
    displayFields: ['name', 'state', 'service_type', 'regiment'],
    identifierFields: ['name']
  },
  {
    table: 'ex_slave_pension',
    collection: 'Ex-slave Pension Files',
    collectionSlug: 'ex-slave-pension/case-files-formerly-enslaved',
    searchFields: ['sender_name', 'recipient_name', 'letter_content'],
    displayFields: ['sender_name', 'recipient_name', 'book_number', 'page_no'],
    identifierFields: ['sender_name', 'recipient_name']
  },
  {
    table: 'colored_deaths',
    collection: 'Colored Deaths (1785-1821)',
    collectionSlug: 'florida-louisiana/colored-deaths-1785-1821',
    searchFields: ['name', 'age', 'death_date', 'burial_location', 'occupation'],
    displayFields: ['name', 'age', 'death_date', 'burial_location'],
    identifierFields: ['name']
  },
  {
    table: 'colored_marriages',
    collection: 'Colored Marriages (1784-1882)',
    collectionSlug: 'florida-louisiana/colored-marriages-1784-1882',
    searchFields: ['groom_name', 'bride_name', 'marriage_date', 'location'],
    displayFields: ['groom_name', 'bride_name', 'marriage_date', 'location'],
    identifierFields: ['groom_name', 'bride_name']
  },
  {
    table: 'creek_census',
    collection: 'Creek Census 1832',
    collectionSlug: 'native-american-records/creek-census-1832',
    searchFields: ['name', 'town', 'age', 'relationship'],
    displayFields: ['name', 'town', 'age', 'relationship'],
    identifierFields: ['name']
  },
  {
    table: 'slave_importation_ga',
    collection: 'Georgia Slave Importation',
    collectionSlug: 'slave-importation/georgia',
    searchFields: ['enslaved_name', 'owner_name', 'origin', 'destination'],
    displayFields: ['enslaved_name', 'owner_name', 'origin', 'destination'],
    identifierFields: ['enslaved_name']
  },
  {
    table: 'slave_importation_ky',
    collection: 'Kentucky Slave Importation',
    collectionSlug: 'slave-importation/kentucky',
    searchFields: ['enslaved_name', 'owner_name', 'county', 'year'],
    displayFields: ['enslaved_name', 'owner_name', 'county', 'year'],
    identifierFields: ['enslaved_name']
  },
  {
    table: 'va_personal_chesterfield',
    collection: 'Virginia Property Tithes - Chesterfield County',
    collectionSlug: 'virginia-property-tithes/chesterfield-county-1747-1821',
    searchFields: ['owner_name', 'enslaved_name', 'year', 'location'],
    displayFields: ['owner_name', 'enslaved_name', 'year', 'location'],
    identifierFields: ['owner_name', 'enslaved_name']
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

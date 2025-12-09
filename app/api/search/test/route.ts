import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Test each table to see what exists and what fields are available
const TABLES_TO_TEST = [
  'archive_pages',
  'slave_compensation_claims',
  'emmigrants_to_liberia',
  'liberation_census_rolls',
  'revolutionary_soldiers',
  'free_black_heads_of_household',
  'enslaved_persons_alabama',
  'enslaved_catholic_kentuky',
  'slave_voyages',
  'ex_slave_pension',
  'colored_deaths',
  'colored_marriages',
  'creek_census',
  'slave_importation_ga',
  'slave_importation_ky',
  'va_personal_chesterfield'
];

export async function GET() {
  const results: any[] = [];

  for (const tableName of TABLES_TO_TEST) {
    try {
      // Try to get one record to see if table exists and what fields it has
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        results.push({
          table: tableName,
          exists: false,
          error: error.message,
          code: error.code
        });
      } else {
        const fields = data && data.length > 0 ? Object.keys(data[0]) : [];
        results.push({
          table: tableName,
          exists: true,
          recordCount: count,
          sampleFields: fields,
          sampleRecord: data && data.length > 0 ? data[0] : null
        });
      }
    } catch (err) {
      results.push({
        table: tableName,
        exists: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  return NextResponse.json({
    message: 'Database table diagnostics',
    tables: results,
    summary: {
      total: TABLES_TO_TEST.length,
      existing: results.filter(r => r.exists).length,
      missing: results.filter(r => !r.exists).length
    }
  });
}

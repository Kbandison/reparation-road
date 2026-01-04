import { supabase } from '@/lib/supabase';

export interface RelevantRecordsConfig {
  currentRecord: any;
  tableName: string;
  collectionName: string;
  collectionSlug: string;
  limit?: number;
}

export interface RelevantRecord {
  id: string;
  identifier: string;
  snippet?: string;
  relevanceScore: number;
  relevanceReasons: string[];
  collectionName: string;
  collectionSlug: string;
  url: string;
}

/**
 * Calculate relevance score between two records
 */
function calculateRelevance(current: any, candidate: any, config: RelevantRecordsConfig): {
  score: number;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

  // Skip if same record
  if (current.id === candidate.id) {
    return { score: 0, reasons: [] };
  }

  // Location matching (high priority)
  if (current.location && candidate.location) {
    const currentLoc = current.location.toLowerCase();
    const candidateLoc = candidate.location.toLowerCase();

    if (currentLoc === candidateLoc) {
      score += 30;
      reasons.push(`Same location: ${current.location}`);
    } else if (currentLoc.includes(candidateLoc) || candidateLoc.includes(currentLoc)) {
      score += 15;
      reasons.push(`Similar location: ${candidate.location}`);
    }
  }

  // Time period matching (high priority)
  if (current.year && candidate.year) {
    const yearDiff = Math.abs(current.year - candidate.year);
    if (yearDiff === 0) {
      score += 25;
      reasons.push(`Same year: ${current.year}`);
    } else if (yearDiff <= 2) {
      score += 15;
      reasons.push(`Similar time period (${candidate.year})`);
    } else if (yearDiff <= 5) {
      score += 8;
      reasons.push(`Related time period (${candidate.year})`);
    }
  }

  // Name matching (for potential family connections)
  if (current.last_name && candidate.last_name) {
    const currentLast = current.last_name.toLowerCase();
    const candidateLast = candidate.last_name.toLowerCase();

    if (currentLast === candidateLast) {
      score += 35;
      reasons.push(`Same surname: ${current.last_name}`);
    }
  }

  if (current.first_name && candidate.first_name) {
    const currentFirst = current.first_name.toLowerCase();
    const candidateFirst = candidate.first_name.toLowerCase();

    if (currentFirst === candidateFirst) {
      score += 20;
      reasons.push(`Same first name: ${current.first_name}`);
    }
  }

  // Owner/slaveholder matching
  if (current.former_slave_owner && candidate.former_slave_owner) {
    const currentOwner = current.former_slave_owner.toLowerCase();
    const candidateOwner = candidate.former_slave_owner.toLowerCase();

    if (currentOwner === candidateOwner) {
      score += 30;
      reasons.push(`Same former enslaver: ${current.former_slave_owner}`);
    }
  }

  // State matching
  if (current.state && candidate.state) {
    const currentState = current.state.toLowerCase();
    const candidateState = candidate.state.toLowerCase();

    if (currentState === candidateState) {
      score += 10;
      reasons.push(`Same state: ${current.state}`);
    }
  }

  // Regiment matching (for military records)
  if (current.regiment && candidate.regiment) {
    const currentReg = current.regiment.toLowerCase();
    const candidateReg = candidate.regiment.toLowerCase();

    if (currentReg === candidateReg) {
      score += 20;
      reasons.push(`Same regiment: ${current.regiment}`);
    }
  }

  // Age proximity (for same person at different times)
  if (current.age && candidate.age && current.year && candidate.year) {
    const ageDiff = Math.abs(current.age - candidate.age);
    const yearDiff = Math.abs(current.year - candidate.year);

    // If ages match the year difference (same person)
    if (Math.abs(ageDiff - yearDiff) <= 2) {
      score += 40;
      reasons.push(`Potentially same person at different times`);
    }
  }

  return { score, reasons };
}

/**
 * Get identifier string for a record
 */
function getRecordIdentifier(record: any, tableName: string): string {
  // Try common identifier patterns
  if (record.first_name || record.last_name) {
    const parts = [];
    if (record.first_name) parts.push(record.first_name);
    if (record.last_name) parts.push(record.last_name);
    return parts.join(' ');
  }

  if (record.soldier_name) return record.soldier_name;
  if (record.name) return record.name;
  if (record.child) return record.child;

  if (record.book_no && record.page_no) {
    return `Book ${record.book_no}, Page ${record.page_no}`;
  }

  if (record.page_number) {
    return `Page ${record.page_number}`;
  }

  if (record.voyage_id) {
    return `Voyage ${record.voyage_id}`;
  }

  return `Record #${record.id}`;
}

/**
 * Find relevant records based on the current record
 */
export async function findRelevantRecords(config: RelevantRecordsConfig): Promise<RelevantRecord[]> {
  const { currentRecord, tableName, collectionName, collectionSlug, limit = 10 } = config;

  try {
    // Fetch all records from the same table
    const { data: allRecords, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1000); // Reasonable limit

    if (error || !allRecords) {
      console.error('Error fetching records for relevance:', error);
      return [];
    }

    // Calculate relevance for each record
    const scoredRecords = allRecords
      .map(record => {
        const { score, reasons } = calculateRelevance(currentRecord, record, config);
        return {
          record,
          score,
          reasons
        };
      })
      .filter(item => item.score > 0) // Only include records with some relevance
      .sort((a, b) => b.score - a.score) // Sort by relevance score
      .slice(0, limit); // Take top N

    // Transform to RelevantRecord format
    return scoredRecords.map(({ record, score, reasons }) => ({
      id: record.id,
      identifier: getRecordIdentifier(record, tableName),
      snippet: reasons.join(' • '),
      relevanceScore: score,
      relevanceReasons: reasons,
      collectionName,
      collectionSlug,
      url: `/collections/${collectionSlug}?record=${record.id}`
    }));
  } catch (error) {
    console.error('Error finding relevant records:', error);
    return [];
  }
}

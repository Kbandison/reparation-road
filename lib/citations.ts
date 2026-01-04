export interface CitationData {
  collectionName: string;
  recordIdentifier: string;
  year?: number | string;
  location?: string;
  archiveName?: string;
  url?: string;
  accessDate?: string;
  additionalInfo?: Record<string, any>;
}

const ARCHIVE_NAME = 'Reparation Road Historical Archives';
const WEBSITE_NAME = 'Reparation Road';
const BASE_URL = 'https://reparationroad.com';

/**
 * Generate citation in MLA 9th edition format
 */
export function generateMLACitation(data: CitationData): string {
  const parts: string[] = [];

  // Title (record identifier)
  parts.push(`"${data.recordIdentifier}."`);

  // Collection name (italicized in actual display)
  parts.push(`*${data.collectionName}*,`);

  // Year
  if (data.year) {
    parts.push(`${data.year},`);
  }

  // Archive
  parts.push(`${data.archiveName || ARCHIVE_NAME},`);

  // Location
  if (data.location) {
    parts.push(`${data.location},`);
  }

  // Website
  parts.push(`*${WEBSITE_NAME}*,`);

  // URL
  const url = data.url || BASE_URL;
  parts.push(`${url}.`);

  // Access date
  const accessDate = data.accessDate || new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  parts.push(`Accessed ${accessDate}.`);

  return parts.join(' ');
}

/**
 * Generate citation in Chicago 17th edition format
 */
export function generateChicagoCitation(data: CitationData): string {
  const parts: string[] = [];

  // Record identifier
  parts.push(`"${data.recordIdentifier},"`);

  // Collection name
  parts.push(`*${data.collectionName}*,`);

  // Year
  if (data.year) {
    parts.push(`${data.year},`);
  }

  // Archive and location
  if (data.location) {
    parts.push(`${data.archiveName || ARCHIVE_NAME}, ${data.location}.`);
  } else {
    parts.push(`${data.archiveName || ARCHIVE_NAME}.`);
  }

  // Website name
  parts.push(`*${WEBSITE_NAME}*.`);

  // Access date and URL
  const accessDate = data.accessDate || new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const url = data.url || BASE_URL;
  parts.push(`Accessed ${accessDate}.`);
  parts.push(`${url}.`);

  return parts.join(' ');
}

/**
 * Generate citation in APA 7th edition format
 */
export function generateAPACitation(data: CitationData): string {
  const parts: string[] = [];

  // Archive name
  parts.push(`${data.archiveName || ARCHIVE_NAME}.`);

  // Year (if available)
  if (data.year) {
    parts.push(`(${data.year}).`);
  } else {
    parts.push('(n.d.).');
  }

  // Record identifier (italicized)
  parts.push(`*${data.recordIdentifier}*`);

  // Collection name in square brackets
  parts.push(`[${data.collectionName}].`);

  // Website name
  parts.push(`${WEBSITE_NAME}.`);

  // URL
  const url = data.url || BASE_URL;
  parts.push(`${url}`);

  return parts.join(' ');
}

/**
 * Generate citation in BibTeX format for LaTeX documents
 */
export function generateBibTeXCitation(data: CitationData): string {
  const key = data.recordIdentifier.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const year = data.year || 'n.d.';
  const url = data.url || BASE_URL;

  return `@misc{${key},
  title = {${data.recordIdentifier}},
  author = {{${data.archiveName || ARCHIVE_NAME}}},
  year = {${year}},
  note = {${data.collectionName}${data.location ? `, ${data.location}` : ''}},
  howpublished = {\\url{${url}}},
  organization = {${WEBSITE_NAME}}
}`;
}

/**
 * Generate all citation formats for a record
 */
export function generateAllCitations(data: CitationData) {
  return {
    mla: generateMLACitation(data),
    chicago: generateChicagoCitation(data),
    apa: generateAPACitation(data),
    bibtex: generateBibTeXCitation(data),
  };
}

/**
 * Format citation with markdown italics converted to HTML
 */
export function formatCitationForDisplay(citation: string): string {
  // Convert markdown italics to HTML
  return citation.replace(/\*(.*?)\*/g, '<em>$1</em>');
}

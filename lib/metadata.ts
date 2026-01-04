import { Metadata } from 'next';

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  collection?: string;
}

const SITE_NAME = 'Reparation Road';
const SITE_URL = 'https://reparationroad.com';
const DEFAULT_IMAGE = '/og-image.png';
const DEFAULT_DESCRIPTION = 'Uncovering Black history and empowering communities through research, genealogy, and education. Explore historical records, trace your ancestry, and connect with your heritage.';

export function generateMetadata(page: PageMetadata): Metadata {
  const title = page.title ? `${page.title} | ${SITE_NAME}` : SITE_NAME;
  const description = page.description || DEFAULT_DESCRIPTION;
  const url = page.url ? `${SITE_URL}${page.url}` : SITE_URL;
  const image = page.image ? `${SITE_URL}${page.image}` : `${SITE_URL}${DEFAULT_IMAGE}`;

  return {
    title,
    description,
    keywords: page.keywords?.join(', '),
    authors: page.author ? [{ name: page.author }] : [{ name: 'Reparation Road' }],
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: page.title || SITE_NAME,
        },
      ],
      locale: 'en_US',
      type: page.type || 'website',
      ...(page.publishedTime && { publishedTime: page.publishedTime }),
      ...(page.modifiedTime && { modifiedTime: page.modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@ReparationRoad',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateCollectionMetadata(collection: {
  name: string;
  description: string;
  slug: string;
  keywords?: string[];
  recordCount?: number;
}): Metadata {
  const keywords = [
    ...(collection.keywords || []),
    'genealogy',
    'african american history',
    'historical records',
    'ancestry',
    'family history',
    'black history',
    'slavery records',
    'emancipation',
    'civil war',
  ];

  const description = `${collection.description}${
    collection.recordCount ? ` Browse ${collection.recordCount.toLocaleString()} records.` : ''
  } Part of the Reparation Road historical archives.`;

  return generateMetadata({
    title: collection.name,
    description,
    keywords,
    url: `/collections/${collection.slug}`,
    type: 'website',
  });
}

export function generateRecordMetadata(record: {
  collection: string;
  identifier: string;
  description?: string;
  year?: number;
  location?: string;
  imageUrl?: string;
}): Metadata {
  const keywords = [
    record.collection,
    ...(record.year ? [record.year.toString()] : []),
    ...(record.location ? [record.location] : []),
    'historical record',
    'genealogy',
    'african american history',
  ];

  const description = record.description || `Historical record: ${record.identifier} from ${record.collection}${
    record.year ? ` (${record.year})` : ''
  }${record.location ? `, ${record.location}` : ''}. Explore this record as part of the Reparation Road archives.`;

  return generateMetadata({
    title: `${record.identifier} - ${record.collection}`,
    description,
    keywords,
    image: record.imageUrl,
    type: 'article',
  });
}

// Generate JSON-LD structured data for search engines
export function generateStructuredData(type: 'organization' | 'collection' | 'record', data: any) {
  const baseUrl = SITE_URL;

  switch (type) {
    case 'organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: DEFAULT_DESCRIPTION,
        sameAs: [
          'https://twitter.com/ReparationRoad',
          'https://facebook.com/ReparationRoad',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          email: 'info@reparationroad.com',
        },
      };

    case 'collection':
      return {
        '@context': 'https://schema.org',
        '@type': 'Collection',
        name: data.name,
        description: data.description,
        url: `${baseUrl}/collections/${data.slug}`,
        ...(data.recordCount && { numberOfItems: data.recordCount }),
        isPartOf: {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: baseUrl,
        },
      };

    case 'record':
      return {
        '@context': 'https://schema.org',
        '@type': 'ArchiveComponent',
        name: data.identifier,
        description: data.description,
        ...(data.imageUrl && { image: data.imageUrl }),
        ...(data.year && { dateCreated: data.year.toString() }),
        ...(data.location && { locationCreated: data.location }),
        isPartOf: {
          '@type': 'Collection',
          name: data.collection,
        },
        holdingArchive: {
          '@type': 'Organization',
          name: SITE_NAME,
        },
      };

    default:
      return null;
  }
}

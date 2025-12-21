/**
 * Storage Bucket Configuration
 *
 * Maps collection slugs to their Supabase storage bucket locations.
 * Generated from diagnostic script: scripts/list-storage-buckets.js
 */

export interface StorageBucketMapping {
  collectionSlug: string;
  bucketName: string;
  folderPath: string;
  description?: string;
}

export const STORAGE_BUCKET_MAPPINGS: StorageBucketMapping[] = [
  // Archives bucket
  {
    collectionSlug: 'inspection-roll',
    bucketName: 'archives',
    folderPath: 'inspection-roll-of-negroes',
    description: 'Inspection Roll of Negroes - Main collection'
  },

  // Revolutionary Soldiers
  {
    collectionSlug: 'revolutionary-soldiers',
    bucketName: 'revolutionary-soldiers',
    folderPath: 'images',
    description: 'African-American Revolutionary Soldiers'
  },

  // Ex-Slave Pension
  {
    collectionSlug: 'case-files-formerly-enslaved',
    bucketName: 'ex-slave-pension',
    folderPath: 'formerly-enslaved',
    description: 'Case Files: Formerly Enslaved'
  },

  // Native American Records - Cherokee
  {
    collectionSlug: 'cherokee-henderson',
    bucketName: 'native-american-records',
    folderPath: 'cherokee-census/henderson',
    description: 'Cherokee Census - Henderson Roll'
  },

  // Native American Records - Creek
  {
    collectionSlug: 'creek-census-1832',
    bucketName: 'native-american-records',
    folderPath: 'creek-census',
    description: 'Creek Census 1832 (Parsons Abbott Roll)'
  },

  // Slave Importation - Georgia
  {
    collectionSlug: 'slave-importation-georgia',
    bucketName: 'slave-importation',
    folderPath: 'georgia',
    description: 'Georgia Slave Importation Records'
  },

  // Slave Importation - Kentucky
  {
    collectionSlug: 'slave-importation-kentucky',
    bucketName: 'slave-importation',
    folderPath: 'kentucky',
    description: 'Kentucky Slave Importation Records'
  },

  // Slave Importation - Mississippi
  {
    collectionSlug: 'mississippi',
    bucketName: 'slave-importation',
    folderPath: 'mississippi',
    description: 'Mississippi Slave Importation Records'
  },

  // Virginia Personal Property - Chesterfield
  {
    collectionSlug: 'chesterfield-county-1747-1821',
    bucketName: 'virginia-personal-property',
    folderPath: 'chesterfield',
    description: 'Virginia Personal Property - Chesterfield County 1747-1821'
  },

  // Virginia Personal Property - Hanover
  {
    collectionSlug: 'personal-property-hanover',
    bucketName: 'virginia-personal-property',
    folderPath: 'hanover',
    description: 'Virginia Personal Property - Hanover County'
  },

  // Virginia Personal Property - Henrico
  {
    collectionSlug: 'personal-property-henrico',
    bucketName: 'virginia-personal-property',
    folderPath: 'henrico',
    description: 'Virginia Personal Property - Henrico County'
  },

  // Georgia Records - Free Persons - Baldwin
  {
    collectionSlug: 'register-free-persons-baldwin',
    bucketName: 'georgia-records-free-enslaved',
    folderPath: 'baldwin',
    description: 'Register of Free Persons of Color - Baldwin County'
  },

  // Georgia Records - Free Persons - Camden
  {
    collectionSlug: 'register-free-persons-camden',
    bucketName: 'georgia-records-free-enslaved',
    folderPath: 'camden',
    description: 'Register of Free Persons of Color - Camden County'
  },

  // Georgia Records - Free Persons - Columbia
  {
    collectionSlug: 'register-free-persons-columbia',
    bucketName: 'georgia-records-free-enslaved',
    folderPath: 'colombia',
    description: 'Register of Free Persons of Color - Columbia County'
  },

  // Georgia Records - Free Persons - Hancock
  {
    collectionSlug: 'register-free-persons-hancock',
    bucketName: 'georgia-records-free-enslaved',
    folderPath: 'hancock',
    description: 'Register of Free Persons of Color - Hancock County'
  },

  // Georgia Records - Free Persons - Jefferson
  {
    collectionSlug: 'register-free-persons-jefferson',
    bucketName: 'georgia-records-free-enslaved',
    folderPath: 'jefferson',
    description: 'Register of Free Persons of Color - Jefferson County'
  },

  // Georgia Records - Free Persons - Lincoln
  {
    collectionSlug: 'register-free-persons-lincoln',
    bucketName: 'georgia-records-free-enslaved',
    folderPath: 'lincoln',
    description: 'Register of Free Persons of Color - Lincoln County'
  },

  // Georgia Records - Free Persons - Lumpkin
  {
    collectionSlug: 'register-free-persons-lumpkin',
    bucketName: 'georgia-records-free-enslaved',
    folderPath: 'lumpkin',
    description: 'Register of Free Persons of Color - Lumpkin County'
  },

  // Georgia Records - Free Persons - Thomas
  {
    collectionSlug: 'register-free-persons-thomas',
    bucketName: 'georgia-records-free-enslaved',
    folderPath: 'thomas',
    description: 'Register of Free Persons of Color - Thomas County'
  },

  // Georgia Records - Free Persons - Warren
  {
    collectionSlug: 'register-free-persons-warren',
    bucketName: 'georgia-records-free-enslaved',
    folderPath: 'warren',
    description: 'Register of Free Persons of Color - Warren County'
  },

  // Virginia Order Books - Chesterfield
  {
    collectionSlug: 'order-books-chesterfield',
    bucketName: 'va-order-books',
    folderPath: 'chesterfield',
    description: 'Virginia Order Books - Chesterfield County'
  },

  // Virginia Order Books - Goochland
  {
    collectionSlug: 'order-books-goochland',
    bucketName: 'va-order-books',
    folderPath: 'goochland',
    description: 'Virginia Order Books - Goochland County'
  },

  // Virginia Order Books - Henrico
  {
    collectionSlug: 'order-books-henrico',
    bucketName: 'va-order-books',
    folderPath: 'henrico',
    description: 'Virginia Order Books - Henrico County'
  },

  // Virginia Order Books - Spotsylvania
  {
    collectionSlug: 'order-books-spotsylvania',
    bucketName: 'va-order-books',
    folderPath: 'spotsylvania',
    description: 'Virginia Order Books - Spotsylvania County'
  },

  // Slave Merchant Records - Samuel & William Vernon - Othello
  {
    collectionSlug: 'brig-othello',
    bucketName: 'slave-merchant-records',
    folderPath: 'samuel-william/othello',
    description: 'Slave Merchants - Samuel and William Vernon Co. - Brig Othello'
  },

  // Slave Merchant Records - Samuel & William Vernon - Royal Charlotte
  {
    collectionSlug: 'royal-charlotte',
    bucketName: 'slave-merchant-records',
    folderPath: 'samuel-william/charlotte',
    description: 'Slave Merchants - Samuel and William Vernon Co. - Royal Charlotte'
  },

  // Slave Merchant Records - Samuel & William Vernon - Schooner Sally
  {
    collectionSlug: 'schooner-sally',
    bucketName: 'slave-merchant-records',
    folderPath: 'samuel-william/schooner',
    description: 'Slave Merchants - Samuel and William Vernon Co. - Schooner Sally'
  },

  // Bible & Church Records - Mother Bethel
  {
    collectionSlug: 'mother-bethel',
    bucketName: 'bible-church-records',
    folderPath: 'mother-bethel',
    description: 'Mother Bethel AME Church Records'
  },

  // British, Spanish, French Records
  {
    collectionSlug: 'colored-deaths-1785-1821',
    bucketName: 'brit-span-fren',
    folderPath: 'coldea-85-21',
    description: 'Colored Deaths 1785-1821 (Diocese of St Augustine)'
  },
  {
    collectionSlug: 'colored-marriages-1784-1882',
    bucketName: 'brit-span-fren',
    folderPath: 'colmar-84-82',
    description: 'Colored Marriages 1784-1882 (Diocese of St Augustine)'
  }
];

/**
 * Get storage bucket configuration for a collection
 * @param collectionSlug - The slug of the collection
 * @returns The bucket configuration or undefined if not found
 */
export function getStorageBucketConfig(collectionSlug: string): StorageBucketMapping | undefined {
  return STORAGE_BUCKET_MAPPINGS.find(m => m.collectionSlug === collectionSlug);
}

/**
 * Get all bucket configurations for a specific bucket name
 * @param bucketName - The name of the storage bucket
 * @returns Array of configurations using this bucket
 */
export function getConfigsByBucket(bucketName: string): StorageBucketMapping[] {
  return STORAGE_BUCKET_MAPPINGS.filter(m => m.bucketName === bucketName);
}

/**
 * List all configured collection slugs
 * @returns Array of all collection slugs with storage configurations
 */
export function getAllConfiguredCollections(): string[] {
  return STORAGE_BUCKET_MAPPINGS.map(m => m.collectionSlug);
}

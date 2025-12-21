#!/usr/bin/env node

/**
 * Storage Bucket Diagnostic Script
 *
 * This script lists all Supabase storage buckets and their contents,
 * helping to map collections to their storage locations.
 *
 * Usage: node scripts/list-storage-buckets.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');

  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};

  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

const env = loadEnvFile();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;

// Prefer service role key for full bucket access, fallback to anon key
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

console.log('Using service role key:', !!env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = createClient(supabaseUrl, supabaseKey);

async function listFolderContents(bucketName, folderPath = '', depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return null;

  try {
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error(`Error listing ${bucketName}/${folderPath}:`, error.message);
      return null;
    }

    if (!files || files.length === 0) {
      return { files: [], folders: [] };
    }

    const result = {
      files: [],
      folders: {},
      fileCount: 0
    };

    // Separate files and folders
    for (const item of files) {
      if (item.id === null) {
        // This is a folder
        const subPath = folderPath ? `${folderPath}/${item.name}` : item.name;
        const subContents = await listFolderContents(bucketName, subPath, depth + 1, maxDepth);
        if (subContents) {
          result.folders[item.name] = subContents;
        }
      } else {
        // This is a file
        const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(item.name);
        result.files.push({
          name: item.name,
          size: item.metadata?.size || 0,
          isImage: isImage,
          fullPath: folderPath ? `${folderPath}/${item.name}` : item.name
        });
        if (isImage) {
          result.fileCount++;
        }
      }
    }

    // Calculate total file count including subfolders
    for (const folder of Object.values(result.folders)) {
      result.fileCount += folder.fileCount || 0;
    }

    return result;
  } catch (err) {
    console.error(`Exception listing ${bucketName}/${folderPath}:`, err.message);
    return null;
  }
}

async function analyzeBuckets() {
  console.log('Fetching storage buckets...\n');

  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error('Error fetching buckets:', error);
    process.exit(1);
  }

  if (!buckets || buckets.length === 0) {
    console.log('No storage buckets found.');
    return;
  }

  console.log(`Found ${buckets.length} bucket(s)\n`);

  const bucketStructures = [];
  const suggestedMappings = [];

  for (const bucket of buckets) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Bucket: ${bucket.name}`);
    console.log(`ID: ${bucket.id}`);
    console.log(`Public: ${bucket.public}`);
    console.log(`${'='.repeat(60)}\n`);

    const contents = await listFolderContents(bucket.name);

    if (!contents) {
      console.log('  (Unable to list contents)\n');
      continue;
    }

    bucketStructures.push({
      name: bucket.name,
      id: bucket.id,
      public: bucket.public,
      structure: contents
    });

    // Print folder structure
    function printStructure(structure, indent = '  ') {
      // Print files
      if (structure.files && structure.files.length > 0) {
        const imageFiles = structure.files.filter(f => f.isImage);
        console.log(`${indent}📄 ${structure.files.length} files (${imageFiles.length} images)`);

        // Show first 5 image files as samples
        const samples = imageFiles.slice(0, 5);
        if (samples.length > 0) {
          console.log(`${indent}   Sample images:`);
          samples.forEach(file => {
            console.log(`${indent}     - ${file.name}`);
          });
          if (imageFiles.length > 5) {
            console.log(`${indent}     ... and ${imageFiles.length - 5} more`);
          }
        }
      }

      // Print folders
      if (structure.folders && Object.keys(structure.folders).length > 0) {
        console.log(`${indent}📁 Folders:`);
        for (const [folderName, folderContents] of Object.entries(structure.folders)) {
          console.log(`${indent}  └─ ${folderName}/ (${folderContents.fileCount || 0} images)`);

          // Create suggested mapping for this folder if it has images
          if (folderContents.fileCount > 0) {
            suggestedMappings.push({
              collectionSlug: folderName,
              bucketName: bucket.name,
              folderPath: folderName + '/',
              imageCount: folderContents.fileCount
            });
          }

          // Recursively print subfolder contents
          if (Object.keys(folderContents.folders || {}).length > 0) {
            printStructure(folderContents, indent + '     ');
          }
        }
      }
    }

    printStructure(contents);
  }

  // Generate output JSON
  const output = {
    timestamp: new Date().toISOString(),
    buckets: bucketStructures,
    suggestedMappings: suggestedMappings,
    summary: {
      totalBuckets: buckets.length,
      totalMappings: suggestedMappings.length
    }
  };

  // Save to file
  const outputPath = path.join(__dirname, '..', 'storage-structure.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total buckets: ${buckets.length}`);
  console.log(`Suggested mappings: ${suggestedMappings.length}`);
  console.log(`\nFull output saved to: storage-structure.json`);
  console.log(`\nSuggested Mappings:\n`);

  suggestedMappings
    .sort((a, b) => b.imageCount - a.imageCount)
    .forEach(mapping => {
      console.log(`  ${mapping.collectionSlug}`);
      console.log(`    Bucket: ${mapping.bucketName}`);
      console.log(`    Path: ${mapping.folderPath}`);
      console.log(`    Images: ${mapping.imageCount}`);
      console.log();
    });
}

// Run the analysis
analyzeBuckets().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

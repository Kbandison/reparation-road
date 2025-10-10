// Script to check image paths in the database
// Run with: node scripts/check-image-paths.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkImagePaths() {
  console.log('Checking image paths in archive_pages table...\n');

  const { data, error } = await supabase
    .from('archive_pages')
    .select('id, collection_slug, image_path')
    .eq('collection_slug', 'inspection-roll-of-negroes')
    .limit(5);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No records found for inspection-roll-of-negroes collection');
    return;
  }

  console.log(`Found ${data.length} sample records:\n`);

  data.forEach((record, index) => {
    console.log(`Record ${index + 1}:`);
    console.log(`  ID: ${record.id}`);
    console.log(`  Collection: ${record.collection_slug}`);
    console.log(`  Image Path: ${record.image_path}`);

    // Try to construct the Supabase URL
    const { data: urlData } = supabase.storage
      .from('archive-images')
      .getPublicUrl(record.image_path);

    console.log(`  Constructed URL: ${urlData.publicUrl}`);
    console.log('');
  });

  // List available storage buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error('Error fetching buckets:', bucketsError);
  } else {
    console.log('Available storage buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
  }
}

checkImagePaths();

// Script to diagnose bookmark issues
// Run with: node scripts/check-bookmarks.js

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
  envVars.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS
);

async function checkBookmarks() {
  console.log('=== Checking Bookmark Table ===\n');

  // Check if table exists
  const { data: tables, error: tablesError } = await supabase
    .from('bookmarks')
    .select('*')
    .limit(1);

  if (tablesError) {
    console.error('❌ Error accessing bookmarks table:', tablesError);
    console.log('\nTable may not exist or RLS is blocking access.');
    return;
  }

  console.log('✅ Bookmarks table exists\n');

  // Get table structure
  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error fetching bookmarks:', error);
  } else {
    console.log(`Found ${bookmarks?.length || 0} bookmarks in database`);
    if (bookmarks && bookmarks.length > 0) {
      console.log('\nSample bookmark:');
      console.log(JSON.stringify(bookmarks[0], null, 2));
    }
  }

  // Check users table
  console.log('\n=== Checking Users ===\n');
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.error('Error fetching users:', usersError);
  } else {
    console.log(`Total users: ${users.users.length}`);
    users.users.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`);
    });
  }

  // Try to create a test bookmark
  console.log('\n=== Testing Bookmark Creation ===\n');

  if (users && users.users.length > 0) {
    const testUserId = users.users[0].id;
    const testPageId = 'test-page-id-123';

    console.log(`Attempting to create bookmark for user: ${testUserId}`);

    const { data: insertData, error: insertError } = await supabase
      .from('bookmarks')
      .insert({
        user_id: testUserId,
        page_id: testPageId,
      })
      .select();

    if (insertError) {
      console.error('❌ Failed to create bookmark:', insertError);
      console.log('\nThis is likely an RLS policy issue.');
    } else {
      console.log('✅ Successfully created test bookmark:', insertData);

      // Clean up
      await supabase
        .from('bookmarks')
        .delete()
        .eq('page_id', testPageId);
      console.log('Cleaned up test bookmark');
    }
  }
}

checkBookmarks();

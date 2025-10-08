# Supabase Setup Guide for Collection Management

This guide will help you set up the necessary Supabase configurations for the admin collection management system to work properly.

## Issue 1: Row Level Security (RLS) Policies

### Problem
When trying to add new archive pages, you're getting this error:
```
Database error: new row violates row-level security policy for table "archive_pages"
```

### Solution
You need to create RLS policies that allow admins to insert, update, and delete records in the `archive_pages` table.

#### Steps to Fix:

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: reparation-road
3. **Go to SQL Editor** (in the left sidebar)
4. **Copy and paste the contents of `supabase-migrations.sql`** into the SQL editor
5. **Run the SQL commands**

The policies will:
- Allow **everyone** to read archive pages (for public viewing)
- Allow **only admins** to insert, update, and delete archive pages

#### Alternative Method (Manual):

If you prefer to use the UI:

1. Go to **Authentication** > **Policies** in your Supabase dashboard
2. Find the `archive_pages` table
3. Create the following policies:

**Policy 1: Read Access for All**
- Operation: SELECT
- Policy name: "Enable read access for all users"
- Target roles: All
- USING expression: `true`

**Policy 2: Insert for Admins**
- Operation: INSERT
- Policy name: "Enable insert for admins"
- Target roles: Authenticated users
- WITH CHECK expression:
```sql
EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
)
```

**Policy 3: Update for Admins**
- Operation: UPDATE
- Policy name: "Enable update for admins"
- Target roles: Authenticated users
- USING expression:
```sql
EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
)
```
- WITH CHECK expression: (same as USING)

**Policy 4: Delete for Admins**
- Operation: DELETE
- Policy name: "Enable delete for admins"
- Target roles: Authenticated users
- USING expression:
```sql
EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
)
```

---

## Issue 2: Storage Bucket Setup (For Image Uploads)

If you plan to upload images from your local machine (not just URLs), you also need to create the storage bucket.

### Steps:

1. **Go to Storage** in your Supabase dashboard
2. **Click "Create Bucket"**
3. **Bucket details:**
   - Name: `archives`
   - Public bucket: **Yes** (check this box)
   - File size limit: 50 MB (or your preferred limit)
   - Allowed MIME types: Leave empty or add: `image/jpeg,image/png,image/webp,image/gif`

4. **Create the bucket**

### Storage Policies (Optional)

If you want more control over who can upload/delete images:

1. Go to **Storage** > **Policies**
2. Select the `archives` bucket
3. Create these policies:

**Read Policy (Public)**
```sql
-- Allow everyone to read images
true
```

**Upload Policy (Admins only)**
```sql
-- Allow only admins to upload
EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
)
```

**Delete Policy (Admins only)**
```sql
-- Allow only admins to delete
EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role = 'admin'
)
```

---

## Testing

After setting up the policies:

1. **Log in as an admin** on your site
2. **Go to Admin** > **Collection Management**
3. **Click "Add New Page"**
4. **Fill out the form** and try to save
5. **Check the browser console** for any remaining errors

The save button should now work properly!

---

## Common Issues

### "Bucket not found" error
- Make sure you created the `archives` bucket in Storage
- Ensure the bucket is set to **public**

### "Insufficient permissions" error
- Make sure your admin user has `role = 'admin'` in the `profiles` table
- Verify the RLS policies are created correctly

### Images not displaying
- Check that the `archives` bucket is **public**
- Verify the image URLs in the database are correct
- Make sure Next.js config includes the Supabase domain in `remotePatterns`

---

## Need Help?

If you continue to have issues:
1. Check the browser console for detailed error messages
2. Verify your admin role in the `profiles` table
3. Make sure all RLS policies are enabled and correct

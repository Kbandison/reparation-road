# Supabase Password Reset - Complete Fix Guide

## The Problem

You're getting "Invalid or expired password reset link" because:
1. Supabase Site URL is defaulting to localhost
2. The redirect URL validation is failing
3. Console shows: `Auth event: INITIAL_SESSION Session: null`

## Root Cause

Supabase validates the redirect URL against BOTH:
- The **Site URL** setting
- The **Redirect URLs** allowlist

If either is misconfigured, the token exchange fails.

## Step-by-Step Fix

### Step 1: Verify Your Actual Domain

**IMPORTANT**: Is your domain `reparationroad.com` or `reparationroad.org`?

You mentioned trying to set it to `reparationroad.org` but your code uses `reparationroad.com`.

**Action**: Confirm which domain is correct, then use that EVERYWHERE.

### Step 2: Configure Supabase Dashboard (Critical!)

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your Reparation Road project

2. **Navigate to Authentication → URL Configuration**

3. **Set Site URL** (choose based on where you're testing):

   **For Local Development Testing:**
   - Site URL: `http://localhost:3000`

   **For Production Testing:**
   - Site URL: `https://reparationroad.com` (use YOUR actual domain)

   **Note**: You can only have ONE Site URL at a time. Change it based on where you're testing.

4. **Add BOTH URLs to Redirect URLs List:**
   ```
   http://localhost:3000/reset-password
   https://reparationroad.com/reset-password
   ```

   **Critical Requirements:**
   - NO trailing slashes
   - Exact match including http/https
   - Must include `/reset-password` path

5. **Save and Wait**
   - Click Save
   - Wait 2-3 minutes for Supabase to propagate changes
   - Clear browser cache and cookies

### Step 3: Request Fresh Password Reset

**IMPORTANT**: Old reset links will NOT work after configuration changes.

1. Clear browser cache and cookies
2. Go to forgot password page
3. Request a NEW password reset email
4. Check email and click the link

### Step 4: Debug in Browser Console

When you click the reset link, open browser console (F12) and look for:

```
=== PASSWORD RESET DEBUG ===
Full URL: http://localhost:3000/reset-password#access_token=...
Hash: #access_token=...&type=recovery&...
Hash length: (should be > 100)
Hash params: {
  accessToken: 'eyJhbGciO...' (should show first 10 chars)
  refreshToken: 'present'
  type: 'recovery'
  error: 'none'
  errorDescription: 'none'
}
```

### What Different Console Outputs Mean:

**❌ PROBLEM: No hash in URL**
```
Hash:
Hash length: 0
accessToken: 'MISSING'
type: 'MISSING'
```
**Cause**: Redirect URL is not in Supabase allowlist
**Fix**: Double-check Step 2 #4 above

**❌ PROBLEM: Error in hash**
```
error: 'access_denied'
errorDescription: 'Invalid redirect URL'
```
**Cause**: Site URL doesn't match the origin
**Fix**: Update Site URL in Step 2 #3 above

**✅ WORKING: Token present**
```
Hash length: 150+ characters
accessToken: 'eyJhbGciO...'
type: 'recovery'
```
**Result**: Should work! If still failing, wait a bit longer (3 seconds)

### Step 5: Testing in Different Environments

#### Testing Locally (localhost:3000)
1. Set Supabase Site URL to: `http://localhost:3000`
2. Save and wait 2 minutes
3. Request new password reset
4. Click link from email
5. Should redirect to: `http://localhost:3000/reset-password#access_token=...`

#### Testing in Production (reparationroad.com)
1. Set Supabase Site URL to: `https://reparationroad.com`
2. Save and wait 2 minutes
3. Deploy latest code to production
4. Request new password reset FROM production site
5. Click link from email
6. Should redirect to: `https://reparationroad.com/reset-password#access_token=...`

## Common Issues and Solutions

### Issue: "Site URL keeps defaulting to localhost"

**Possible Causes:**
1. Browser caching the old value - hard refresh (Ctrl+Shift+R)
2. Not clicking Save button in Supabase dashboard
3. Multiple browser tabs open - close all and reopen
4. Wrong domain spelling (`.org` vs `.com`)

**Solution:**
1. Close ALL browser tabs with Supabase dashboard
2. Clear browser cache completely
3. Reopen Supabase dashboard
4. Navigate to Authentication → URL Configuration
5. Change Site URL
6. Click Save
7. Refresh page to verify it saved

### Issue: "Token in URL but still getting 'Invalid or expired' error"

**Possible Causes:**
1. Token expired (they only last ~5 minutes from when link is clicked)
2. Token already used (can only use once)
3. Supabase project API keys don't match environment

**Solution:**
1. Verify environment variables in production:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
2. Request brand new reset email
3. Click link immediately (within 1 minute)
4. Don't refresh the page after clicking

### Issue: "Works locally but not in production"

**Solution:**
1. Change Supabase Site URL to production domain
2. Verify environment variables in Vercel/hosting:
   - Go to Vercel → Project → Settings → Environment Variables
   - Confirm NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Redeploy application
4. Request NEW password reset from production site
5. Check production URL

## Verification Checklist

Before testing, verify:

- [ ] Supabase Site URL matches testing environment (localhost OR production)
- [ ] Both redirect URLs added to allowlist (localhost AND production)
- [ ] Clicked Save in Supabase dashboard
- [ ] Waited 2-3 minutes after saving
- [ ] Cleared browser cache and cookies
- [ ] Requested FRESH password reset email
- [ ] Clicked reset link within 1 minute of receiving email
- [ ] Browser console open to see debug logs
- [ ] URL hash contains `access_token` and `type=recovery`

## Still Not Working?

If you've verified all of the above and it still doesn't work:

1. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs → Auth Logs
   - Look for password reset events
   - Check for any error messages

2. **Verify email template:**
   - Go to Supabase Dashboard → Authentication → Email Templates → Reset Password
   - Confirm the template contains: `{{ .SiteURL }}/reset-password?token={{ .Token }}`
   - Or: `{{ .ConfirmationURL }}`

3. **Check Supabase project status:**
   - Go to Supabase Dashboard → Home
   - Verify project is active and not paused

4. **Contact Supabase support:**
   - Provide your project ID
   - Explain you've verified all URL configurations
   - Share the auth logs showing the failed token exchange

## Quick Reference: What Goes Where

| Setting | Development | Production |
|---------|------------|------------|
| **Site URL** (Supabase) | `http://localhost:3000` | `https://reparationroad.com` |
| **Redirect URLs** (Supabase) | Both: `http://localhost:3000/reset-password` AND `https://reparationroad.com/reset-password` | Same |
| **Environment Variables** (Vercel) | N/A | Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Test From** | http://localhost:3000 | https://reparationroad.com |

## Important Notes

1. **Site URL can only be ONE value** - switch it based on where you're testing
2. **Redirect URLs list can have MULTIPLE values** - add both environments
3. **Old reset links NEVER work** after config changes - always request new ones
4. **Tokens expire after ~5 minutes** - click the link quickly
5. **Browser cache matters** - always clear cache after Supabase config changes

---

**Last Updated**: January 2025
**Related Files**:
- `components/auth/ForgotPasswordForm.tsx` (line 54)
- `app/reset-password/page.tsx` (line 28-58)

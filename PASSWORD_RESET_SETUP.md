# Password Reset Configuration Guide

## Issue
Password reset emails are sending correctly, but you may experience one or both of these issues:
1. The reset link redirects to `localhost` instead of your production domain (`reparationroad.com`)
2. You get "Invalid or expired password reset link" immediately when clicking the link

## Root Cause
The Supabase authentication redirect URL needs to be configured correctly in your Supabase dashboard. If not configured, Supabase cannot validate the redirect and the token exchange will fail.

## Solution

### Step 1: Update Supabase Dashboard Settings (CRITICAL)

**⚠️ THIS IS THE MOST IMPORTANT STEP - If not configured correctly, password reset will always fail!**

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your Reparation Road project

2. **Navigate to Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on **URL Configuration**

3. **Update Site URL**
   - Set **Site URL** to: `https://reparationroad.com`
   - (Or your actual production domain if different)
   - For development: `http://localhost:3000`

4. **Add Redirect URLs (CRITICAL)**
   In the **Redirect URLs** section, you MUST add BOTH:
   - `https://reparationroad.com/reset-password` (production)
   - `http://localhost:3000/reset-password` (local development)

   **Important**:
   - The URL must match EXACTLY (including https vs http)
   - No trailing slashes
   - Must end with `/reset-password`
   - Click **Add URL** for each one

5. **Save Changes**
   - Click **Save** at the bottom of the page
   - Wait 1-2 minutes for changes to propagate

6. **Verify Configuration**
   - Refresh the page and confirm both URLs appear in the list
   - The Site URL should match your current environment

### Step 2: Verify Environment Variables

Make sure your production environment (Vercel/Netlify/etc.) has these variables set:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Test the Flow

1. **In Development (localhost:3000)**
   - Request password reset
   - Click email link
   - Should redirect to `http://localhost:3000/reset-password`

2. **In Production (reparationroad.com)**
   - Request password reset
   - Click email link
   - Should redirect to `https://reparationroad.com/reset-password`

## How It Works

The code in `components/auth/ForgotPasswordForm.tsx` uses:

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});
```

- `window.location.origin` automatically detects the current domain
- On localhost: `http://localhost:3000`
- On production: `https://reparationroad.com`

However, Supabase **validates** the redirect URL against the allowed list in your dashboard settings. If the URL isn't in the allowed list, it may default to the Site URL.

## Additional Configuration (Optional)

### Email Template Customization

You can customize the password reset email template in:
- **Supabase Dashboard** → **Authentication** → **Email Templates** → **Reset Password**
- Use the branded template from `supabase/templates/reset_password.html`

### Security Best Practices

1. **Only allow HTTPS in production**
   - Remove `http://` URLs from production redirect list
   - Keep `http://localhost` only for development

2. **Use environment-specific URLs**
   - Development: `http://localhost:3000`
   - Staging: `https://staging.reparationroad.com` (if applicable)
   - Production: `https://reparationroad.com`

## Troubleshooting

### Issue: Still redirecting to localhost
**Solution**: Clear your browser cache and cookies, then try again.

### Issue: "Invalid redirect URL" error
**Solution**: Double-check that your production URL is added to the Redirect URLs list in Supabase dashboard.

### Issue: "Invalid or expired password reset link" immediately on page load
This is the most common issue and means Supabase cannot validate your redirect URL.

**Solution**:
1. **Check Browser Console** (F12 → Console tab)
   - Look for console logs showing URL and hash parameters
   - You should see: `Hash params: { accessToken: '...', type: 'recovery' }`
   - If you see `accessToken: 'missing'` or `type: null`, the email link is malformed

2. **Verify Redirect URLs in Supabase Dashboard**
   - Go to Authentication → URL Configuration
   - **The redirect URL must be added to the "Redirect URLs" list EXACTLY as shown**
   - For localhost: `http://localhost:3000/reset-password`
   - For production: `https://reparationroad.com/reset-password`
   - **Common mistakes**:
     - Adding `http://` instead of `https://` for production
     - Adding trailing slash: `https://reparationroad.com/reset-password/` ❌
     - Wrong path: `https://reparationroad.com/auth/reset-password` ❌

3. **Check Site URL**
   - In Supabase dashboard, Site URL should match your current environment
   - Development: `http://localhost:3000`
   - Production: `https://reparationroad.com`

4. **Wait After Saving**
   - After adding redirect URLs, wait 1-2 minutes for Supabase to sync
   - Try clearing browser cache and cookies
   - Request a NEW password reset email (old links won't work with new config)

5. **Click Link Directly**
   - Click the link in your email directly (don't copy/paste)
   - The token is in the URL hash (#access_token=...) and may not survive copy/paste

6. **Check Email Template**
   - The email should contain a link like:
     `http://localhost:3000/reset-password#access_token=...&type=recovery`
   - If the link format is different, you may need to update the email template in Supabase

### Issue: Email not sending
**Solution**:
- Check Supabase logs in dashboard
- Verify SMTP settings are configured
- Check spam folder

### Issue: Reset link expires immediately
**Solution**:
- Reset tokens expire after 1 hour by default (3600 seconds)
- Check that your server time is correct
- Verify token in Supabase logs
- To change expiration time:
  - Go to Supabase Dashboard → Authentication → Settings
  - Look for "JWT expiry limit" or "Password reset expiry"
  - Default is 3600 seconds (1 hour)

### Issue: "Auth session is missing" error
**Solution**:
- This occurs when the token has expired or is invalid
- Request a new password reset link
- Use the reset link within 1 hour of receiving it
- Don't refresh the page after clicking the reset link
- Ensure cookies are enabled in your browser

## Testing Checklist

- [ ] Password reset email sends successfully
- [ ] Email link redirects to correct domain (not localhost)
- [ ] Reset password page loads correctly
- [ ] New password can be set successfully
- [ ] Can log in with new password
- [ ] Old password no longer works

## Support

If you continue to experience issues:
1. Check Supabase documentation: https://supabase.com/docs/guides/auth/auth-email-templates
2. Review Supabase logs in your dashboard
3. Contact Supabase support if the issue persists

---

**Last Updated**: December 2024
**Related Files**:
- `components/auth/ForgotPasswordForm.tsx`
- `app/reset-password/page.tsx`
- `supabase/templates/reset_password.html`

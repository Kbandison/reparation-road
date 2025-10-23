# Password Reset Configuration Guide

## Issue
Password reset emails are sending correctly, but the reset link redirects to `localhost` instead of your production domain (`reparationroad.com`), causing a "site can't be reached" error.

## Root Cause
The Supabase authentication redirect URL needs to be configured to use your production domain for deployed environments.

## Solution

### Step 1: Update Supabase Dashboard Settings

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your Reparation Road project

2. **Navigate to Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on **URL Configuration**

3. **Update Site URL**
   - Set **Site URL** to: `https://reparationroad.com`
   - (Or your actual production domain if different)

4. **Add Redirect URLs**
   In the **Redirect URLs** section, add both:
   - `https://reparationroad.com/reset-password`
   - `http://localhost:3000/reset-password` (for local development)

   Click **Add URL** for each one.

5. **Save Changes**
   - Click **Save** at the bottom of the page

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

### Issue: Email not sending
**Solution**:
- Check Supabase logs in dashboard
- Verify SMTP settings are configured
- Check spam folder

### Issue: Reset link expires immediately
**Solution**:
- Reset tokens expire after 1 hour by default
- Check that your server time is correct
- Verify token in Supabase logs

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

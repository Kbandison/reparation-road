# Reparation Road - Email Templates Implementation Guide

## Overview

This guide explains how to implement the custom branded email templates for Supabase authentication emails. These templates match the Reparation Road brand identity and provide a professional, cohesive user experience.

## Brand Colors Used

- **Brand Green**: `#3a5a40` (Primary actions, headers)
- **Brand Dark Green**: `#194d12` (Hover states, accents)
- **Brand Tan**: `#e6dbc6` (Backgrounds, borders)
- **Brand Beige**: `#fefaf5` (Page background)
- **Brand Brown**: `#5b2e00` (Text, headings)
- **White**: `#ffffff` (Card backgrounds)

## Brand Fonts

- **Headings**: EB Garamond (serif, elegant)
- **Body**: Inter (sans-serif, readable)

## Available Templates

The following email templates have been created in the `supabase/templates/` directory:

1. **reset_password.html** - Password reset emails
2. **confirm_signup.html** - Email confirmation for new signups
3. **magic_link.html** - Passwordless sign-in emails
4. **email_change.html** - Email address change confirmation
5. **invite.html** - User invitation emails

## Implementation Methods

### Method 1: Supabase Dashboard (Recommended)

This is the easiest method for most users.

#### Step-by-Step Instructions:

1. **Access Your Supabase Project Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your Reparation Road project

2. **Navigate to Email Templates**
   - Click on **Authentication** in the left sidebar
   - Click on **Email Templates**

3. **Update Each Template**

   For each template type (Confirm signup, Magic Link, Change Email Address, Reset Password, Invite User):

   a. Click on the template name

   b. Copy the corresponding HTML content from the files in `supabase/templates/`:
      - Confirm signup → `confirm_signup.html`
      - Magic Link → `magic_link.html`
      - Change Email Address → `email_change.html`
      - Reset Password → `reset_password.html`
      - Invite User → `invite.html`

   c. Paste the HTML into the template editor

   d. **Important**: Keep the Supabase template variables as they are:
      - `{{ .ConfirmationURL }}` - The verification/action link
      - `{{ .Token }}` - The token (if needed)
      - `{{ .TokenHash }}` - Hashed token (if needed)
      - `{{ .SiteURL }}` - Your site URL
      - `{{ .Email }}` - User's email address

   e. Click **Save**

4. **Configure Site URL**
   - In the Authentication settings, ensure your **Site URL** is set correctly
   - For production: `https://yourdomain.com`
   - For development: `http://localhost:3000`

5. **Test the Templates**
   - Create a test account to verify the signup confirmation email
   - Request a password reset to test that template
   - Try the magic link sign-in feature

### Method 2: Supabase CLI (Advanced)

For developers who prefer infrastructure-as-code or need version control.

#### Prerequisites:
- Supabase CLI installed: `npm install -g supabase`
- Linked to your Supabase project: `supabase link`

#### Steps:

1. **Initialize Supabase locally** (if not already done):
   ```bash
   supabase init
   ```

2. **Copy templates to the Supabase config directory**:
   ```bash
   # The templates are already in supabase/templates/
   # Ensure they're in the correct location
   ```

3. **Update your Supabase config** (`supabase/config.toml`):

   Add or update the auth email configuration:

   ```toml
   [auth.email]
   enable_signup = true
   double_confirm_changes = true
   enable_confirmations = true

   [auth.email.template.invite]
   subject = "You've Been Invited to Reparation Road"
   content_path = "./templates/invite.html"

   [auth.email.template.confirmation]
   subject = "Confirm Your Email - Reparation Road"
   content_path = "./templates/confirm_signup.html"

   [auth.email.template.recovery]
   subject = "Reset Your Password - Reparation Road"
   content_path = "./templates/reset_password.html"

   [auth.email.template.magic_link]
   subject = "Your Sign-In Link - Reparation Road"
   content_path = "./templates/magic_link.html"

   [auth.email.template.email_change]
   subject = "Confirm Your Email Change - Reparation Road"
   content_path = "./templates/email_change.html"
   ```

4. **Push changes to Supabase**:
   ```bash
   supabase db push
   ```

## Template Variables Reference

All templates support the following Supabase variables:

| Variable | Description | Used In |
|----------|-------------|---------|
| `{{ .ConfirmationURL }}` | Full URL for user to click | All templates |
| `{{ .Token }}` | Raw token value | Advanced use cases |
| `{{ .TokenHash }}` | Hashed token | Advanced use cases |
| `{{ .SiteURL }}` | Your configured site URL | All templates |
| `{{ .Email }}` | Recipient's email address | Invite, Email Change |

## Customization Tips

### Update Contact Email
Replace `support@reparationroad.com` in all templates with your actual support email address.

### Update Year
Update the copyright year in the footer if needed:
```html
<p style="margin-top: 16px; font-size: 12px; color: #666;">
  © 2024 Reparation Road. All rights reserved.
</p>
```

### Add Logo
To add your logo to the email header:

1. Host your logo image (use Supabase Storage or another CDN)
2. Replace the text header with an image:

```html
<div class="header">
  <img src="https://your-cdn.com/logo.png" alt="Reparation Road" style="max-width: 200px; height: auto;">
  <p>Uncovering Black History, Empowering Communities</p>
</div>
```

### Customize Links
Update the footer links to match your actual routes:
- `/about` - About page
- `/collection` - Collections page
- `/booking` - Booking page
- `/profile` - User profile page

## Testing Your Templates

### Test in Development

1. **Create a test user**:
   ```javascript
   const { data, error } = await supabase.auth.signUp({
     email: 'test@example.com',
     password: 'TestPassword123'
   })
   ```

2. **Request password reset**:
   ```javascript
   const { error } = await supabase.auth.resetPasswordForEmail('test@example.com')
   ```

3. **Test magic link**:
   ```javascript
   const { error } = await supabase.auth.signInWithOtp({
     email: 'test@example.com'
   })
   ```

### Email Testing Services

Use these services to preview emails across different clients:
- [Litmus](https://litmus.com/) - Comprehensive email testing
- [Email on Acid](https://www.emailonacid.com/) - Cross-client testing
- [Mailtrap](https://mailtrap.io/) - Development email testing

## Troubleshooting

### Emails Not Sending
1. Check SMTP settings in Supabase dashboard
2. Verify email service is enabled
3. Check spam folder
4. Review Supabase logs for errors

### Template Not Updating
1. Clear browser cache
2. Hard refresh the authentication settings page
3. Wait 5-10 minutes for changes to propagate
4. Try logging out and back in to Supabase dashboard

### Broken Links in Emails
1. Verify Site URL is set correctly in Authentication settings
2. Ensure redirect URLs are added to allowed redirect URLs list
3. Check that `{{ .ConfirmationURL }}` variable is not modified

### Styling Issues
1. Email clients have limited CSS support
2. Use inline styles for critical styling
3. Test across multiple email clients (Gmail, Outlook, Apple Mail)
4. Avoid CSS features like flexbox or grid

## Mobile Responsiveness

All templates include media queries for mobile devices:

```css
@media only screen and (max-width: 600px) {
  .content {
    padding: 30px 20px;
  }
  .header h1 {
    font-size: 26px;
  }
  .button {
    padding: 14px 32px;
    font-size: 15px;
  }
}
```

## Security Best Practices

1. **Never modify the `{{ .ConfirmationURL }}`** - This is the secure token link
2. **Include expiration warnings** - All templates mention link expiration
3. **Add security notices** - Templates warn users about suspicious emails
4. **Provide contact information** - Users can report security concerns

## Accessibility

The templates follow accessibility best practices:

- Semantic HTML structure
- Sufficient color contrast (WCAG AA compliant)
- Alt text ready for images (when you add them)
- Readable font sizes (minimum 14px)
- Clear call-to-action buttons

## Next Steps

1. ✅ Review all template files in `supabase/templates/`
2. ✅ Update the support email address to your actual email
3. ✅ Upload your logo and update templates if desired
4. ✅ Implement templates using Method 1 or Method 2
5. ✅ Test all email flows thoroughly
6. ✅ Monitor email delivery and user feedback

## Support

If you encounter issues:
- Check Supabase documentation: https://supabase.com/docs/guides/auth/auth-email-templates
- Review Supabase logs in your dashboard
- Test emails in development first
- Contact Supabase support for delivery issues

---

**Created for Reparation Road**
*Uncovering Black History, Empowering Communities*

# Google OAuth Setup Guide

This guide will help you set up Google OAuth for seamless sign-in and registration.

## Error You're Seeing

```
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.
If you're the app developer, register the redirect URI in the Google Cloud Console.
Request details: redirect_uri=http://localhost:3000/api/auth/callback/google
```

This means the redirect URI needs to be registered in Google Cloud Console.

## Step-by-Step Setup

### Step 1: Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Select your project (or create a new one)

### Step 2: Enable Google+ API

1. Go to **APIs & Services** > **Library**
2. Search for "Google+ API" or "Google Identity"
3. Click on it and click **Enable**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in required fields:
     - App name: Your app name (e.g., "Mony Dragon Portfolio")
     - User support email: Your email
     - Developer contact: Your email
   - Click **Save and Continue**
   - Add scopes (at minimum, add `email` and `profile`)
   - Click **Save and Continue**
   - Add test users (your email) if in testing mode
   - Click **Save and Continue**

### Step 4: Create OAuth Client ID

1. Back in **Credentials**, click **+ CREATE CREDENTIALS** > **OAuth client ID**
2. Choose **Web application** as the application type
3. Give it a name (e.g., "Portfolio Web Client")
4. **IMPORTANT**: Add these Authorized redirect URIs:

   **For Development:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

   **For Production (add when deploying):**
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

5. Click **Create**

### Step 5: Copy Credentials

After creating, you'll see:
- **Client ID** (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

### Step 6: Add to .env.local

Add these to your `.env.local` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

**Example:**
```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

### Step 7: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

### Step 8: Test Google Sign-In

1. Go to `http://localhost:3000/login`
2. Click "Continue with Google"
3. You should be redirected to Google's sign-in page
4. After signing in, you'll be redirected back to your app

## Common Issues

### "redirect_uri_mismatch" Error

**Problem:** The redirect URI in your request doesn't match what's registered.

**Solution:**
1. Check that you added the exact URI: `http://localhost:3000/api/auth/callback/google`
2. Make sure there are no trailing slashes
3. Verify `NEXTAUTH_URL` in `.env.local` matches: `http://localhost:3000`
4. Wait a few minutes after adding the URI (Google may cache)

### "Access blocked: This app's request is invalid"

**Problem:** OAuth consent screen not configured or app is in testing mode.

**Solution:**
1. Go to **APIs & Services** > **OAuth consent screen**
2. Complete all required fields
3. Add your email as a test user if in testing mode
4. Publish the app (if ready for production)

### "Invalid client" Error

**Problem:** Client ID or Secret is incorrect.

**Solution:**
1. Double-check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
2. Make sure there are no extra spaces or quotes
3. Restart your dev server after changing `.env.local`

### Google Sign-In Works But User Not Created

**Problem:** Database connection issue or error in signIn callback.

**Solution:**
1. Check MongoDB is running: `npm run docker:status`
2. Check server logs for errors
3. Verify `MONGODB_URI` in `.env.local` is correct

## Production Setup

When deploying to production:

1. **Add Production Redirect URI:**
   - Go to Google Cloud Console > Credentials
   - Edit your OAuth 2.0 Client ID
   - Add: `https://yourdomain.com/api/auth/callback/google`

2. **Update .env.local on Server:**
   ```bash
   NEXTAUTH_URL=https://yourdomain.com
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

3. **OAuth Consent Screen:**
   - If your app is in testing mode, add production domain
   - Consider publishing the app for public use

## Security Notes

- ✅ Never commit `.env.local` to git
- ✅ Keep your Client Secret secure
- ✅ Use different OAuth clients for development and production
- ✅ Regularly rotate secrets
- ✅ Monitor OAuth usage in Google Cloud Console

## Quick Checklist

- [ ] Google Cloud Console project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] Redirect URI added: `http://localhost:3000/api/auth/callback/google`
- [ ] Client ID and Secret added to `.env.local`
- [ ] Dev server restarted
- [ ] Google sign-in tested successfully

## Need Help?

If you're still having issues:

1. Check the browser console for errors
2. Check server terminal for errors
3. Verify all environment variables are set correctly
4. Make sure MongoDB is running
5. Try clearing browser cache and cookies
6. Check Google Cloud Console for any error messages

---

**Once set up, Google sign-in will:**
- ✅ Auto-create user accounts
- ✅ Auto-verify email addresses
- ✅ Provide seamless registration/login experience
- ✅ Work on both development and production





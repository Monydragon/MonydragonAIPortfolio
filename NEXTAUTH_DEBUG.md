# NextAuth Debugging Guide

## Current Setup

### Route Handler
- Location: `app/api/auth/[...nextauth]/route.ts`
- Pattern: Uses NextAuth v5 beta handlers export

### Configuration
- Config file: `lib/auth-config.ts`
- Auth instance: `auth.ts`

## Common Issues

### Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

This error means NextAuth is receiving HTML instead of JSON. Common causes:

1. **Route not found (404)**
   - Check that the route file exists at `app/api/auth/[...nextauth]/route.ts`
   - Verify the file exports GET and POST handlers

2. **Missing NEXTAUTH_SECRET**
   - Ensure `.env.local` has `NEXTAUTH_SECRET` set
   - Generate a secret: `openssl rand -base64 32`

3. **Route handler not exporting correctly**
   - Should export: `export const { GET, POST } = handlers;`
   - Handlers come from: `const { handlers } = NextAuth(authConfig);`

4. **BasePath mismatch**
   - SessionProvider should NOT have basePath in NextAuth v5
   - Route is automatically at `/api/auth/[...nextauth]`

## Testing

1. Test if auth API is accessible:
   ```
   http://localhost:3000/api/auth/test
   ```
   Should return JSON: `{ "message": "Auth API is accessible", ... }`

2. Test NextAuth session endpoint:
   ```
   http://localhost:3000/api/auth/session
   ```
   Should return JSON (even if unauthenticated)

3. Check browser console for exact error
4. Check Network tab for failed requests

## Fixes Applied

1. ✅ Route handler exports handlers correctly
2. ✅ Removed basePath from SessionProvider (not needed in v5)
3. ✅ Added trustHost: true to authConfig
4. ✅ Simplified pages config (removed error page)

## Next Steps if Still Failing

1. Verify `.env.local` exists and has `NEXTAUTH_SECRET`
2. Restart dev server after changes
3. Clear browser cache/cookies
4. Check terminal for server-side errors
5. Verify MongoDB connection (if using credentials provider)


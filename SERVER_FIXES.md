# Server Fixes Required

## Files That Need to Be Created/Updated on Server

### 1. Fix auth.ts Import Path

On your server, run:

```bash
cd /mony/administrator/monydragon-ai-portfolio
sed -i 's|from "./lib/auth-config"|from "@/lib/auth-config"|g' auth.ts
```

Or manually edit:
```bash
nano auth.ts
```

Change line 2 from:
```typescript
import { authConfig } from "./lib/auth-config";
```

To:
```typescript
import { authConfig } from "@/lib/auth-config";
```

### 2. Fix Contact Page Apostrophes

On your server, run:

```bash
cd /mony/administrator/monydragon-ai-portfolio

# Fix apostrophes in contact page
sed -i "s/Let's connect/Let\&apos;s connect/g" app/contact/page.tsx
sed -i "s/Let's Build/Let\&apos;s Build/g" app/contact/page.tsx
sed -i "s/you're/you\&apos;re/g" app/contact/page.tsx
sed -i "s/I'd/I\&apos;d/g" app/contact/page.tsx
```

Or manually edit `app/contact/page.tsx` and replace:
- Line 142: `Let's` → `Let&apos;s`
- Line 249: `Let's` → `Let&apos;s`
- Line 252: `you're` → `you&apos;re` and `I'd` → `I&apos;d`

### 3. Verify hooks/useSound.ts Exists

```bash
ls -la hooks/useSound.ts
```

If it doesn't exist, create it (see previous instructions).

## Quick Fix Script

Run this on your server to fix everything at once:

```bash
cd /mony/administrator/monydragon-ai-portfolio

# Fix auth.ts
sed -i 's|from "./lib/auth-config"|from "@/lib/auth-config"|g' auth.ts

# Fix contact page apostrophes
sed -i "s/Let's connect/Let\&apos;s connect/g" app/contact/page.tsx
sed -i "s/Let's Build/Let\&apos;s Build/g" app/contact/page.tsx
sed -i "s/you're/you\&apos;re/g" app/contact/page.tsx
sed -i "s/I'd/I\&apos;d/g" app/contact/page.tsx

# Verify files
echo "=== Verifying fixes ==="
grep "from \"@/lib/auth-config\"" auth.ts && echo "✓ auth.ts fixed" || echo "✗ auth.ts needs fixing"
grep "Let&apos;s" app/contact/page.tsx && echo "✓ contact page fixed" || echo "✗ contact page needs fixing"
```

## After Fixes, Rebuild

```bash
npm run build
```

The build should now succeed! The warnings about React hooks are just warnings and won't prevent the build from completing.


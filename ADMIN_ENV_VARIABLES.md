# Admin User Creation - Environment Variables

This document lists all environment variables you can set in your `.env.local` file for the admin user creation scripts.

## Scripts

- `npm run create-admin` - Uses `scripts/create-admin-user.ts`
- `npm run create-admin-custom` - Uses `scripts/create-admin-custom.ts`

Both scripts support the same environment variables.

## Required Variables

These are technically optional but recommended (defaults shown):

```env
ADMIN_EMAIL=Monydragon@gmail.com
ADMIN_PASSWORD=YourSecurePassword123!
```

## Basic User Information

```env
ADMIN_FIRST_NAME=Mony
ADMIN_MIDDLE_NAME=          # Optional
ADMIN_LAST_NAME=Dragon
ADMIN_USERNAME=monydragon
```

## Additional Profile Fields (All Optional)

```env
# Contact Information
ADMIN_PHONE=+1234567890
ADMIN_LOCATION=City, Country

# Profile Details
ADMIN_TIMEZONE=America/New_York    # Default: UTC
ADMIN_BIO=Your bio text here
ADMIN_AVATAR=https://example.com/avatar.jpg

# Experience Level
ADMIN_EXPERIENCE_LEVEL=expert      # Options: beginner, intermediate, advanced, expert
```

## Complete Example

Here's a complete example of all fields in your `.env.local`:

```env
# MongoDB Connection (Required)
MONGODB_URI=mongodb://localhost:27017/your-database-name

# NextAuth (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Admin User Creation
ADMIN_EMAIL=Monydragon@gmail.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_FIRST_NAME=Mony
ADMIN_MIDDLE_NAME=
ADMIN_LAST_NAME=Dragon
ADMIN_USERNAME=monydragon
ADMIN_PHONE=+1234567890
ADMIN_LOCATION=New York, USA
ADMIN_TIMEZONE=America/New_York
ADMIN_BIO=Full-stack developer and AI enthusiast
ADMIN_AVATAR=https://example.com/avatar.jpg
ADMIN_EXPERIENCE_LEVEL=expert
```

## Important Notes

1. **Email Verification**: Admins are **ALWAYS automatically verified** - you don't need to verify their email manually.

2. **Existing Users**: If a user with the same email or username already exists, the script will:
   - Add the Administrator role to that user
   - Update any missing profile fields from your `.env.local`
   - Automatically verify their email
   - All changes take effect immediately

3. **Password**: If you're updating an existing user, the password from `.env.local` will NOT be updated (for security). You'll need to change it through the admin dashboard or user management interface.

4. **Timezone**: Use IANA timezone names (e.g., `America/New_York`, `Europe/London`, `Asia/Tokyo`). Default is `UTC`.

5. **Experience Level**: Must be one of: `beginner`, `intermediate`, `advanced`, or `expert`.

## Usage

1. Add the variables you want to your `.env.local` file
2. Run the script:
   ```bash
   npm run create-admin-custom
   ```
3. The script will:
   - Create a new admin user with all provided details, OR
   - Update an existing user (by email or username) with the Administrator role and missing fields

## Verification

After running the script, you can verify the admin user by:
- Logging in with the email and password
- Checking the dashboard - you should see "Administrator" role
- Accessing `/MonyAdmin` - you should have full admin access
- Email should be automatically verified (no verification banner)


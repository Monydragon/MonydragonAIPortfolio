# Admin User Setup Guide

## Default Admin Credentials

The default admin credentials are set in `scripts/create-admin-user.ts`:

- **Email**: `admin@monydragon.com`
- **Password**: `admin123`
- **Name**: `Admin User`

## How to Change Default Credentials

### Option 1: Change Defaults in Code (Recommended for Development)

Edit `scripts/create-admin-user.ts` and change lines 14-16:

```typescript
const email = process.env.ADMIN_EMAIL || "your-email@example.com";
const password = process.env.ADMIN_PASSWORD || "your-secure-password";
const name = process.env.ADMIN_NAME || "Your Name";
```

### Option 2: Use Environment Variables (Recommended for Production)

Set environment variables when running the script:

**Windows (PowerShell):**
```powershell
$env:ADMIN_EMAIL="your-email@example.com"
$env:ADMIN_PASSWORD="your-secure-password"
$env:ADMIN_NAME="Your Name"
npm run create-admin
```

**Windows (Command Prompt):**
```cmd
set ADMIN_EMAIL=your-email@example.com
set ADMIN_PASSWORD=your-secure-password
set ADMIN_NAME=Your Name
npm run create-admin
```

**Linux/Mac:**
```bash
ADMIN_EMAIL=your-email@example.com ADMIN_PASSWORD=your-secure-password ADMIN_NAME="Your Name" npm run create-admin
```

### Option 3: Add to `.env.local` (Not Recommended)

You can add these to `.env.local`, but they won't be automatically used by the script. You still need to export them as environment variables.

## Creating Admin User

### Using Default Credentials:
```bash
npm run create-admin
```

This will create:
- Email: `admin@monydragon.com`
- Password: `admin123`

### Using Custom Credentials:
```bash
# Windows PowerShell
$env:ADMIN_EMAIL="admin@yourdomain.com"; $env:ADMIN_PASSWORD="SecurePass123!"; npm run create-admin

# Windows CMD
set ADMIN_EMAIL=admin@yourdomain.com && set ADMIN_PASSWORD=SecurePass123! && npm run create-admin

# Linux/Mac
ADMIN_EMAIL=admin@yourdomain.com ADMIN_PASSWORD=SecurePass123! npm run create-admin
```

## Security Notes

⚠️ **Important Security Recommendations:**

1. **Change Default Password**: Always change the default password after first login
2. **Use Strong Passwords**: Use a strong, unique password for production
3. **Don't Commit Credentials**: Never commit `.env.local` or hardcoded credentials to git
4. **Use Environment Variables**: For production, always use environment variables

## Login After Creation

After creating the admin user, login at:
- URL: `http://localhost:3000/MonyAdmin/login`
- Username: The email you used (e.g., `admin@monydragon.com`)
- Password: The password you set

## Troubleshooting

### "Admin user already exists"
- The email is already in use
- Use a different email or delete the existing user from MongoDB

### "Invalid username or password"
- Verify you're using the correct email (not username)
- Check that the password matches what you set
- Ensure MongoDB is running and connected

### Change Password After Creation

Currently, password changes must be done directly in MongoDB or by deleting and recreating the user. A password change feature will be added to the admin dashboard in the future.


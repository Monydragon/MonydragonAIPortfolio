# Login Setup Instructions

## Issue Fixed

The login page at `/MonyAdmin/login` was showing as empty because:
1. The admin layout was blocking unauthenticated users from seeing the login page
2. Error handling needed improvement

## What Was Fixed

1. ✅ **Layout Updated**: Admin layout now allows the login page to render without authentication
2. ✅ **Error Handling**: Improved error messages for better user feedback
3. ✅ **Auth Config**: Fixed to properly check for admin role and return null on errors

## How to Use

### Step 1: Create Admin User

First, make sure you have an admin user in MongoDB. Run:

```bash
npm run create-admin
```

Or set custom credentials:
```bash
ADMIN_EMAIL=your-email@example.com npm run create-admin
```

**Note**: The "username" field in the login form accepts the email address you used when creating the admin user.

### Step 2: Ensure Environment Variables

Make sure your `.env.local` file has:

```bash
MONGODB_URI=mongodb://localhost:27017/monydragon_portfolio
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Step 3: Access Login Page

Navigate to: `http://localhost:3000/MonyAdmin/login`

### Step 4: Login

- **Username**: Enter the email address you used when creating the admin user
- **Password**: Enter the password you set

### Step 5: Access Dashboard

After successful login, you'll be redirected to `/MonyAdmin` dashboard.

## Troubleshooting

### "Invalid username or password"
- Verify the admin user exists in MongoDB
- Check that you're using the correct email (username field accepts email)
- Verify the password is correct
- Check MongoDB connection in terminal logs

### "Database configuration missing"
- Ensure `.env.local` file exists
- Check `MONGODB_URI` is set correctly
- Restart dev server after adding environment variables

### "Access denied. Admin privileges required"
- User exists but doesn't have admin role
- Update user role in MongoDB:
  ```javascript
  db.users.updateOne(
    { email: "your-email@example.com" },
    { $set: { role: "admin" } }
  )
  ```

### Login page still empty
- Clear browser cache
- Restart dev server
- Check browser console for errors
- Verify the file exists at `app/MonyAdmin/login/page.tsx`

## Database Structure

The User model stores:
- `email`: Used as username for login
- `password`: Hashed with bcrypt
- `name`: Display name
- `role`: Must be "admin" for access

## Security Notes

- Passwords are hashed using bcrypt
- Only users with `role: "admin"` can access admin routes
- Session expires after 30 days
- All admin routes are protected


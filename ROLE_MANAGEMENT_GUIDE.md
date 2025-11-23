# Role Management & Migration Guide

## Overview

Complete role and permission management system with migration tools to transition from legacy role system to the new permissions-based system.

## Features

### 1. Role Management UI

**Location:** `/MonyAdmin/users-unified` → Roles Tab

**Capabilities:**
- ✅ Create new roles
- ✅ Edit existing roles (name, description, color, permissions, priority)
- ✅ Delete custom roles (system roles cannot be deleted)
- ✅ View all permissions for each role
- ✅ Visual role badges with colors
- ✅ System role protection

### 2. Role API Endpoints

- `GET /api/roles` - List all roles
- `POST /api/roles` - Create new role
- `GET /api/roles/[id]` - Get specific role
- `PUT /api/roles/[id]` - Update role
- `DELETE /api/roles/[id]` - Delete role (cannot delete system roles)

### 3. Migration Tools

**Migration Script:** `scripts/migrate-roles.ts`

**What it does:**
- Migrates all users from legacy `role` field to new `roles` array
- Maps legacy roles to new role system:
  - `admin` → Administrator role
  - `mentor` → Mentor role
  - `user` → Member role (default)
  - `guest` → Guest role
- Ensures all admin users have Administrator role
- Skips users who already have roles assigned

**Usage:**
```bash
npm run migrate-roles
```

### 4. Automatic Role Assignment

**Service:** `lib/services/role-assignment-service.ts`

**Features:**
- `ensureUserRoles(userId)` - Ensures user has appropriate role based on legacy role
- `ensureAdminRoles()` - Ensures all admin users have Administrator role

**API Endpoint:**
- `POST /api/users/ensure-admin-roles` - Manually trigger admin role verification

### 5. Admin Privilege Guarantee

**Automatic Protection:**
- All users with `role: 'admin'` automatically get Administrator role
- Migration script verifies and fixes admin roles
- "Ensure Admin Roles" button in UI for manual verification

## Setup Instructions

### Step 1: Seed Default Roles

```bash
npm run seed-roles
```

This creates:
- Administrator (Priority: 1000, all permissions)
- Moderator (Priority: 500, moderation permissions)
- Mentor (Priority: 300, mentorship permissions)
- Member (Priority: 100, default role)
- Guest (Priority: 0, read-only)

### Step 2: Migrate Existing Users

```bash
npm run migrate-roles
```

This will:
- Assign appropriate roles to all users based on their legacy `role` field
- Ensure all admins have Administrator role
- Skip users who already have roles

### Step 3: Verify Admin Roles

1. Go to `/MonyAdmin/users-unified`
2. Click "Roles" tab
3. Click "Ensure Admin Roles" button
4. Verify all admin users have Administrator role

## Creating Custom Roles

### Via UI

1. Go to `/MonyAdmin/users-unified` → Roles Tab
2. Click "+ Create Role"
3. Fill in:
   - Name (required)
   - Description (optional)
   - Color (hex color for badges)
   - Priority (higher = more important)
   - Permissions (select from list)
4. Click "Create Role"

### Via API

```typescript
POST /api/roles
{
  "name": "Content Editor",
  "description": "Can edit blog posts and projects",
  "color": "#00AA00",
  "permissions": [
    "blog.view",
    "blog.create",
    "blog.edit",
    "projects.view",
    "projects.edit"
  ],
  "priority": 200,
  "isSystem": false,
  "isDefault": false
}
```

## Editing Roles

### System Roles
- Can edit: name, description, color
- Cannot edit: permissions, priority
- Cannot delete

### Custom Roles
- Can edit: everything
- Can delete (if no users have the role)

## Permission List

All available permissions:

**User Management:**
- `users.view` - View users
- `users.create` - Create users
- `users.edit` - Edit users
- `users.delete` - Delete users
- `users.manage_roles` - Manage roles
- `users.manage_permissions` - Manage permissions

**App Builder:**
- `app_builder.view` - View app builder
- `app_builder.create` - Create projects
- `app_builder.edit` - Edit projects
- `app_builder.delete` - Delete projects
- `app_builder.manage` - Full app builder management

**Blog:**
- `blog.view` - View blog posts
- `blog.create` - Create posts
- `blog.edit` - Edit posts
- `blog.delete` - Delete posts
- `blog.publish` - Publish posts

**Projects:**
- `projects.view` - View projects
- `projects.create` - Create projects
- `projects.edit` - Edit projects
- `projects.delete` - Delete projects

**Mentorship:**
- `mentorship.view` - View mentorship
- `mentorship.create` - Create appointments
- `mentorship.edit` - Edit appointments
- `mentorship.delete` - Delete appointments
- `mentorship.manage_mentors` - Manage mentors

**Subscriptions:**
- `subscriptions.view` - View subscriptions
- `subscriptions.create` - Create subscriptions
- `subscriptions.edit` - Edit subscriptions
- `subscriptions.delete` - Delete subscriptions

**Credits:**
- `credits.view` - View credits
- `credits.manage` - Manage credits

**Admin:**
- `admin.access` - Access admin panel
- `admin.settings` - Manage settings
- `admin.database` - Database access

**Moderation:**
- `moderator.access` - Moderator access
- `content.moderate` - Moderate content

## Role Hierarchy

Roles are ordered by priority:
- **1000** - Administrator (highest)
- **500** - Moderator
- **300** - Mentor
- **100** - Member (default)
- **0** - Guest (lowest)

Users with higher priority roles can manage users with lower priority roles.

## Best Practices

1. **Always run migration after seeding roles:**
   ```bash
   npm run seed-roles
   npm run migrate-roles
   ```

2. **Verify admin roles after migration:**
   - Use "Ensure Admin Roles" button in UI
   - Or check manually in user management

3. **Create custom roles for specific needs:**
   - Don't modify system roles
   - Create new roles with appropriate permissions

4. **Test permissions:**
   - Use permission service to check access
   - Verify role hierarchy works correctly

## Troubleshooting

### Admin users don't have Administrator role

**Solution:**
1. Run migration: `npm run migrate-roles`
2. Or use "Ensure Admin Roles" button in UI
3. Or manually assign Administrator role to admin users

### Cannot delete role

**Possible reasons:**
- Role is a system role (cannot delete)
- Users still have this role assigned

**Solution:**
- Remove role from all users first
- System roles cannot be deleted

### Permissions not working

**Check:**
1. User has roles assigned
2. Roles have correct permissions
3. Permission service is being used correctly
4. Legacy role mapping is correct

## Migration Checklist

- [ ] Run `npm run seed-roles`
- [ ] Run `npm run migrate-roles`
- [ ] Verify all admin users have Administrator role
- [ ] Test role editing in UI
- [ ] Create any custom roles needed
- [ ] Assign roles to users as needed
- [ ] Test permission checks in API routes

## API Usage Examples

### Check if user can manage roles

```typescript
import permissionService from '@/lib/services/permission-service';

const canManage = await permissionService.hasPermission(userId, 'users.manage_roles');
```

### Get all user permissions

```typescript
const permissions = await permissionService.getUserPermissions(userId);
```

### Check if user can manage another user

```typescript
const canManage = await permissionService.canManageUser(managerId, targetUserId);
```

## Security Notes

- All role operations require `users.manage_roles` permission
- System roles are protected from deletion
- Role hierarchy prevents lower-priority users from managing higher-priority users
- Permission checks are enforced at API level
- Legacy role field is maintained for backward compatibility


# Unified User Management & Role System

## Overview

A comprehensive user management system with Discord-like role and permission capabilities, unified user management interface, and improved app builder questionnaire with AI-powered hours estimation.

## Features Implemented

### 1. Role & Permission System

**Models:**
- `Role` model (`lib/models/Role.ts`) - Stores roles with permissions
- Permission-based access control system
- Support for multiple roles per user (Discord-like)
- Role hierarchy with priority system

**Default Roles:**
- **Administrator** (Priority: 1000) - Full system access
- **Moderator** (Priority: 500) - Content moderation and user management
- **Mentor** (Priority: 300) - Teaching and mentorship capabilities
- **Member** (Priority: 100) - Standard user (default)
- **Guest** (Priority: 0) - Limited read-only access

**Permissions:**
- `users.*` - User management permissions
- `app_builder.*` - App builder permissions
- `blog.*` - Blog management permissions
- `projects.*` - Project management permissions
- `mentorship.*` - Mentorship platform permissions
- `subscriptions.*` - Subscription management
- `credits.*` - Credit management
- `admin.*` - Admin access
- `moderator.*` - Moderator access
- `content.moderate` - Content moderation

### 2. User Model Enhancements

**New Fields:**
- `roles` - Array of role IDs (multiple roles support)
- `bio` - User biography/profile description
- `avatar` - Avatar URL
- `experienceLevel` - Beginner, Intermediate, Advanced, Expert
- `timezone` - User timezone

**Backward Compatibility:**
- Legacy `role` field maintained for compatibility
- Permission service automatically maps legacy roles to permissions

### 3. Unified User Management

**New Page:** `/MonyAdmin/users-unified`

**Features:**
- Single unified interface for all user management
- Combines functionality from both old user management pages
- Role management with visual role badges
- Experience level filtering
- Credit balance display
- Subscription information
- Full user profile editing
- Multiple role assignment
- Permission viewing

**API Endpoints:**
- `GET /api/users` - List users with filters and pagination
- `POST /api/users` - Create new user
- `PUT /api/users` - Update user (with permission checks)
- `DELETE /api/users` - Delete user (with permission checks)
- `GET /api/roles` - List all roles
- `POST /api/roles` - Create new role (admin only)

### 4. Permission Service

**Location:** `lib/services/permission-service.ts`

**Methods:**
- `getUserPermissions(userId)` - Get all permissions for a user
- `hasPermission(userId, permission)` - Check single permission
- `hasAnyPermission(userId, permissions[])` - Check any permission
- `hasAllPermissions(userId, permissions[])` - Check all permissions
- `canManageUser(managerId, targetUserId)` - Check if user can manage another
- `getUserRoles(userId)` - Get user's roles

**Features:**
- Combines permissions from all user roles
- Legacy role support (maps old roles to permissions)
- Role hierarchy checking (higher priority can manage lower)

### 5. Improved App Builder Questionnaire

**New Flow:**
1. **Experience Level First** - Users select their experience level upfront
2. **Hands-On/Hands-Off Selection** - For beginner/intermediate users
3. **Project Details** - App type, description, features
4. **Advanced Options** - Budget, timeline, complexity, tech stack
5. **AI Hours Estimation** - For advanced/expert users

**Features:**
- Experience-based flow customization
- Hands-on (mentored) vs Hands-off (independent) selection
- LLM-powered hours estimation for advanced projects
- Detailed breakdown by phase (planning, design, development, testing, deployment)
- Confidence levels and recommendations

**API Endpoint:**
- `POST /api/app-builder/estimate-hours` - AI-powered hours estimation

**LLM Integration:**
- Uses configured LLM provider (Ollama, OpenAI, Anthropic, etc.)
- Analyzes project requirements comprehensively
- Provides phase-by-phase breakdown
- Includes buffer for unexpected issues
- Returns confidence level and recommendations

## Setup Instructions

### 1. Seed Default Roles

```bash
npm run seed-roles
```

This creates the default roles (Administrator, Moderator, Mentor, Member, Guest) with appropriate permissions.

### 2. Access Unified User Management

Navigate to `/MonyAdmin/users-unified` in your admin dashboard.

### 3. Assign Roles to Users

1. Go to Unified User Management
2. Click "Edit" on any user
3. Select roles from the multi-select dropdown
4. Save changes

### 4. Create Custom Roles

Use the Roles API or create directly in MongoDB:

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
  "priority": 200
}
```

## Usage Examples

### Check Permissions in API Routes

```typescript
import permissionService from '@/lib/services/permission-service';

// Check if user can edit users
const canEdit = await permissionService.hasPermission(userId, 'users.edit');

// Check if user can manage another user
const canManage = await permissionService.canManageUser(managerId, targetUserId);
```

### Get User Permissions

```typescript
const permissions = await permissionService.getUserPermissions(userId);
// Returns: ['users.view', 'users.edit', 'blog.create', ...]
```

### Assign Roles to User

```typescript
PUT /api/users
{
  "id": "userId",
  "roles": ["roleId1", "roleId2"]
}
```

## Migration Notes

### Existing Users

- Existing users will continue to work with legacy `role` field
- Permission service automatically maps legacy roles to permissions
- You can gradually migrate users to the new role system

### Backward Compatibility

- All existing API routes continue to work
- Legacy role checks still function
- New permission checks can be added incrementally

## Future Enhancements

- Role templates for common use cases
- Permission inheritance between roles
- Time-based role assignments
- Role-based UI customization
- Audit logging for role changes
- Bulk role assignment
- Role approval workflow

## Security Considerations

- Permission checks are enforced at the API level
- Role hierarchy prevents lower-priority users from managing higher-priority users
- System roles cannot be deleted
- All role changes are logged (can be extended)


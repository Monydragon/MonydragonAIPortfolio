"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedCard } from "@/components/ui/AnimatedCard";

interface User {
  _id: string;
  email: string;
  username?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  name: string;
  roles?: Array<{
    _id: string;
    name: string;
    description?: string;
    color?: string;
  }>;
  phone?: string;
  location?: string;
  emailVerified?: string | null;
  experienceLevel?: "beginner" | "intermediate" | "advanced" | "expert";
  timezone?: string;
  bio?: string;
  avatar?: string;
  creditBalance?: number;
  subscription?: {
    tier: string;
    status: string;
    creditsPerMonth: number;
  };
  permissions?: string[];
  createdAt: string;
}

interface Role {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  permissions: string[];
  priority: number;
  isSystem?: boolean;
  isDefault?: boolean;
}

export default function UnifiedUserManagementPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("");
  const [experienceFilter, setExperienceFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [emailUser, setEmailUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    username: "",
    phone: "",
    location: "",
    demographics: "",
    experienceLevel: "",
    timezone: "UTC",
    bio: "",
    avatar: "",
    roleIds: [] as string[],
    emailVerified: false,
  });
  const [emailForm, setEmailForm] = useState({
    subject: "",
    html: "",
  });
  const [saving, setSaving] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    color: "#808080",
    permissions: [] as string[],
    priority: 50,
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [page, search, roleFilter, verifiedFilter, experienceFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.set("search", search.trim());
      if (roleFilter) params.set("role", roleFilter.trim());
      if (verifiedFilter) params.set("verified", verifiedFilter.trim());
      if (experienceFilter) params.set("experienceLevel", experienceFilter.trim());
      params.set("page", page.toString());
      params.set("includeRoles", "true");

      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load users");
      }
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      const data = await res.json();
      if (res.ok) {
        setRoles(data.roles || []);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setCreatingUser(false);
    setForm({
      firstName: user.firstName,
      middleName: user.middleName || "",
      lastName: user.lastName,
      email: user.email,
      password: "", // Don't pre-fill password
      username: user.username || "",
      phone: user.phone || "",
      location: user.location || "",
      demographics: (user as any).demographics || "",
      experienceLevel: user.experienceLevel || "",
      timezone: user.timezone || "UTC",
      bio: user.bio || "",
      avatar: user.avatar || "",
      roleIds: user.roles?.map((r) => r._id) || [],
      emailVerified: !!user.emailVerified,
    });
  };

  const openCreate = () => {
    setEditingUser(null);
    setCreatingUser(true);
    setForm({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: "",
      username: "",
      phone: "",
      location: "",
      demographics: "",
      experienceLevel: "",
      timezone: "UTC",
      bio: "",
      avatar: "",
      roleIds: [],
      emailVerified: false,
    });
  };

  const handleSaveUser = async (forceVerify = false) => {
    if (!editingUser && !creatingUser) return;
    
    try {
      setSaving(true);
      
      if (creatingUser) {
        // Create new user
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: form.firstName,
            middleName: form.middleName || undefined,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            username: form.username || undefined,
            phone: form.phone || undefined,
            location: form.location || undefined,
            demographics: form.demographics || undefined,
            experienceLevel: form.experienceLevel || undefined,
            timezone: form.timezone || "UTC",
            bio: form.bio || undefined,
            avatar: form.avatar || undefined,
            roles: form.roleIds,
            emailVerified: form.emailVerified,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create user");
        }
        setCreatingUser(false);
        await fetchUsers();
      } else if (editingUser) {
        // Update existing user
        const updateData: any = {
          id: editingUser._id,
          firstName: form.firstName,
          middleName: form.middleName || undefined,
          lastName: form.lastName,
          email: form.email,
          username: form.username || undefined,
          phone: form.phone || undefined,
          location: form.location || undefined,
          demographics: form.demographics || undefined,
          experienceLevel: form.experienceLevel || undefined,
          timezone: form.timezone || "UTC",
          bio: form.bio || undefined,
          avatar: form.avatar || undefined,
          roles: form.roleIds,
        };

        // Only include password if it's been changed
        if (form.password && form.password.length > 0) {
          updateData.password = form.password;
        }

        // Handle email verification
        if (forceVerify || form.emailVerified) {
          updateData.forceVerify = true;
        }

        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update user");
        }
        setEditingUser(null);
        await fetchUsers();
      }
    } catch (err: any) {
      alert(err?.message || (creatingUser ? "Failed to create user" : "Failed to update user"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Delete user ${user.email}? This cannot be undone.`)) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/users?id=${user._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
      }
      await fetchUsers();
    } catch (err: any) {
      alert(err?.message || "Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  const openEmail = (user: User) => {
    setEmailUser(user);
    setEmailForm({
      subject: `Message from Monydragon Admin`,
      html: `<p>Hi ${user.firstName || user.name},</p><p>...</p>`,
    });
  };

  const handleSendEmail = async () => {
    if (!emailUser) return;
    try {
      setEmailSending(true);
      const res = await fetch("/api/admin/users/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: emailUser._id,
          subject: emailForm.subject,
          html: emailForm.html,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send email");
      }
      setEmailUser(null);
    } catch (err: any) {
      alert(err?.message || "Failed to send email");
    } finally {
      setEmailSending(false);
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const allPermissions = [
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.manage_roles',
    'users.manage_permissions',
    'app_builder.view',
    'app_builder.create',
    'app_builder.edit',
    'app_builder.delete',
    'app_builder.manage',
    'blog.view',
    'blog.create',
    'blog.edit',
    'blog.delete',
    'blog.publish',
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.delete',
    'mentorship.view',
    'mentorship.create',
    'mentorship.edit',
    'mentorship.delete',
    'mentorship.manage_mentors',
    'subscriptions.view',
    'subscriptions.create',
    'subscriptions.edit',
    'subscriptions.delete',
    'credits.view',
    'credits.manage',
    'admin.access',
    'admin.settings',
    'admin.database',
    'moderator.access',
    'content.moderate',
  ];

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || "",
      color: role.color || "#808080",
      permissions: role.permissions || [],
      priority: role.priority || 50,
    });
  };

  const handleSaveRole = async () => {
    if (!editingRole) return;
    try {
      setSaving(true);
      const url = editingRole._id
        ? `/api/roles/${editingRole._id}`
        : '/api/roles';
      const method = editingRole._id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save role');
      }
      setEditingRole(null);
      await fetchRoles();
    } catch (err: any) {
      alert(err?.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This cannot be undone.')) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/roles/${roleId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete role');
      }
      await fetchRoles();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete role');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permission: string) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Unified User Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage all users, roles, permissions, credits, and subscriptions in one place.
              </p>
            </div>
            <AnimatedButton variant="secondary" onClick={() => router.push("/MonyAdmin")}>
              Back to Dashboard
            </AnimatedButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "users"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "roles"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Roles ({roles.length})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
            <AnimatedCard>
              <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
                <div className="flex-1 space-y-2">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Search
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                    placeholder="Search by email, username, name, phone, location..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Role
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setPage(1);
                      }}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                    >
                      <option value="">All</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="guest">Guest</option>
                      <option value="mentor">Mentor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Verified
                    </label>
                    <select
                      value={verifiedFilter}
                      onChange={(e) => {
                        setVerifiedFilter(e.target.value);
                        setPage(1);
                      }}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                    >
                      <option value="">All</option>
                      <option value="true">Verified</option>
                      <option value="false">Not verified</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Experience
                    </label>
                    <select
                      value={experienceFilter}
                      onChange={(e) => {
                        setExperienceFilter(e.target.value);
                        setPage(1);
                      }}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                    >
                      <option value="">All</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <AnimatedButton variant="secondary" onClick={() => fetchUsers()}>
                      Apply
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Users</h2>
                <AnimatedButton
                  variant="primary"
                  onClick={openCreate}
                >
                  + Create User
                </AnimatedButton>
              </div>
                <div className="flex items-center gap-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {loading ? "Loading..." : `Page ${page} of ${totalPages}`}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>

              {error && (
                <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <th className="py-2 pr-4">User</th>
                      <th className="py-2 pr-4">Roles</th>
                      <th className="py-2 pr-4">Experience</th>
                      <th className="py-2 pr-4">Credits</th>
                      <th className="py-2 pr-4">Subscription</th>
                      <th className="py-2 pr-4">Verified</th>
                      <th className="py-2 pr-4">Created</th>
                      <th className="py-2 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-gray-500 dark:text-gray-400">
                          Loading users...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-gray-500 dark:text-gray-400">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user._id}
                          className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/40 dark:hover:bg-gray-900/40"
                        >
                          <td className="py-2 pr-4">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {user.name || `${user.firstName} ${user.lastName}`}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                            {user.username && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                @{user.username}
                              </div>
                            )}
                          </td>
                          <td className="py-2 pr-4">
                            <div className="flex flex-wrap gap-1">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200`}
                              >
                                {user.role}
                              </span>
                              {user.roles?.map((role) => (
                                <span
                                  key={role._id}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: role.color
                                      ? `${role.color}20`
                                      : undefined,
                                    color: role.color || undefined,
                                  }}
                                >
                                  {role.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2 pr-4">
                            {user.experienceLevel ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 capitalize">
                                {user.experienceLevel}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-2 pr-4">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {user.creditBalance || 0}
                            </span>
                          </td>
                          <td className="py-2 pr-4">
                            {user.subscription ? (
                              <div className="text-xs">
                                <div className="font-medium capitalize">{user.subscription.tier}</div>
                                <div className="text-gray-500 dark:text-gray-400 capitalize">
                                  {user.subscription.status}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">None</span>
                            )}
                          </td>
                          <td className="py-2 pr-4">
                            {user.emailVerified ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200">
                                No
                              </span>
                            )}
                          </td>
                          <td className="py-2 pr-4 text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="py-2 pr-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEdit(user)}
                                className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                              >
                                Edit
                              </button>
                              {!user.emailVerified && (
                                <button
                                  onClick={() => {
                                    setEditingUser(user);
                                    handleSaveUser(true);
                                  }}
                                  className="text-xs px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800"
                                >
                                  Verify
                                </button>
                              )}
                              <button
                                onClick={() => openEmail(user)}
                                className="text-xs px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                              >
                                Email
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </AnimatedCard>
          </>
        )}

        {/* Roles Tab */}
        {activeTab === "roles" && (
          <>
            <AnimatedCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Roles & Permissions</h2>
                <div className="flex gap-2">
                  <AnimatedButton
                    variant="primary"
                    onClick={() => {
                      setEditingRole({
                        _id: '',
                        name: "",
                        description: "",
                        color: "#808080",
                        permissions: [],
                        priority: 50,
                        isSystem: false,
                        isDefault: false,
                      });
                    }}
                  >
                    + Create Role
                  </AnimatedButton>
                </div>
              </div>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div
                    key={role._id}
                    className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/40"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{role.name}</h3>
                          {role.color && (
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: role.color }}
                            />
                          )}
                          {role.isSystem && (
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded">
                              System
                            </span>
                          )}
                          {role.isDefault && (
                            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {role.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {role.permissions.slice(0, 10).map((perm) => (
                            <span
                              key={perm}
                              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded"
                            >
                              {perm}
                            </span>
                          ))}
                          {role.permissions.length > 10 && (
                            <span className="text-xs px-2 py-1 text-gray-500">
                              +{role.permissions.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right text-sm text-gray-500">
                          Priority: {role.priority}
                        </div>
                        <button
                          onClick={() => openEditRole(role)}
                          className="text-xs px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                        >
                          Edit
                        </button>
                        {!role.isSystem && (
                          <button
                            onClick={() => handleDeleteRole(role._id)}
                            className="text-xs px-3 py-1 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </>
        )}

        {/* Create/Edit user modal */}
        {(editingUser || creatingUser) && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {creatingUser ? "Create New User" : "Edit User"}
                </h2>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setCreatingUser(false);
                  }}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={form.middleName}
                    onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    disabled={!creatingUser}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Password {creatingUser && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={creatingUser}
                    placeholder={creatingUser ? "Minimum 6 characters" : "Leave blank to keep current"}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                  {!creatingUser && (
                    <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated from email if not provided</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="City, Country"
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Demographics</label>
                  <input
                    type="text"
                    value={form.demographics}
                    onChange={(e) => setForm({ ...form, demographics: e.target.value })}
                    placeholder="Optional demographic information"
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Experience Level</label>
                  <select
                    value={form.experienceLevel}
                    onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  >
                    <option value="">None</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Timezone</label>
                  <input
                    type="text"
                    value={form.timezone}
                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                    placeholder="UTC"
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">e.g., America/New_York, Europe/London</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Avatar URL</label>
                  <input
                    type="url"
                    value={form.avatar}
                    onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    placeholder="User biography or profile description..."
                    maxLength={2000}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">{form.bio.length}/2000 characters</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Roles</label>
                  <select
                    multiple
                    value={form.roleIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                      setForm({ ...form, roleIds: selected });
                    }}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                    size={4}
                  >
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple. Default role assigned if none selected.</p>
                </div>
                {creatingUser && (
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.emailVerified}
                        onChange={(e) => setForm({ ...form, emailVerified: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-700"
                      />
                      <span className="text-xs font-semibold">Mark email as verified</span>
                    </label>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <AnimatedButton
                  variant="secondary"
                  onClick={() => {
                    setEditingUser(null);
                    setCreatingUser(false);
                  }}
                  disabled={saving}
                >
                  Cancel
                </AnimatedButton>
                {!creatingUser && !editingUser?.emailVerified && (
                  <AnimatedButton
                    variant="secondary"
                    onClick={() => handleSaveUser(true)}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save & Verify Email"}
                  </AnimatedButton>
                )}
                <AnimatedButton
                  variant="primary"
                  onClick={() => handleSaveUser()}
                  disabled={saving || !form.firstName || !form.lastName || !form.email || (creatingUser && !form.password)}
                >
                  {saving
                    ? "Saving..."
                    : creatingUser
                    ? "Create User"
                    : "Save Changes"}
                </AnimatedButton>
              </div>
            </div>
          </div>
        )}

        {/* Email user modal */}
        {emailUser && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Email {emailUser.email}</h2>
                <button
                  onClick={() => setEmailUser(null)}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">HTML Content</label>
                  <textarea
                    rows={6}
                    value={emailForm.html}
                    onChange={(e) => setEmailForm({ ...emailForm, html: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <AnimatedButton
                  variant="secondary"
                  onClick={() => setEmailUser(null)}
                  disabled={emailSending}
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  onClick={handleSendEmail}
                  disabled={emailSending}
                >
                  {emailSending ? "Sending..." : "Send Email"}
                </AnimatedButton>
              </div>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        {editingRole && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-3xl w-full border border-gray-200 dark:border-gray-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingRole._id ? 'Edit Role' : 'Create Role'}
                </h2>
                <button
                  onClick={() => setEditingRole(null)}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Role Name *</label>
                  <input
                    type="text"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    disabled={editingRole.isSystem}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Description</label>
                  <textarea
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={roleForm.color}
                        onChange={(e) => setRoleForm({ ...roleForm, color: e.target.value })}
                        className="w-16 h-10 rounded border border-gray-200 dark:border-gray-800"
                      />
                      <input
                        type="text"
                        value={roleForm.color}
                        onChange={(e) => setRoleForm({ ...roleForm, color: e.target.value })}
                        className="flex-1 px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Priority</label>
                    <input
                      type="number"
                      value={roleForm.priority}
                      onChange={(e) => setRoleForm({ ...roleForm, priority: parseInt(e.target.value) || 0 })}
                      disabled={editingRole.isSystem}
                      className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Higher = more important</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2">Permissions</label>
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {allPermissions.map((perm) => {
                        const category = perm.split('.')[0];
                        const isChecked = roleForm.permissions.includes(perm);
                        return (
                          <label
                            key={perm}
                            className={`flex items-center p-2 rounded cursor-pointer ${
                              isChecked
                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm)}
                              disabled={editingRole.isSystem}
                              className="mr-2 disabled:opacity-50"
                            />
                            <span className="text-sm">
                              <span className="font-semibold text-gray-600 dark:text-gray-400">
                                {category}:
                              </span>{' '}
                              <span>{perm.split('.').slice(1).join('.')}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => {
                        setRoleForm({ ...roleForm, permissions: allPermissions });
                      }}
                      disabled={editingRole.isSystem}
                      className="text-xs px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => {
                        setRoleForm({ ...roleForm, permissions: [] });
                      }}
                      disabled={editingRole.isSystem}
                      className="text-xs px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      Clear All
                    </button>
                  </div>
                  {editingRole.isSystem && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      ⚠️ System roles cannot have their permissions or priority modified. Only name, description, and color can be changed.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <AnimatedButton
                  variant="secondary"
                  onClick={() => setEditingRole(null)}
                  disabled={saving}
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  onClick={handleSaveRole}
                  disabled={saving || !roleForm.name}
                >
                  {saving ? 'Saving...' : editingRole._id ? 'Save Changes' : 'Create Role'}
                </AnimatedButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


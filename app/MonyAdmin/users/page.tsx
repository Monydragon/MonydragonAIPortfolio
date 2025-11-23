"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AnimatedCard } from "@/components/ui/AnimatedCard";

interface AdminUser {
  _id: string;
  email: string;
  username?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  name: string;
  role: "admin" | "user" | "guest";
  phone?: string;
  location?: string;
  emailVerified?: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [emailUser, setEmailUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    location: "",
  });
  const [emailForm, setEmailForm] = useState({
    subject: "",
    html: "",
  });
  const [saving, setSaving] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (opts?: { search?: string; role?: string; verified?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (opts?.search ?? search) params.set("search", (opts?.search ?? search).trim());
      if (opts?.role ?? roleFilter) params.set("role", (opts?.role ?? roleFilter).trim());
      if (opts?.verified ?? verifiedFilter) params.set("verified", (opts?.verified ?? verifiedFilter).trim());

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load users");
      }
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setForm({
      firstName: user.firstName,
      middleName: user.middleName || "",
      lastName: user.lastName,
      email: user.email,
      username: user.username || "",
      phone: user.phone || "",
      location: user.location || "",
    });
  };

  const handleSaveUser = async (forceVerify = false) => {
    if (!editingUser) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser._id,
          firstName: form.firstName,
          middleName: form.middleName || undefined,
          lastName: form.lastName,
          email: form.email,
          username: form.username || undefined,
          phone: form.phone || undefined,
          location: form.location || undefined,
          forceVerify,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user");
      }
      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      alert(err?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`Delete user ${user.email}? This cannot be undone.`)) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/users?id=${user._id}`, { method: "DELETE" });
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

  const openEmail = (user: AdminUser) => {
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

	return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Manage Users
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Search, filter, and manage user accounts.
              </p>
            </div>
            <AnimatedButton variant="secondary" onClick={() => router.push("/MonyAdmin")}>
              Back to Dashboard
            </AnimatedButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
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
                onKeyDown={(e) => e.key === "Enter" && fetchUsers({ search: e.currentTarget.value })}
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
                    fetchUsers({ role: e.target.value });
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                >
                  <option value="">All</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="guest">Guest</option>
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
                    fetchUsers({ verified: e.target.value });
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                >
                  <option value="">All</option>
                  <option value="true">Verified</option>
                  <option value="false">Not verified</option>
                </select>
              </div>
              <div className="flex items-end">
                <AnimatedButton
                  variant="secondary"
                  onClick={() => fetchUsers({ search, role: roleFilter, verified: verifiedFilter })}
                >
                  Apply
                </AnimatedButton>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Users</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {loading ? "Loading..." : `${users.length} users loaded`}
            </p>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Username</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Verified</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500 dark:text-gray-400">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500 dark:text-gray-400">
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
                          {user.firstName} {user.middleName} {user.lastName}
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-gray-800 dark:text-gray-200">
                        {user.email}
                      </td>
                      <td className="py-2 pr-4 text-gray-800 dark:text-gray-200">
                        {user.username || "—"}
                      </td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                          {user.role}
                        </span>
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
                              Force Verify
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

        {/* Edit user modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Edit User</h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">First Name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
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
                  <label className="block text-xs font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <AnimatedButton
                  variant="secondary"
                  onClick={() => setEditingUser(null)}
                  disabled={saving}
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  onClick={() => handleSaveUser()}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
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
      </main>
		</div>
	);
}


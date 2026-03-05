// src/components/developer/DeveloperPanel.jsx
// NEW FILE: Developer-only admin management panel

import React, { useState, useEffect, useCallback } from "react";
import { developerApi } from "../../services/api";
import { PageHeader } from "../ui/index.jsx";
import Icon from "../ui/Icon";

const inputStyle = (focused) => ({
  width: "100%",
  background: focused ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.04)",
  border: `1px solid ${focused ? "#6366f1" : "rgba(255,255,255,0.1)"}`,
  borderRadius: 10,
  padding: "10px 14px",
  color: "#e2e8f0",
  fontSize: 14,
  outline: "none",
  transition: "all 0.2s ease",
  boxSizing: "border-box",
});

function Field({ label, value, onChange, type = "text", placeholder = "" }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: "#64748b", fontWeight: 600,
        marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={inputStyle(focused)}
        autoComplete={type === "password" ? "new-password" : "off"}
      />
    </div>
  );
}

const EMPTY_FORM = { username: "", password: "", displayName: "", department: "" };

export default function DeveloperPanel({ notify }) {
  const [admins,      setAdmins]      = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null); // admin object being edited
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);

  const LIMIT = 10;

  const loadAdmins = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const data = await developerApi.listAdmins(p);
      setAdmins(data.admins || []);
      setTotal(data.total || 0);
      setPage(p);
    } catch (err) {
      notify("Failed to load admins: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadAdmins(1); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (admin) => {
    setEditTarget(admin);
    setForm({ username: admin.username, password: "", displayName: admin.display_name || "", department: admin.department || "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.username.trim()) return notify("Username is required", "error");
    if (!editTarget && form.password.length < 6) return notify("Password must be at least 6 characters", "error");

    setSaving(true);
    try {
      if (editTarget) {
        await developerApi.updateAdmin(editTarget.admin_id, {
          username:    form.username,
          ...(form.password ? { password: form.password } : {}),
          displayName: form.displayName,
          department:  form.department,
        });
        notify("Admin updated successfully!");
      } else {
        await developerApi.createAdmin({
          username:    form.username,
          password:    form.password,
          displayName: form.displayName,
          department:  form.department,
        });
        notify("Admin created successfully!");
      }
      setShowForm(false);
      loadAdmins(1);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await developerApi.deleteAdmin(id);
      notify("Admin deleted.");
      setDeleteId(null);
      loadAdmins(page);
    } catch (err) {
      notify(err.message, "error");
      setDeleteId(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ animation: "fadeUp 0.5s ease" }}>
      <PageHeader title="Developer Panel" subtitle={`${total} admin account${total !== 1 ? "s" : ""} registered`}>
        <button
          onClick={openCreate}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
            background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none",
            borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          <Icon name="add" size={16} color="#fff"/> New Admin
        </button>
      </PageHeader>

      {/* ── Inline form ── */}
      {showForm && (
        <div style={{ background: "#151825", border: "1px solid #f59e0b44", borderRadius: 16,
          padding: "28px 28px", marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: "#fbbf24", marginBottom: 20 }}>
            {editTarget ? `Edit Admin — ${editTarget.username}` : "Create New Admin"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Username *" value={form.username} onChange={v => setForm(p => ({ ...p, username: v }))} placeholder="e.g. admin_cs" />
            <Field label={editTarget ? "New Password (leave blank to keep)" : "Password *"} type="password" value={form.password} onChange={v => setForm(p => ({ ...p, password: v }))} placeholder="Min 6 characters" />
            <Field label="Display Name" value={form.displayName} onChange={v => setForm(p => ({ ...p, displayName: v }))} placeholder="e.g. Dr. Ramesh Kumar" />
            <Field label="Department" value={form.department} onChange={v => setForm(p => ({ ...p, department: v }))} placeholder="e.g. Computer Science" />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              background: saving ? "#374151" : "linear-gradient(135deg,#f59e0b,#d97706)",
              color: "#fff", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving…" : editTarget ? "Update Admin" : "Create Admin"}
            </button>
            <button onClick={() => setShowForm(false)} style={{
              padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent", color: "#94a3b8", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Admin list ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>Loading admins…</div>
      ) : admins.length === 0 ? (
        <div style={{ background: "#151825", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16, padding: "60px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>👤</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>No Admins Yet</h3>
          <p style={{ color: "#64748b", fontSize: 13 }}>Create your first admin account to get started.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gap: 12 }}>
            {admins.map(admin => (
              <AdminRow
                key={admin.admin_id}
                admin={admin}
                onEdit={() => openEdit(admin)}
                onDelete={() => setDeleteId(admin.admin_id)}
                deleting={deleteId === admin.admin_id}
                onConfirmDelete={() => handleDelete(admin.admin_id)}
                onCancelDelete={() => setDeleteId(null)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => loadAdmins(p)} style={{
                  width: 36, height: 36, borderRadius: 8, border: "none", cursor: "pointer",
                  background: p === page ? "#f59e0b" : "rgba(255,255,255,0.06)",
                  color: p === page ? "#fff" : "#64748b", fontWeight: 600, fontSize: 14 }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdminRow({ admin, onEdit, onDelete, deleting, onConfirmDelete, onCancelDelete }) {
  const initials = (admin.display_name || admin.username).slice(0, 2).toUpperCase();
  const createdDate = admin.created_at
    ? new Date(admin.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div style={{ background: "#151825", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }}>
      {/* Avatar */}
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: 15, color: "#fff", flexShrink: 0 }}>
        {initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#f8fafc" }}>
            {admin.display_name || admin.username}
          </span>
          <span style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc",
            padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
            @{admin.username}
          </span>
        </div>
        <div style={{ display: "flex", gap: 16, color: "#64748b", fontSize: 12 }}>
          {admin.department && <span>🏢 {admin.department}</span>}
          <span>📅 Created {createdDate}</span>
        </div>
      </div>

      {/* Actions */}
      {deleting ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#fca5a5", fontSize: 13, fontWeight: 500 }}>Delete admin?</span>
          <button onClick={onConfirmDelete} style={{ padding: "7px 14px", borderRadius: 8, border: "none",
            background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Yes, delete
          </button>
          <button onClick={onCancelDelete} style={{ padding: "7px 14px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
            color: "#94a3b8", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onEdit} style={{ padding: "8px 16px", borderRadius: 9,
            border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)",
            color: "#a5b4fc", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Edit
          </button>
          <button onClick={onDelete} style={{ padding: "8px 16px", borderRadius: 9,
            border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)",
            color: "#f87171", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

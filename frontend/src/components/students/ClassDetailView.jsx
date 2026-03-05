import React from "react";
import Icon from "../ui/Icon";
import EditStudentModal from "./EditStudentModal";
import { inputStyle } from "../../constants/styles";
import { BRANCH_COLORS } from "../../constants/index";

export default function ClassDetailView({
  group, allStudents, setStudents, notify, role,
  editStudent, setEditStudent, onBack, search, setSearch,
}) {
  const color = BRANCH_COLORS[group.branch] || "#64748b";
  const yearLabels = ["","1st","2nd","3rd","4th"];
  const degreeLabel = group.year <= 4 ? "B.Tech" : "M.Tech";
  const displayName = `${degreeLabel} ${group.branch} ${yearLabels[group.year] || group.year+"th"} Year`;

  const classStudents = allStudents.filter(s => s.branch === group.branch && s.year === group.year);
  const filtered = classStudents.filter(s =>
    search === "" ||
    s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Delete single student — local state only ─────────────────
  const handleDelete = (id) => {
    if (role !== "admin") return;
    setStudents(prev => prev.filter(s => s.id !== id));
    notify("Student removed.", "info");
  };

  // ── Save edited student — local state only ───────────────────
  const handleSaveEdit = (updated) => {
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    setEditStudent(null);
    notify("Student updated!");
  };

  // ── Delete whole class — local state only ────────────────────
  const handleDeleteClass = () => {
    if (role !== "admin") return;
    if (!window.confirm(`Delete ALL ${classStudents.length} students in ${displayName}? This cannot be undone.`)) return;
    setStudents(prev => prev.filter(s => !(s.branch === group.branch && s.year === group.year)));
    notify(`${displayName} deleted.`, "info");
    onBack();
  };

  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6,
          background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:10, padding:"8px 14px", color:"#94a3b8", cursor:"pointer", fontSize:13, fontWeight:500 }}>
          ← All Classes
        </button>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:2 }}>
            <div style={{ width:6, height:24, borderRadius:3, background:color }}/>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800,
              background:`linear-gradient(135deg,#f8fafc,${color})`,
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              {displayName}
            </h1>
          </div>
          <p style={{ color:"#475569", fontSize:13, paddingLeft:16 }}>{classStudents.length} students registered</p>
        </div>

        {role === "admin" && (
          <button onClick={handleDeleteClass} style={{
            display:"flex", alignItems:"center", gap:8, padding:"9px 18px",
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
            borderRadius:10, color:"#f87171", fontWeight:600, fontSize:13, cursor:"pointer" }}>
            <Icon name="delete" size={14} color="#f87171"/> Delete Class
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:24 }}>
        {[
          { label:"Total Students", value:classStudents.length, color },
          { label:"Branch",         value:group.branch,         color:"#94a3b8" },
          { label:"Year",           value:`${yearLabels[group.year] || group.year+"th"} Year`, color:"#94a3b8" },
          { label:"Degree",         value:degreeLabel,          color:"#94a3b8" },
        ].map(s => (
          <div key={s.label} style={{ background:"#151825", border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:12, padding:"14px 18px" }}>
            <div style={{ color:"#64748b", fontSize:11, fontWeight:600, textTransform:"uppercase", marginBottom:6 }}>{s.label}</div>
            <div style={{ color:s.color, fontSize:20, fontWeight:800 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position:"relative", marginBottom:18 }}>
        <Icon name="search" size={16} color="#475569" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}/>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by roll number or name…"
          style={{ ...inputStyle, paddingLeft:40 }}
        />
      </div>

      {/* Student table */}
      <div style={{ background:"#151825", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1.5fr 1.5fr auto",
          padding:"12px 20px", background:"rgba(255,255,255,0.03)",
          borderBottom:"1px solid rgba(255,255,255,0.06)", gap:16 }}>
          {["Roll No", "Name", "Email", "Phone", ""].map((h, i) => (
            <span key={i} style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding:"40px", textAlign:"center", color:"#475569", fontSize:13 }}>
            No students match your search.
          </div>
        ) : (
          filtered.map((s, idx) => (
            <div key={s.id} style={{
              display:"grid", gridTemplateColumns:"1fr 2fr 1.5fr 1.5fr auto",
              padding:"12px 20px", gap:16, alignItems:"center",
              borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              transition:"background 0.15s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontFamily:"monospace", fontSize:12, color, fontWeight:600 }}>{s.rollNo}</span>
              <span style={{ fontSize:13, color:"#e2e8f0" }}>{s.name}</span>
              <span style={{ fontSize:12, color:"#64748b" }}>{s.email || "—"}</span>
              <span style={{ fontSize:12, color:"#64748b" }}>{s.phone || "—"}</span>
              {role === "admin" && (
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={() => setEditStudent(s)} style={{
                    padding:"5px 10px", borderRadius:7, border:"1px solid rgba(99,102,241,0.3)",
                    background:"rgba(99,102,241,0.1)", color:"#a5b4fc", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(s.id)} style={{
                    padding:"5px 10px", borderRadius:7, border:"1px solid rgba(239,68,68,0.3)",
                    background:"rgba(239,68,68,0.08)", color:"#f87171", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                    Del
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {editStudent && (
        <EditStudentModal
          student={editStudent}
          onSave={handleSaveEdit}
          onClose={() => setEditStudent(null)}
        />
      )}
    </div>
  );
}
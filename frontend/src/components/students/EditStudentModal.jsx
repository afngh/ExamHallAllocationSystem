import React, { useState } from "react";
import Icon from "../ui/Icon";
import { inputStyle, labelStyle, btnStyle } from "../../constants/styles";
import { BRANCHES, YEARS } from "../../constants/index";

export default function EditStudentModal({ student, onClose, onSave }) {
  const [form, setForm] = useState({ ...student });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:9998,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#151825", border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:20, padding:"28px", width:"100%", maxWidth:480, animation:"fadeUp 0.3s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <div>
            <h2 style={{ fontWeight:700, fontSize:18, color:"#f8fafc" }}>Edit Student</h2>
            <p style={{ color:"#475569", fontSize:12, marginTop:2 }}>{student.rollNo}</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#64748b", fontSize:22 }}>✕</button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={labelStyle}>Roll Number</label>
              <input value={form.rollNo} onChange={e => upd("rollNo", e.target.value)}
                style={{ ...inputStyle, background:"#0c0e1a55", color:"#64748b" }} readOnly/>
            </div>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input value={form.name} onChange={e => upd("name", e.target.value)}
                style={inputStyle} placeholder="Student name"/>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={labelStyle}>Branch</label>
              <select value={form.branch} onChange={e => upd("branch", e.target.value)} style={inputStyle}>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Year</label>
              <select value={form.year} onChange={e => upd("year", Number(e.target.value))} style={inputStyle}>
                {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input value={form.email || ""} onChange={e => upd("email", e.target.value)}
              style={inputStyle} placeholder="roll@college.edu"/>
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input value={form.phone || ""} onChange={e => upd("phone", e.target.value)}
              style={inputStyle} placeholder="9xxxxxxxxx"/>
          </div>

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button onClick={onClose} style={{ ...btnStyle("#334155"), flex:1, justifyContent:"center" }}>Cancel</button>
            <button onClick={() => onSave(form)} style={{ ...btnStyle("#6366f1"), flex:2, justifyContent:"center" }}>
              <Icon name="check" size={15} color="#fff"/> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

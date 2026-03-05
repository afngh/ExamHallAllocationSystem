import React from "react";
import { BRANCH_COLORS } from "../../constants/index";

// ─── SlotCell — one student's seat within a bench ─────────────────────────────
export function SlotCell({ student, slot, size = 26 }) {
  const color = student ? (BRANCH_COLORS[student.branch] || "#64748b") : null;
  return (
    <div
      title={student ? `${student.rollNo} — ${student.name} (${student.branch})` : "Empty"}
      style={{ width:size, height:size, borderRadius:5,
        background: student ? `${color}cc` : "#1e2235",
        border: student ? "none" : `1px dashed ${slot===0?"#334155":"#1e2235"}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:8, color: student ? "#fff" : "#374151",
        fontWeight:700, cursor: student ? "pointer" : "default",
        transition:"transform 0.1s ease", flexShrink:0 }}
      onMouseEnter={e => { if(student) e.currentTarget.style.transform="scale(1.2)"; }}
      onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
      {student ? student.branch.substring(0,2) : ""}
    </div>
  );
}

// ─── MiniHallPreview — compact bench grid shown on hall cards ─────────────────
export function MiniHallPreview({ hall }) {
  const maxCols = Math.min(hall.cols, 8);
  const maxRows = Math.min(hall.rows, 4);
  const isDouble = hall.benchType === "double";
  const missing = new Set(hall.missingBenches || []);

  return (
    <div style={{ marginTop:10 }}>
      <div style={{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>
        Layout Preview ({hall.rows}×{hall.cols}{missing.size > 0 ? `, ${missing.size} missing` : ""})
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
        {Array.from({ length:maxRows }).map((_,ri) => (
          <div key={ri} style={{ display:"flex", gap:3 }}>
            {Array.from({ length:maxCols }).map((_,ci) => {
              const isMissing = missing.has(`${ri+1}-${ci+1}`);
              return isDouble ? (
                <div key={ci} style={{ display:"flex", gap:1,
                  background: isMissing ? "rgba(239,68,68,0.08)" : "#1e2235",
                  borderRadius:4, padding:"2px 3px",
                  border:`1px solid ${isMissing?"rgba(239,68,68,0.3)":"#2d3748"}` }}>
                  {isMissing
                    ? <div style={{ width:19, height:9, borderRadius:2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"#ef4444", fontWeight:700 }}>✕</div>
                    : <><div style={{ width:9, height:9, borderRadius:2, background:"#334155" }}/><div style={{ width:9, height:9, borderRadius:2, background:"#334155" }}/></>
                  }
                </div>
              ) : (
                <div key={ci} style={{ width:12, height:12, borderRadius:3,
                  background: isMissing ? "rgba(239,68,68,0.08)" : "#1e2235",
                  border:`1px solid ${isMissing?"rgba(239,68,68,0.3)":"#2d3748"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:8, color:"#ef4444", fontWeight:700 }}>
                  {isMissing ? "✕" : ""}
                </div>
              );
            })}
            {hall.cols > maxCols && <span style={{ fontSize:9, color:"#374151", alignSelf:"center" }}>+{hall.cols-maxCols}</span>}
          </div>
        ))}
        {hall.rows > maxRows && <div style={{ fontSize:9, color:"#374151" }}>+{hall.rows-maxRows} more rows...</div>}
      </div>
    </div>
  );
}

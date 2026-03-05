import React from "react";
import { SlotCell } from "./HallPrimitives";
import { BRANCHES, BRANCH_COLORS } from "../../constants/index";

export default function HallLayoutView({ hall, allocations, onBack }) {
  const hallAllocs = allocations.filter(a => a.hallId === hall.id);
  const isDouble   = hall.benchType === "double";
  const missing    = new Set(hall.missingBenches || []);

  // Build lookup: "row-col-slot" → allocation
  const lookup = {};
  hallAllocs.forEach(a => { lookup[`${a.row}-${a.col}-${a.slot ?? 0}`] = a; });

  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6,
          background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:10, padding:"8px 14px", color:"#94a3b8", cursor:"pointer", fontSize:13 }}>
          ← Back to Halls
        </button>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:"#f8fafc" }}>{hall.name} — Room {hall.roomNo}</h2>
          <p style={{ color:"#475569", fontSize:13 }}>
            {hall.floor} · {isDouble?"Double":"Single"} Seater · {hall.rows}×{hall.cols} grid
            {missing.size > 0 && <span style={{ color:"#ef4444" }}> · {missing.size} missing bench{missing.size>1?"es":""}</span>}
            {" · "}<span style={{ color:"#10b981", fontWeight:600 }}>{hall.capacity} seats</span>
          </p>
        </div>
      </div>

      <div style={{ background:"#151825", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"24px", overflowX:"auto" }}>
        <div style={{ background:"#1a4a3a", border:"2px solid #065f46", borderRadius:8, padding:"8px 24px",
          textAlign:"center", marginBottom:20, color:"#34d399", fontSize:12, fontWeight:600,
          letterSpacing:"0.1em", maxWidth:600 }}>
          ◀ BLACKBOARD / FRONT OF HALL ▶
        </div>

        <div style={{ display:"inline-block", minWidth:"fit-content" }}>
          {Array.from({ length:hall.rows }).map((_,ri) => (
            <div key={ri} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
              <span style={{ width:24, fontSize:11, color:"#475569", textAlign:"right", flexShrink:0, fontWeight:600 }}>R{ri+1}</span>
              <div style={{ display:"flex", gap:8 }}>
                {Array.from({ length:hall.cols }).map((_,ci) => {
                  const row = ri+1, col = ci+1;
                  const benchNum = ri * hall.cols + col;
                  const isMissing = missing.has(`${row}-${col}`);

                  if (isMissing) {
                    return (
                      <div key={ci} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                        <span style={{ fontSize:8, color:"#374151", textDecoration:"line-through" }}>B{benchNum}</span>
                        <div style={{ background:"rgba(239,68,68,0.06)", border:"1px dashed rgba(239,68,68,0.25)",
                          borderRadius:8, padding:isDouble?"5px 6px":"0",
                          width:isDouble?"auto":36, height:isDouble?"auto":36,
                          display:"flex", alignItems:"center", justifyContent:"center", gap:2, position:"relative" }}>
                          {isDouble && (
                            <><div style={{ width:22, height:22, borderRadius:4 }}/><div style={{ width:22, height:22, borderRadius:4 }}/></>
                          )}
                          <span style={{ position:"absolute", fontSize:14, color:"rgba(239,68,68,0.4)", fontWeight:700, pointerEvents:"none" }}>✕</span>
                        </div>
                      </div>
                    );
                  }

                  if (isDouble) {
                    const s0 = lookup[`${row}-${col}-0`];
                    const s1 = lookup[`${row}-${col}-1`];
                    return (
                      <div key={ci} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                        <span style={{ fontSize:8, color:"#374151" }}>B{benchNum}</span>
                        <div style={{ display:"flex", gap:2, background:"#0c0e1a", borderRadius:8, padding:"5px 6px", border:"1px solid #2d3748" }}>
                          <SlotCell student={s0} slot={0} />
                          <div style={{ width:1, background:"#2d3748", alignSelf:"stretch" }}/>
                          <SlotCell student={s1} slot={1} />
                        </div>
                        <div style={{ width:50, height:5, background:"#1a1d2e", borderRadius:2 }}/>
                      </div>
                    );
                  } else {
                    const s = lookup[`${row}-${col}-0`];
                    return (
                      <div key={ci} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                        <span style={{ fontSize:8, color:"#374151" }}>B{benchNum}</span>
                        <SlotCell student={s} slot={0} size={36} />
                        <div style={{ width:30, height:5, background:"#1a1d2e", borderRadius:2 }}/>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ marginTop:16, display:"flex", flexWrap:"wrap", gap:10, paddingTop:14,
          borderTop:"1px solid rgba(255,255,255,0.06)", alignItems:"center" }}>
          {BRANCHES.map(b => (
            <div key={b} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11 }}>
              <span style={{ width:14, height:14, borderRadius:3, background:`${BRANCH_COLORS[b]}cc`, display:"inline-block" }}/>
              <span style={{ color:"#64748b" }}>{b}</span>
            </div>
          ))}
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11 }}>
            <span style={{ width:14, height:14, borderRadius:3, background:"#1e2235", border:"1px solid #2d3748", display:"inline-block" }}/>
            <span style={{ color:"#64748b" }}>Empty</span>
          </div>
          {missing.size > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11 }}>
              <span style={{ width:14, height:14, borderRadius:3, background:"rgba(239,68,68,0.08)", border:"1px dashed rgba(239,68,68,0.3)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#ef4444", fontSize:8, fontWeight:700 }}>✕</span>
              <span style={{ color:"#ef4444" }}>Missing bench</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

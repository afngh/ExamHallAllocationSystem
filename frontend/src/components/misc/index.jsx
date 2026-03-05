import React from "react";
import { PageHeader } from "../ui/index.jsx";
import { BRANCH_COLORS } from "../../constants/index";
import Icon from "../ui/Icon";

// ─── AlgorithmPage ────────────────────────────────────────────────────────────
export function AlgorithmPage() {
  return (
    <div style={{ animation:"fadeUp 0.5s ease" }}>
      <PageHeader title="Algorithm Design" subtitle="Time & Space Complexity Analysis"/>
      <div style={{ background:"#151825", border:"1px solid rgba(255,255,255,0.06)",
        borderLeft:"3px solid #6366f1", borderRadius:14, padding:"22px 24px" }}>
        <h3 style={{ fontWeight:700, fontSize:16, color:"#6366f1", marginBottom:14 }}>
          Round-Robin Branch Interleaving
        </h3>
        <pre style={{ background:"#0c0e1a", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10,
          padding:"16px 20px", fontSize:12, color:"#a5b4fc", overflowX:"auto", lineHeight:1.8 }}>
{`FUNCTION allocateSeats(students, halls):
  1. GROUP students by branch → byBranch[B]
  2. INTERLEAVE students round-robin by branch
  3. For each hall: assign seats row-by-row
     - Single seater: 1 student per bench cell
     - Double seater: 2 students per bench cell
       (slot 0 = left, slot 1 = right)
  4. RETURN allocations with hallId, row, col, slot`}
        </pre>
      </div>
    </div>
  );
}

// ─── SchemaPage ───────────────────────────────────────────────────────────────
export function SchemaPage() {
  return (
    <div style={{ animation:"fadeUp 0.5s ease" }}>
      <PageHeader title="Database Schema" subtitle="ER Design & SQL DDL"/>
      <div style={{ background:"#151825", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"22px 24px" }}>
        <p style={{ color:"#64748b" }}>Schema details available in full version.</p>
      </div>
    </div>
  );
}

// ─── StudentView ──────────────────────────────────────────────────────────────
// Students are hard-locked to this view. They CANNOT navigate anywhere else.
// The sidebar is icon-only with no nav items for students.
export function StudentView({ user, allocation, isAllocated }) {
  return (
    <div style={{ animation:"fadeUp 0.5s ease", maxWidth:560, margin:"0 auto" }}>

      {/* Minimal header — just the student's name, no navigation hints */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <div style={{
            width:44, height:44, borderRadius:14,
            background:"linear-gradient(135deg,#10b981,#34d399)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:20, fontWeight:800, color:"#fff",
          }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:"#f8fafc" }}>
              My Exam Seat
            </div>
            <div style={{ fontSize:13, color:"#64748b" }}>
              Welcome, {user.name} · {user.rollNo}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        background:"#151825", border:"1px solid rgba(255,255,255,0.06)",
        borderRadius:20, padding:"32px", textAlign:"center",
      }}>
        {/* ── Allocation not run yet ── */}
        {!isAllocated ? (
          <div>
            <div style={{ fontSize:52, marginBottom:16 }}>🕐</div>
            <h3 style={{ fontSize:20, fontWeight:700, marginBottom:8, color:"#e2e8f0" }}>
              Allocation Pending
            </h3>
            <p style={{ color:"#64748b", fontSize:14 }}>
              Seat allocation has not been completed yet. Please check back later.
            </p>
          </div>

        /* ── Allocated but student not in list ── */
        ) : !allocation ? (
          <div>
            <div style={{ fontSize:52, marginBottom:16 }}>⚠️</div>
            <h3 style={{ fontSize:20, fontWeight:700, marginBottom:8, color:"#e2e8f0" }}>
              Not Allocated
            </h3>
            <p style={{ color:"#64748b", fontSize:14 }}>
              Your register number was not found in the allocation list.
              Please contact the exam cell.
            </p>
          </div>

        /* ── Student has a seat ── */
        ) : (
          <div>
            {/* Branch icon */}
            <div style={{
              width:72, height:72, borderRadius:20,
              background:`${BRANCH_COLORS[allocation.branch] || "#6366f1"}22`,
              border:`2px solid ${BRANCH_COLORS[allocation.branch] || "#6366f1"}44`,
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 20px", fontSize:30,
            }}>
              🎓
            </div>

            <h2 style={{ fontSize:22, fontWeight:800, marginBottom:4, color:"#f8fafc" }}>
              {allocation.name}
            </h2>
            <p style={{ color:"#64748b", fontSize:13, marginBottom:28 }}>
              {allocation.rollNo} · {allocation.branch} · Year {allocation.year}
            </p>

            {/* Seat details grid — ONLY their allocated hall */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
              {[
                { label:"Hall",        value: allocation.hallName,           color:"#6366f1", icon:"hall"     },
                { label:"Seat Number", value: `#${allocation.seatNumber}`,   color:"#10b981", icon:"check"    },
                { label:"Row",         value: `Row ${allocation.row}`,       color:"#0ea5e9", icon:"info"     },
                { label:"Bench",       value: `Col ${allocation.col}${allocation.benchType==="double" ? ` · Slot ${(allocation.slot??0)+1}` : ""}`,
                  color:"#f59e0b", icon:"bench" },
              ].map(item => (
                <div key={item.label} style={{
                  background:"#0c0e1a", borderRadius:14, padding:"16px",
                  border:"1px solid rgba(255,255,255,0.06)", textAlign:"left",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                    <Icon name={item.icon} size={13} color={item.color}/>
                    <div style={{ color:"#475569", fontSize:11, textTransform:"uppercase", letterSpacing:"0.04em" }}>
                      {item.label}
                    </div>
                  </div>
                  <div style={{ fontSize:15, fontWeight:800, color:item.color }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Confirmation banner */}
            <div style={{
              background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.25)",
              borderRadius:12, padding:"14px 20px", color:"#34d399", fontSize:13, fontWeight:600,
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            }}>
              <Icon name="check" size={16} color="#34d399"/>
              You are allocated! Please arrive 15 minutes early.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

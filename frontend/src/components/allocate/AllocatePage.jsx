import React, { useState, useMemo } from "react";
import Icon from "../ui/Icon";
import { PageHeader } from "../ui/index.jsx";
import { btnStyle } from "../../constants/styles";
import { BRANCH_COLORS } from "../../constants/index";
import { ALGORITHM_REGISTRY, DEFAULT_ALGORITHM } from "../../utils/algorithms";
import HallLayoutView from "../halls/HallLayoutView";

const C = {
  bg:"#0a0c18", card:"#151825", border:"rgba(255,255,255,0.07)", muted:"#475569",
};

export default function AllocatePage({
  halls, students, allocations, isAllocated,
  onAllocate, onReset, selectedHall, setSelectedHall,
  role, allocStats,
}) {
  const [selectedAlgo, setSelectedAlgo] = useState(DEFAULT_ALGORITHM);

  // ── Selection state ───────────────────────────────────────────
  // skippedStudents: Set of "branch__year" keys that are excluded
  // skippedHalls:    Set of hall ids that are excluded
  const [skippedStudents, setSkippedStudents] = useState(new Set());
  const [skippedHalls,    setSkippedHalls]    = useState(new Set());

  const currentHall = halls.find(h => h.id === selectedHall);

  // ── Derive class groups ────────────────────────────────────────
  const classGroups = useMemo(() => {
    const map = {};
    students.forEach(s => {
      const key = `${s.branch}__${s.year}`;
      if (!map[key]) map[key] = { key, branch: s.branch, year: s.year, students: [] };
      map[key].students.push(s);
    });
    return Object.values(map).sort((a,b) => a.branch.localeCompare(b.branch) || a.year - b.year);
  }, [students]);

  const toggleStudent = (key) => setSkippedStudents(p => { const n=new Set(p); n.has(key)?n.delete(key):n.add(key); return n; });
  const toggleHall    = (id)  => setSkippedHalls(p    => { const n=new Set(p); n.has(id) ?n.delete(id) :n.add(id);  return n; });

  const activeStudents = students.filter(s => !skippedStudents.has(`${s.branch}__${s.year}`));
  const activeHalls    = halls.filter(h => !skippedHalls.has(h.id));
  const activeCapacity = activeHalls.reduce((s,h) => s+h.capacity, 0);

  const canAllocate = activeStudents.length > 0 && activeHalls.length > 0;

  const handleAllocate = () => {
    if (!canAllocate) return;
    onAllocate(selectedAlgo, activeStudents, activeHalls);
  };

  return (
    <div style={{ animation:"fadeUp 0.5s ease" }}>
      <PageHeader title="Seat Allocation" subtitle="Select groups & halls, then allocate">
        <div style={{ display:"flex", gap:10 }}>
          {role === "admin" && (
            <>
              <button onClick={onReset} style={btnStyle("#475569")} disabled={!isAllocated}>
                <Icon name="refresh" size={16} color="#fff"/> Reset
              </button>
              <button
                onClick={handleAllocate}
                disabled={!canAllocate}
                style={{ ...btnStyle("#6366f1"), opacity:!canAllocate?0.4:1 }}>
                <Icon name="allocate" size={16} color="#fff"/>
                {isAllocated ? "Re-Allocate" : "Start Allocation"}
              </button>
            </>
          )}
        </div>
      </PageHeader>

      {/* ── Selection panels (always visible for admin) ── */}
      {role === "admin" && students.length > 0 && (
        <SelectionPanels
          classGroups={classGroups}
          halls={halls}
          skippedStudents={skippedStudents}
          skippedHalls={skippedHalls}
          toggleStudent={toggleStudent}
          toggleHall={toggleHall}
          activeStudents={activeStudents}
          activeHalls={activeHalls}
          activeCapacity={activeCapacity}
        />
      )}

      {role === "admin" && (
        <AlgorithmSelector
          selectedAlgo={selectedAlgo}
          onSelect={setSelectedAlgo}
          isAllocated={isAllocated}
        />
      )}

      {isAllocated && allocStats && <LatencyBlock stats={allocStats} />}

      {!isAllocated ? (
        <EmptyAllocationState
          students={students} halls={halls}
          selectedAlgo={selectedAlgo} onAllocate={handleAllocate}
          role={role} canAllocate={canAllocate}
        />
      ) : (
        <>
          <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
            {halls.map(h => {
              const cnt = allocations.filter(a => a.hallId===h.id).length;
              const isActive = selectedHall === h.id;
              return (
                <button key={h.id} onClick={() => setSelectedHall(isActive?null:h.id)} style={{
                  padding:"10px 18px", borderRadius:10, border:"1px solid",
                  borderColor:isActive?"#6366f1":"rgba(255,255,255,0.08)",
                  background:isActive?"rgba(99,102,241,0.15)":"#151825",
                  color:isActive?"#a5b4fc":"#94a3b8", cursor:"pointer", fontSize:13, fontWeight:600,
                }}>
                  {h.name} {h.roomNo} · {cnt}/{h.capacity}
                  <span style={{ marginLeft:6, fontSize:10, color:isActive?"#818cf8":"#475569" }}>
                    ({h.benchType==="double"?"2-seat":"1-seat"})
                  </span>
                </button>
              );
            })}
          </div>
          {currentHall ? (
            <HallLayoutView hall={currentHall} allocations={allocations} onBack={() => setSelectedHall(null)} />
          ) : (
            <AllocationTable allocations={allocations} />
          )}
        </>
      )}
    </div>
  );
}

// ─── Selection Panels ─────────────────────────────────────────────────────────
function SelectionPanels({ classGroups, halls, skippedStudents, skippedHalls, toggleStudent, toggleHall, activeStudents, activeHalls, activeCapacity }) {
  const yearLabel = y => ["","1st","2nd","3rd","4th"][y] || y+"th";

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>

      {/* Student groups */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderTop:"2px solid #6366f1", borderRadius:14, padding:"18px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:30,height:30,borderRadius:8,background:"rgba(99,102,241,0.15)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>🎓</div>
            <div>
              <div style={{ fontSize:13,fontWeight:700,color:"#e2e8f0" }}>Student Groups</div>
              <div style={{ fontSize:11,color:C.muted }}>
                {activeStudents.length} of {classGroups.reduce((s,g)=>s+g.students.length,0)} students selected
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => classGroups.forEach(g => skippedStudents.has(g.key) && toggleStudent(g.key))}
              style={{ fontSize:10,fontWeight:700,padding:"3px 10px",background:"rgba(16,185,129,0.1)",
                border:"1px solid rgba(16,185,129,0.25)",borderRadius:6,cursor:"pointer",color:"#34d399" }}>
              All In
            </button>
            <button onClick={() => classGroups.forEach(g => !skippedStudents.has(g.key) && toggleStudent(g.key))}
              style={{ fontSize:10,fontWeight:700,padding:"3px 10px",background:"rgba(239,68,68,0.08)",
                border:"1px solid rgba(239,68,68,0.2)",borderRadius:6,cursor:"pointer",color:"#f87171" }}>
              All Out
            </button>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:7, maxHeight:260, overflowY:"auto" }}>
          {classGroups.map(g => {
            const skipped = skippedStudents.has(g.key);
            const color   = BRANCH_COLORS[g.branch] || "#64748b";
            return (
              <div key={g.key} style={{
                display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                background: skipped ? "rgba(239,68,68,0.06)" : `${color}0d`,
                border:`1px solid ${skipped?"rgba(239,68,68,0.2)":color+"30"}`,
                borderRadius:10, transition:"all 0.18s",
              }}>
                <div style={{ width:8,height:8,borderRadius:"50%",flexShrink:0,
                  background:skipped?"#ef4444":color }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12,fontWeight:600,color:skipped?"#64748b":"#e2e8f0" }}>
                    {g.branch} · {yearLabel(g.year)} Year
                  </div>
                  <div style={{ fontSize:11,color:C.muted }}>{g.students.length} students</div>
                </div>
                <button onClick={() => toggleStudent(g.key)} style={{
                  padding:"4px 12px", borderRadius:7, fontSize:11, fontWeight:700,
                  cursor:"pointer", border:"none", flexShrink:0, transition:"all 0.15s",
                  background: skipped ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)",
                  color: skipped ? "#34d399" : "#f87171",
                }}>
                  {skipped ? "Include" : "Skip"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Halls */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderTop:"2px solid #0ea5e9", borderRadius:14, padding:"18px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:30,height:30,borderRadius:8,background:"rgba(14,165,233,0.15)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>🏛️</div>
            <div>
              <div style={{ fontSize:13,fontWeight:700,color:"#e2e8f0" }}>Exam Halls</div>
              <div style={{ fontSize:11,color:C.muted }}>
                {activeHalls.length} of {halls.length} halls · {activeCapacity} seats
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => halls.forEach(h => skippedHalls.has(h.id) && toggleHall(h.id))}
              style={{ fontSize:10,fontWeight:700,padding:"3px 10px",background:"rgba(16,185,129,0.1)",
                border:"1px solid rgba(16,185,129,0.25)",borderRadius:6,cursor:"pointer",color:"#34d399" }}>
              All In
            </button>
            <button onClick={() => halls.forEach(h => !skippedHalls.has(h.id) && toggleHall(h.id))}
              style={{ fontSize:10,fontWeight:700,padding:"3px 10px",background:"rgba(239,68,68,0.08)",
                border:"1px solid rgba(239,68,68,0.2)",borderRadius:6,cursor:"pointer",color:"#f87171" }}>
              All Out
            </button>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:7, maxHeight:260, overflowY:"auto" }}>
          {halls.length === 0 ? (
            <div style={{ textAlign:"center",color:C.muted,fontSize:13,padding:"30px 0" }}>
              No halls added yet
            </div>
          ) : halls.map(h => {
            const skipped = skippedHalls.has(h.id);
            return (
              <div key={h.id} style={{
                display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                background: skipped ? "rgba(239,68,68,0.06)" : "rgba(14,165,233,0.06)",
                border:`1px solid ${skipped?"rgba(239,68,68,0.2)":"rgba(14,165,233,0.2)"}`,
                borderRadius:10, transition:"all 0.18s",
              }}>
                <div style={{ width:8,height:8,borderRadius:"50%",flexShrink:0,
                  background:skipped?"#ef4444":"#0ea5e9" }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12,fontWeight:600,color:skipped?"#64748b":"#e2e8f0",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                    {h.name} — {h.roomNo}
                  </div>
                  <div style={{ fontSize:11,color:C.muted }}>
                    {h.floor} · {h.capacity} seats · {h.benchType==="double"?"Double":"Single"} seater
                  </div>
                </div>
                <button onClick={() => toggleHall(h.id)} style={{
                  padding:"4px 12px", borderRadius:7, fontSize:11, fontWeight:700,
                  cursor:"pointer", border:"none", flexShrink:0, transition:"all 0.15s",
                  background: skipped ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)",
                  color: skipped ? "#34d399" : "#f87171",
                }}>
                  {skipped ? "Include" : "Skip"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Capacity warning */}
        {activeHalls.length > 0 && activeStudents.length > activeCapacity && (
          <div style={{ marginTop:12, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
            borderRadius:8, padding:"8px 12px", fontSize:11, color:"#fca5a5", display:"flex", gap:8 }}>
            ⚠️ Capacity ({activeCapacity}) is less than selected students ({activeStudents.length})
          </div>
        )}
        {activeHalls.length > 0 && activeStudents.length <= activeCapacity && activeStudents.length > 0 && (
          <div style={{ marginTop:12, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)",
            borderRadius:8, padding:"8px 12px", fontSize:11, color:"#34d399", display:"flex", gap:8 }}>
            ✓ Ready — {activeCapacity - activeStudents.length} spare seats
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Algorithm Selector ───────────────────────────────────────────────────────
function AlgorithmSelector({ selectedAlgo, onSelect, isAllocated }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`,
      borderTop:"2px solid #6366f1", borderRadius:16, padding:"20px 24px", marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <div style={{ width:32,height:32,borderRadius:10,background:"rgba(99,102,241,0.2)",
          display:"flex",alignItems:"center",justifyContent:"center" }}>
          <Icon name="chart" size={16} color="#6366f1"/>
        </div>
        <div>
          <div style={{ fontSize:14,fontWeight:700,color:"#e2e8f0" }}>Allocation Algorithm</div>
          <div style={{ fontSize:12,color:C.muted,marginTop:1 }}>How students are distributed across halls</div>
        </div>
        <span style={{ marginLeft:"auto",background:"rgba(99,102,241,0.15)",color:"#a5b4fc",
          border:"1px solid rgba(99,102,241,0.3)",borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700 }}>
          {ALGORITHM_REGISTRY[selectedAlgo].label}
        </span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
        {Object.entries(ALGORITHM_REGISTRY).map(([key, algo]) => {
          const isSel = selectedAlgo === key;
          return (
            <label key={key} style={{
              display:"flex", alignItems:"flex-start", gap:12,
              background:isSel?"rgba(99,102,241,0.12)":"rgba(255,255,255,0.03)",
              border:`1.5px solid ${isSel?"#6366f1":"rgba(255,255,255,0.08)"}`,
              borderRadius:12, padding:"14px 16px", cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>{ if(!isSel){ e.currentTarget.style.borderColor="rgba(99,102,241,0.4)"; e.currentTarget.style.background="rgba(99,102,241,0.06)"; }}}
              onMouseLeave={e=>{ if(!isSel){ e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.background="rgba(255,255,255,0.03)"; }}}>
              <input type="radio" name="allocationAlgo" value={key} checked={isSel}
                onChange={()=>onSelect(key)} style={{ display:"none" }}/>
              <div style={{ width:18,height:18,borderRadius:"50%",flexShrink:0,marginTop:1,
                border:`2px solid ${isSel?"#6366f1":"#334155"}`,background:isSel?"#6366f1":"transparent",
                display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }}>
                {isSel&&<div style={{ width:6,height:6,borderRadius:"50%",background:"#fff" }}/>}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:13,fontWeight:700,color:isSel?"#a5b4fc":"#e2e8f0",marginBottom:3 }}>
                  {algo.label}
                </div>
                <div style={{ fontSize:11,color:C.muted,lineHeight:1.5 }}>{algo.description}</div>
              </div>
            </label>
          );
        })}
      </div>
      {isAllocated && (
        <div style={{ marginTop:14,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",
          borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,fontSize:12,color:"#fbbf24" }}>
          <Icon name="warning" size={14} color="#f59e0b"/>
          Algorithm change only takes effect after clicking <strong style={{ marginLeft:3 }}>Re-Allocate</strong>.
        </div>
      )}
    </div>
  );
}

// ─── Latency Block ────────────────────────────────────────────────────────────
function LatencyBlock({ stats }) {
  const { latencyMs, studentCount, hallCount, algoLabel, timestamp } = stats;
  const rating =
    latencyMs < 5   ? { label:"Blazing Fast", color:"#10b981", bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.25)",  icon:"⚡" } :
    latencyMs < 50  ? { label:"Fast",         color:"#0ea5e9", bg:"rgba(14,165,233,0.1)",  border:"rgba(14,165,233,0.25)",  icon:"🚀" } :
    latencyMs < 200 ? { label:"Good",         color:"#f59e0b", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.25)",  icon:"✅" } :
                      { label:"Slow",         color:"#ef4444", bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.25)",   icon:"🐢" };

  const throughput = latencyMs > 0 ? Math.round((studentCount/latencyMs)*1000) : studentCount*1000;

  return (
    <div style={{ background:C.card, border:`1px solid ${rating.border}`,
      borderTop:`2px solid ${rating.color}`, borderRadius:16, padding:"18px 22px", marginBottom:20, animation:"fadeUp 0.4s ease" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <div style={{ width:34,height:34,borderRadius:9,background:rating.bg,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>{rating.icon}</div>
        <div>
          <div style={{ fontSize:13,fontWeight:700,color:"#e2e8f0" }}>Allocation Performance</div>
          <div style={{ fontSize:11,color:C.muted }}>
            Measured with <code style={{ fontFamily:"monospace",color:"#64748b" }}>performance.now()</code>
          </div>
        </div>
        <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:7,
          background:rating.bg,border:`1px solid ${rating.border}`,borderRadius:20,padding:"4px 12px" }}>
          <div style={{ width:6,height:6,borderRadius:"50%",background:rating.color,boxShadow:`0 0 5px ${rating.color}` }}/>
          <span style={{ fontSize:11,fontWeight:700,color:rating.color }}>{rating.label}</span>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
        {[
          { label:"Time",       val:latencyMs<1000?`${latencyMs} ms`:`${(latencyMs/1000).toFixed(2)}s`, color:rating.color },
          { label:"Allocated",  val:studentCount, sub:`${hallCount} halls`,  color:"#a5b4fc" },
          { label:"Throughput", val:`${throughput.toLocaleString()}/s`,       color:"#34d399" },
          { label:"Algorithm",  val:algoLabel,    sub:timestamp,             color:"#f59e0b" },
        ].map(s=>(
          <div key={s.label} style={{ background:C.bg,border:`1px solid ${C.border}`,
            borderRadius:10,padding:"12px 14px" }}>
            <div style={{ fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6 }}>{s.label}</div>
            <div style={{ fontSize:s.label==="Algorithm"?13:20,fontWeight:800,color:s.color,lineHeight:1 }}>{s.val}</div>
            {s.sub&&<div style={{ fontSize:10,color:C.muted,marginTop:3 }}>{s.sub}</div>}
          </div>
        ))}
      </div>
      <div style={{ height:5,borderRadius:99,background:"rgba(255,255,255,0.05)",overflow:"hidden",position:"relative" }}>
        <div style={{ position:"absolute",inset:0,background:"linear-gradient(90deg,#10b981,#0ea5e9 30%,#f59e0b 70%,#ef4444)",opacity:0.2 }}/>
        <div style={{ height:"100%",borderRadius:99,background:`linear-gradient(90deg,#10b981,${rating.color})`,
          width:`${Math.min(100,(latencyMs/200)*100)}%`,transition:"width 0.8s cubic-bezier(0.22,1,0.36,1)",
          boxShadow:`0 0 8px ${rating.color}` }}/>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyAllocationState({ students, halls, selectedAlgo, onAllocate, role, canAllocate }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`,
      borderRadius:20, padding:"60px 40px", textAlign:"center" }}>
      <div style={{ width:80,height:80,borderRadius:24,background:"rgba(99,102,241,0.1)",
        display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px" }}>
        <Icon name="allocate" size={40} color="#6366f1"/>
      </div>
      <h3 style={{ fontSize:22,fontWeight:700,marginBottom:8 }}>No Allocation Yet</h3>
      <p style={{ color:"#64748b",marginBottom:8 }}>
        {students.length===0 ? "Add students from Data Manager first." :
         halls.length===0    ? "Add exam halls from Data Manager first." :
         `Allocate ${students.length} students across ${halls.length} halls.`}
      </p>
      {students.length>0&&halls.length>0&&(
        <p style={{ color:C.muted,fontSize:13,marginBottom:28 }}>
          Algorithm: <span style={{ color:"#a5b4fc",fontWeight:600 }}>{ALGORITHM_REGISTRY[selectedAlgo].label}</span>
        </p>
      )}
      {role==="admin"&&canAllocate&&(
        <button onClick={onAllocate}
          style={{ ...btnStyle("#6366f1"),display:"inline-flex",padding:"14px 32px",fontSize:15 }}>
          <Icon name="allocate" size={18} color="#fff"/> Start Allocation
        </button>
      )}
    </div>
  );
}

// ─── Allocation Table ─────────────────────────────────────────────────────────
function AllocationTable({ allocations }) {
  return (
    <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden" }}>
      <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
        <thead>
          <tr style={{ borderBottom:`1px solid ${C.border}` }}>
            {["Roll No","Name","Branch","Year","Hall","Seat","Row","Col","Slot"].map(h=>(
              <th key={h} style={{ padding:"12px 16px",textAlign:"left",color:"#64748b",fontSize:11,textTransform:"uppercase" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allocations.slice(0,100).map((a,i)=>(
            <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <td style={{ padding:"10px 16px",color:"#a5b4fc",fontFamily:"monospace" }}>{a.rollNo}</td>
              <td style={{ padding:"10px 16px",color:"#e2e8f0" }}>{a.name}</td>
              <td style={{ padding:"10px 16px" }}>
                <span style={{ background:`${BRANCH_COLORS[a.branch]||"#64748b"}22`,color:BRANCH_COLORS[a.branch]||"#64748b",
                  padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600 }}>{a.branch}</span>
              </td>
              <td style={{ padding:"10px 16px",color:"#64748b" }}>{a.year}</td>
              <td style={{ padding:"10px 16px",color:"#94a3b8",fontSize:12 }}>{a.hallName}</td>
              <td style={{ padding:"10px 16px",color:"#f59e0b",fontWeight:600 }}>{a.seatNumber}</td>
              <td style={{ padding:"10px 16px",color:"#64748b" }}>R{a.row}</td>
              <td style={{ padding:"10px 16px",color:"#64748b" }}>C{a.col}</td>
              <td style={{ padding:"10px 16px",color:"#64748b" }}>{a.benchType==="double"?`Slot ${(a.slot??0)+1}`:"-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {allocations.length>100&&(
        <div style={{ padding:"12px 16px",textAlign:"center",color:C.muted,fontSize:12,borderTop:`1px solid ${C.border}` }}>
          Showing 100 of {allocations.length}. Select a hall above to view full layout.
        </div>
      )}
    </div>
  );
}
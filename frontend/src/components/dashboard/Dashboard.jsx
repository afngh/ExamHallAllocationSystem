import React from "react";
import Icon from "../ui/Icon";
import { PageHeader, Card } from "../ui/index.jsx";
import { btnStyle } from "../../constants/styles";

export default function Dashboard({ totalStudents, totalHalls, allocatedCount, totalCapacity, branchStats, hallStats, isAllocated, setActivePage }) {
  if (totalStudents === 0) {
    return (
      <div style={{ animation:"fadeUp 0.5s ease" }}>
        <PageHeader title="Dashboard" subtitle="Examination Hall Allocation Overview" />
        <div style={{ background:"#151825", border:"1px solid rgba(255,255,255,0.06)",
          borderRadius:20, padding:"60px 40px", textAlign:"center" }}>
          <div style={{ width:80, height:80, borderRadius:24, background:"rgba(99,102,241,0.1)",
            display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:40 }}>📋</div>
          <h3 style={{ fontSize:22, fontWeight:700, color:"#f8fafc", marginBottom:10 }}>No Student Data Yet</h3>
          <p style={{ color:"#64748b", fontSize:14, lineHeight:1.7, marginBottom:28 }}>
            Go to <strong style={{ color:"#a5b4fc" }}>Data Manager → Add Student Data</strong> to import students.
          </p>
          <button onClick={() => setActivePage("datamanager")} style={{ ...btnStyle("#6366f1"), display:"inline-flex", padding:"13px 28px", fontSize:14, borderRadius:12 }}>
            <Icon name="upload" size={16} color="#fff"/> Go to Data Manager
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { label:"Total Students", value:totalStudents, icon:"students", color:"#6366f1", sub:`Across ${[...new Set(branchStats.map(b=>b.branch))].length} branches` },
    { label:"Exam Halls",     value:totalHalls,    icon:"hall",     color:"#0ea5e9", sub:`${totalCapacity} total seats` },
    { label:"Allocated",      value:allocatedCount, icon:"seat",    color:"#10b981", sub:isAllocated?`${Math.round(allocatedCount/totalStudents*100)}% students`:"Not allocated yet" },
    { label:"Utilization",    value:isAllocated&&totalCapacity>0?`${Math.round(allocatedCount/totalCapacity*100)}%`:"—", icon:"chart", color:"#f59e0b", sub:"Hall capacity used" },
  ];

  return (
    <div style={{ animation:"fadeUp 0.5s ease" }}>
      <PageHeader title="Dashboard" subtitle="Examination Hall Allocation Overview" />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:28 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background:"#151825", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"22px 24px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ color:"#64748b", fontSize:12, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>{s.label}</div>
                <div style={{ fontSize:32, fontWeight:800, color:"#f8fafc", lineHeight:1 }}>{s.value}</div>
                <div style={{ color:"#475569", fontSize:12, marginTop:6 }}>{s.sub}</div>
              </div>
              <div style={{ width:44, height:44, borderRadius:12, background:`${s.color}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name={s.icon} size={22} color={s.color}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <Card title="Branch-wise Students">
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {branchStats.map(b => (
              <div key={b.branch}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ width:10, height:10, borderRadius:3, background:b.color, display:"inline-block" }}/>
                    <span style={{ fontSize:13, color:"#e2e8f0" }}>{b.branch}</span>
                  </div>
                  <span style={{ fontSize:12, color:"#64748b" }}>{b.total} students</span>
                </div>
                <div style={{ height:6, background:"#1e2235", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", background:b.color, borderRadius:3, width:`${(b.total/Math.max(...branchStats.map(x=>x.total),1))*100}%`, transition:"width 0.8s ease" }}/>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Hall Occupancy">
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {hallStats.map(h => (
              <div key={h.id}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:13, color:"#e2e8f0" }}>{h.name} {h.roomNo}</span>
                  <span style={{ fontSize:12, color:"#64748b" }}>{h.occupied}/{h.capacity}</span>
                </div>
                <div style={{ height:6, background:"#1e2235", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:3, background:h.pct>90?"#ef4444":h.pct>70?"#f59e0b":"#10b981", width:`${h.pct}%`, transition:"width 0.8s ease" }}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ background:isAllocated?"rgba(16,185,129,0.1)":"rgba(99,102,241,0.1)",
        border:`1px solid ${isAllocated?"#10b98133":"#6366f133"}`, borderRadius:14, padding:"16px 20px",
        display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:isAllocated?"#10b981":"#6366f1",
          boxShadow:`0 0 8px ${isAllocated?"#10b981":"#6366f1"}` }}/>
        <span style={{ fontWeight:600, fontSize:14, color:isAllocated?"#34d399":"#a5b4fc" }}>
          {isAllocated
            ? `✅ Allocation Complete — ${allocatedCount} students assigned`
            : "⏳ No allocation done yet — Go to Allocation to start"}
        </span>
      </div>
    </div>
  );
}

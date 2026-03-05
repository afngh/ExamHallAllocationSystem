import React, { useState } from "react";
import { PageHeader } from "../ui/index.jsx";
import ClassDetailView from "./ClassDetailView";
import { BRANCHES, BRANCH_COLORS } from "../../constants/index";

export default function StudentsPage({ students, setStudents, notify, role }) {
  const [openClass, setOpenClass] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [search, setSearch] = useState("");

  // Build class groups
  const classGroups = {};
  students.forEach(s => {
    const key = `${s.branch}__${s.year}`;
    if (!classGroups[key]) {
      classGroups[key] = {
        key, branch:s.branch, year:s.year,
        className: s.className || `B.Tech ${s.branch} ${s.year}${s.year===1?"st":s.year===2?"nd":s.year===3?"rd":"th"} Year`,
        students: []
      };
    }
    classGroups[key].students.push(s);
  });
  const groups = Object.values(classGroups).sort((a,b) => a.branch.localeCompare(b.branch) || a.year - b.year);

  if (openClass) {
    return (
      <ClassDetailView
        group={openClass} allStudents={students} setStudents={setStudents}
        notify={notify} role={role} editStudent={editStudent} setEditStudent={setEditStudent}
        onBack={() => { setOpenClass(null); setEditStudent(null); }}
        search={search} setSearch={setSearch}
      />
    );
  }

  if (students.length === 0) {
    return (
      <div style={{ animation:"fadeUp 0.5s ease" }}>
        <PageHeader title="Students" subtitle="No students registered yet" />
        <div style={{ background:"#151825", border:"1px solid rgba(255,255,255,0.06)",
          borderRadius:20, padding:"60px 40px", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🎓</div>
          <h3 style={{ fontSize:20, fontWeight:700, color:"#f8fafc", marginBottom:8 }}>No Students Yet</h3>
          <p style={{ color:"#64748b", fontSize:14, lineHeight:1.7 }}>
            Go to <strong style={{ color:"#a5b4fc" }}>Data Manager → Add Student Data</strong> to import students by class.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation:"fadeUp 0.5s ease" }}>
      <PageHeader title="Students" subtitle={`${students.length} students across ${groups.length} classes`} />

      {/* Branch summary strip */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:24 }}>
        {BRANCHES.filter(b => students.some(s => s.branch === b)).map(b => {
          const cnt = students.filter(s => s.branch === b).length;
          return (
            <div key={b} style={{ display:"flex", alignItems:"center", gap:8, background:"#151825",
              border:`1px solid ${BRANCH_COLORS[b]}33`, borderRadius:10, padding:"8px 14px" }}>
              <span style={{ width:10, height:10, borderRadius:3, background:BRANCH_COLORS[b], display:"inline-block", flexShrink:0 }}/>
              <span style={{ fontSize:13, fontWeight:600, color:"#e2e8f0" }}>{b}</span>
              <span style={{ fontSize:12, color:"#475569" }}>{cnt}</span>
            </div>
          );
        })}
      </div>

      {/* Groups by branch */}
      {BRANCHES.filter(b => groups.some(g => g.branch === b)).map(branch => {
        const branchGroups = groups.filter(g => g.branch === branch);
        const color = BRANCH_COLORS[branch] || "#64748b";
        return (
          <div key={branch} style={{ marginBottom:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{ width:4, height:22, borderRadius:2, background:color }}/>
              <h2 style={{ fontSize:16, fontWeight:700, color:"#f8fafc" }}>{branch} Department</h2>
              <span style={{ background:`${color}22`, color, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>
                {students.filter(s => s.branch === branch).length} students
              </span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
              {branchGroups.map(g => (
                <ClassCard key={g.key} group={g} color={color} students={students} onClick={() => setOpenClass(g)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ClassCard({ group, color, students, onClick }) {
  const yearLabels = ["","1st","2nd","3rd","4th"];
  const degreeLabel = group.year <= 4 ? "B.Tech" : "M.Tech";
  const displayName = `${degreeLabel} ${group.branch} ${yearLabels[group.year] || group.year+"th"} Year`;

  return (
    <div onClick={onClick} style={{ background:"#151825", border:`1px solid ${color}33`,
      borderRadius:16, padding:"22px", cursor:"pointer", transition:"all 0.2s ease",
      position:"relative", overflow:"hidden" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor=color; e.currentTarget.style.background=`${color}0d`; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 24px ${color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor=`${color}33`; e.currentTarget.style.background="#151825"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>

      <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%",
        background:`${color}18`, filter:"blur(20px)", pointerEvents:"none" }}/>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`${color}22`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18, fontWeight:800, color, fontFamily:"'Syne',sans-serif" }}>
          {group.year}
        </div>
        <span style={{ background:`${color}22`, color, padding:"4px 10px", borderRadius:8,
          fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>
          Year {group.year}
        </span>
      </div>

      <div style={{ fontWeight:700, fontSize:15, color:"#f8fafc", marginBottom:4 }}>{displayName}</div>
      <div style={{ color:"#64748b", fontSize:12, marginBottom:16 }}>
        {group.className !== displayName ? group.className : `${group.branch} • ${degreeLabel}`}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span style={{ fontSize:26, fontWeight:800, color }}>{group.students.length}</span>
        <span style={{ fontSize:12, color:"#475569" }}>students</span>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:14 }}>
        {group.students.slice(0,6).map(s => (
          <span key={s.id} style={{ background:"rgba(255,255,255,0.05)", color:"#64748b",
            padding:"2px 7px", borderRadius:5, fontSize:10, fontFamily:"monospace" }}>{s.rollNo}</span>
        ))}
        {group.students.length > 6 && (
          <span style={{ color:"#475569", fontSize:10, padding:"2px 4px" }}>+{group.students.length - 6} more</span>
        )}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:6, color, fontSize:12, fontWeight:600 }}>
        View &amp; Edit Class <span style={{ marginLeft:"auto", fontSize:16 }}>→</span>
      </div>
    </div>
  );
}

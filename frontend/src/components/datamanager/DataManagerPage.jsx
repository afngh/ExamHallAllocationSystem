import React, { useState } from "react";
import Icon from "../ui/Icon";
import { PageHeader } from "../ui/index.jsx";
import AddStudentDataForm from "./AddStudentDataForm";
import AddExamHallForm from "../halls/AddExamHallForm";

const SECTIONS = [
  { id:"students", label:"Add Student Data",  icon:"students", color:"#6366f1", desc:"Bulk-generate students from roll number series with exceptions", available:true },
  { id:"halls",    label:"Add Exam Hall Data", icon:"hall",     color:"#0ea5e9", desc:"Configure exam halls with bench type and seating layout",        available:true },
  { id:"staff",    label:"Add Staff Data",     icon:"staff",    color:"#10b981", desc:"Register invigilators and assign them to exam halls",            available:false },
];

export default function DataManagerPage({ students, setStudents, halls, setHalls, notify, onRefresh }) {
  const [activeSection, setActiveSection] = useState(null);

  if (activeSection === "students") {
    return (
      <AddStudentDataForm
        onBack={() => setActiveSection(null)}
        students={students}
        setStudents={setStudents}
        notify={notify}
      />
    );
  }

  if (activeSection === "halls") {
    return (
      <AddExamHallForm
        onBack={() => setActiveSection(null)}
        onSave={hall => {
          setHalls(prev => [...prev, hall]);
          setActiveSection(null);
          notify("✅ Exam hall added!");
        }}
        notify={notify}
      />
    );
  }

  return (
    <div style={{ animation:"fadeUp 0.5s ease" }}>
      <PageHeader title="Data Manager" subtitle="Manage student, hall, and staff data" />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
        {SECTIONS.map(s => (
          <SectionCard key={s.id} section={s} onClick={() => s.available && setActiveSection(s.id)} />
        ))}
      </div>

      <div style={{ marginTop:28, background:"rgba(99,102,241,0.08)", border:"1px solid #6366f122",
        borderRadius:14, padding:"18px 22px", display:"flex", gap:14, alignItems:"flex-start" }}>
        <Icon name="info" size={20} color="#6366f1"/>
        <div>
          <div style={{ fontWeight:600, color:"#a5b4fc", fontSize:14, marginBottom:4 }}>How Data Manager works</div>
          <p style={{ color:"#64748b", fontSize:13, lineHeight:1.7 }}>
            Use this section to bulk-import structured data into ExamSeat Pro. The student importer lets you define roll number series, handle exceptions, and add lateral-entry students — all without manual entry.
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ section: s, onClick }) {
  return (
    <div onClick={onClick} style={{
      background:"#151825", border:`1px solid ${s.available?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.04)"}`,
      borderRadius:20, padding:"32px 28px", cursor:s.available?"pointer":"not-allowed",
      opacity:s.available?1:0.5, transition:"all 0.2s ease", position:"relative", overflow:"hidden" }}
      onMouseEnter={e => { if(s.available) { e.currentTarget.style.borderColor=s.color; e.currentTarget.style.background=`${s.color}11`; e.currentTarget.style.transform="translateY(-2px)"; }}}
      onMouseLeave={e => { e.currentTarget.style.borderColor=s.available?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.04)"; e.currentTarget.style.background="#151825"; e.currentTarget.style.transform="translateY(0)"; }}>

      <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%",
        background:`${s.color}15`, filter:"blur(30px)", pointerEvents:"none" }}/>

      <div style={{ width:56, height:56, borderRadius:16, background:`${s.color}22`,
        display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
        <Icon name={s.icon} size={28} color={s.color}/>
      </div>

      <h3 style={{ fontWeight:700, fontSize:18, color:"#f8fafc", marginBottom:8 }}>{s.label}</h3>
      <p style={{ color:"#64748b", fontSize:13, lineHeight:1.6, marginBottom:20 }}>{s.desc}</p>

      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {s.available ? (
          <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:`${s.color}22`,
            color:s.color, padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600 }}>
            <Icon name="add" size={12} color={s.color}/> Open
          </span>
        ) : (
          <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.05)",
            color:"#475569", padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600 }}>Coming Soon</span>
        )}
      </div>
    </div>
  );
}
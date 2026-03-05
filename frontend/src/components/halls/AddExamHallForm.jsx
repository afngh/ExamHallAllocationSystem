import React, { useState } from "react";

const C = {
  bg:"#0a0c18", surface:"#111422", card:"#161929",
  border:"rgba(255,255,255,0.07)", text:"#f0f4ff",
  muted:"#4a5578", hint:"#2d3554",
};

const inp = (focused) => ({
  width:"100%", padding:"11px 14px", background:C.bg,
  border:`1px solid ${focused?"rgba(99,102,241,0.5)":C.border}`,
  borderRadius:10, color:C.text, fontSize:13, outline:"none",
  boxSizing:"border-box", transition:"border-color 0.2s",
  fontFamily:"inherit",
});

const lbl = {
  display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.08em",
  textTransform:"uppercase", color:C.muted, marginBottom:6,
};

const hint = { fontSize:11, color:C.hint, marginTop:3 };

function Section({ title, accent="#6366f1", children, cols=1 }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`,
      borderLeft:`3px solid ${accent}`, borderRadius:12, padding:"20px 22px" }}>
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em",
        textTransform:"uppercase", color:accent, marginBottom:18, opacity:0.85 }}>{title}</div>
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:16 }}>
        {children}
      </div>
    </div>
  );
}

function Steps({ step }) {
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:28, gap:0 }}>
      {["Configure Hall","Mark Missing Benches"].map((s,i) => (
        <React.Fragment key={i}>
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 14px",
            background:step===i+1?"rgba(99,102,241,0.1)":step>i+1?"rgba(16,185,129,0.07)":"transparent",
            borderRadius:9, transition:"all 0.2s" }}>
            <div style={{ width:24, height:24, borderRadius:"50%", display:"flex",
              alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800,
              background:step>i+1?"#10b981":step===i+1?"#6366f1":C.card,
              border:step<=i+1?`1px solid ${step===i+1?"#6366f1":C.border}`:"none",
              color:"#fff", flexShrink:0 }}>
              {step>i+1?"✓":i+1}
            </div>
            <span style={{ fontSize:12, fontWeight:600,
              color:step===i+1?"#a5b4fc":step>i+1?"#34d399":C.muted }}>{s}</span>
          </div>
          {i===0 && <div style={{ flex:1, height:1, background:C.border, margin:"0 6px" }}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function AddExamHallForm({ onBack, onSave, notify }) {
  const [step, setStep]   = useState(1);
  const [foc,  setFoc]    = useState(null);
  const [form, setForm]   = useState({
    name:"", roomNo:"", floor:"Ground Floor", benchType:"double", rows:6, cols:5,
  });
  const [missingBenches, setMissingBenches] = useState(new Set());

  const upd  = (k,v) => { setForm(p=>({...p,[k]:v})); setMissingBenches(new Set()); };
  const fp   = k => ({ onFocus:()=>setFoc(k), onBlur:()=>setFoc(null) });

  const totalBenches  = form.rows * form.cols;
  const activeBenches = totalBenches - missingBenches.size;
  const capacity      = activeBenches * (form.benchType==="double"?2:1);

  const toggle = (r,c) => {
    const k=`${r}-${c}`;
    setMissingBenches(p=>{ const n=new Set(p); n.has(k)?n.delete(k):n.add(k); return n; });
  };

  const handleNext = () => {
    if (!form.name.trim())   return notify("Enter the hall name!","error");
    if (!form.roomNo.trim()) return notify("Enter the room number!","error");
    if (form.rows<1||form.rows>30)  return notify("Rows must be 1–30!","error");
    if (form.cols<1||form.cols>20)  return notify("Columns must be 1–20!","error");
    setStep(2);
  };

  const handleSave = () => {
    if (activeBenches===0) return notify("All benches marked missing!","error");
    onSave({
      id:            Date.now() + Math.random(),
      name:          form.name.trim(),
      roomNo:        form.roomNo.trim(),
      floor:         form.floor,
      benchType:     form.benchType,
      rows:          Number(form.rows),
      cols:          Number(form.cols),
      missingBenches:[...missingBenches],
      capacity,
    });
    notify("✅ Hall saved!");
  };

  const FLOORS=["Ground Floor","1st Floor","2nd Floor","3rd Floor","4th Floor","5th Floor","Basement"];

  return (
    <div style={{ maxWidth:860, animation:"fadeUp 0.35s ease" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:26 }}>
        <button onClick={onBack} style={{ background:"transparent",
          border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 14px",
          color:C.muted, cursor:"pointer", fontSize:12, fontWeight:600 }}>← Back</button>
        <div>
          <h1 style={{ fontSize:21, fontWeight:800, color:C.text, letterSpacing:"-0.02em", margin:0 }}>
            Add Exam Hall
          </h1>
          <p style={{ fontSize:12, color:C.muted, marginTop:3 }}>
            Configure layout then mark physically absent benches
          </p>
        </div>
      </div>

      <Steps step={step} />

      {step===1 && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {/* Hall identity */}
            <Section title="Hall Identity" accent="#6366f1">
              <div>
                <label style={lbl}>Hall / Block Name</label>
                <input value={form.name} onChange={e=>upd("name",e.target.value)}
                  placeholder="e.g. Main Block, CSE Building"
                  style={inp(foc==="name")} {...fp("name")}/>
                <p style={hint}>Name of the building or block</p>
              </div>
              <div>
                <label style={lbl}>Room Number</label>
                <input value={form.roomNo} onChange={e=>upd("roomNo",e.target.value)}
                  placeholder="e.g. 101, LH-3, G-12"
                  style={inp(foc==="roomNo")} {...fp("roomNo")}/>
                <p style={hint}>Unique room identifier</p>
              </div>
            </Section>

            {/* Location + bench type */}
            <Section title="Location & Type" accent="#8b5cf6">
              <div>
                <label style={lbl}>Floor</label>
                <select value={form.floor} onChange={e=>upd("floor",e.target.value)}
                  style={{ ...inp(false), cursor:"pointer" }}>
                  {FLOORS.map(f=><option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Bench Type</label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[
                    { val:"single", icon:"🪑", label:"Single Seater", sub:"1 student/bench" },
                    { val:"double", icon:"🛋️", label:"Double Seater", sub:"2 students/bench" },
                  ].map(opt=>(
                    <div key={opt.val} onClick={()=>upd("benchType",opt.val)} style={{
                      background:form.benchType===opt.val?"rgba(99,102,241,0.14)":C.bg,
                      border:`1.5px solid ${form.benchType===opt.val?"#6366f1":C.border}`,
                      borderRadius:10, padding:"11px 12px", cursor:"pointer",
                      textAlign:"center", transition:"all 0.18s",
                    }}>
                      <div style={{ fontSize:18, marginBottom:3 }}>{opt.icon}</div>
                      <div style={{ fontSize:11, fontWeight:700,
                        color:form.benchType===opt.val?"#a5b4fc":C.text }}>{opt.label}</div>
                      <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{opt.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>

          {/* Grid config */}
          <Section title="Seating Grid Configuration" accent="#10b981" cols={3}>
            <div>
              <label style={lbl}>Number of Rows</label>
              <input type="number" min={1} max={30} value={form.rows}
                onChange={e=>upd("rows",Math.max(1,parseInt(e.target.value)||1))}
                placeholder="6" style={inp(foc==="rows")} {...fp("rows")}/>
              <p style={hint}>Rows front to back (1–30)</p>
            </div>
            <div>
              <label style={lbl}>Number of Columns</label>
              <input type="number" min={1} max={20} value={form.cols}
                onChange={e=>upd("cols",Math.max(1,parseInt(e.target.value)||1))}
                placeholder="5" style={inp(foc==="cols")} {...fp("cols")}/>
              <p style={hint}>Benches side by side (1–20)</p>
            </div>
            {/* Live capacity preview */}
            <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:10,
              padding:"12px 16px", display:"flex", flexDirection:"column", justifyContent:"center", gap:10 }}>
              {[
                { label:"Grid Benches", val:`${form.rows}×${form.cols} = ${totalBenches}`, color:"#94a3b8" },
                { label:"Per Bench",    val:form.benchType==="double"?"2 students":"1 student", color:"#0ea5e9" },
                { label:"Max Capacity", val:form.rows*form.cols*(form.benchType==="double"?2:1), color:"#10b981" },
              ].map(s=>(
                <div key={s.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:C.muted }}>{s.label}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.val}</span>
                </div>
              ))}
            </div>
          </Section>

          <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:4 }}>
            <button onClick={handleNext} style={{
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              border:"none", borderRadius:10, padding:"12px 26px",
              color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer",
              letterSpacing:"0.01em",
            }}>Next: Mark Missing Benches →</button>
          </div>
        </div>
      )}

      {step===2 && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* info */}
          <div style={{ background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.18)",
            borderRadius:10, padding:"11px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:16 }}>🖱️</span>
            <span style={{ fontSize:12, color:"#fca5a5", fontWeight:600 }}>
              Click a bench to mark it physically absent · Click again to restore
            </span>
          </div>

          {/* stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { label:"Total",    val:totalBenches,        color:"#94a3b8" },
              { label:"Missing",  val:missingBenches.size, color:"#ef4444" },
              { label:"Active",   val:activeBenches,       color:"#10b981" },
              { label:"Capacity", val:capacity,            color:"#6366f1" },
            ].map(s=>(
              <div key={s.label} style={{ background:C.card, border:`1px solid ${C.border}`,
                borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
                <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase",
                  letterSpacing:"0.07em", marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* grid */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 20px" }}>
            <div style={{ background:"#0c2a1a", border:"1px solid #0d4428", borderRadius:7,
              padding:"6px 20px", textAlign:"center", marginBottom:16,
              color:"#34d399", fontSize:10, fontWeight:700, letterSpacing:"0.12em" }}>
              ◀  BLACKBOARD — FRONT OF HALL  ▶
            </div>
            <div style={{ overflowX:"auto", overflowY:"auto", maxHeight:440 }}>
              <div style={{ display:"inline-block" }}>
                {Array.from({length:form.rows}).map((_,ri) => {
                  const rn=ri+1;
                  return (
                    <div key={ri} style={{ display:"flex", gap:form.benchType==="double"?8:5,
                      marginBottom:7, alignItems:"center" }}>
                      <span style={{ width:22, fontSize:9, color:C.muted,
                        textAlign:"right", flexShrink:0, fontWeight:700 }}>R{rn}</span>
                      {Array.from({length:form.cols}).map((_,ci) => {
                        const cn=ci+1, key=`${rn}-${cn}`, miss=missingBenches.has(key),
                          bn=ri*form.cols+cn;
                        return (
                          <div key={ci} onClick={()=>toggle(rn,cn)}
                            title={`B${bn} (R${rn}·C${cn}) — ${miss?"restore":"mark missing"}`}
                            style={{ cursor:"pointer", display:"flex", flexDirection:"column",
                              alignItems:"center", gap:2 }}>
                            <span style={{ fontSize:7, color:miss?"rgba(239,68,68,0.4)":C.hint }}>{bn}</span>
                            {form.benchType==="double" ? (
                              <div style={{ display:"flex", gap:2, padding:"4px 5px", borderRadius:7,
                                background:miss?"rgba(239,68,68,0.07)":"rgba(99,102,241,0.08)",
                                border:`1px solid ${miss?"rgba(239,68,68,0.35)":"rgba(99,102,241,0.18)"}`,
                                transition:"all 0.12s" }}>
                                {miss ? (
                                  <div style={{ width:44,height:20,display:"flex",alignItems:"center",
                                    justifyContent:"center",color:"#ef4444",fontSize:12,fontWeight:700 }}>✕</div>
                                ) : (
                                  <>
                                    <div style={{ width:20,height:20,borderRadius:3,
                                      background:"rgba(99,102,241,0.16)",border:"1px solid rgba(99,102,241,0.22)" }}/>
                                    <div style={{ width:1,background:C.border }}/>
                                    <div style={{ width:20,height:20,borderRadius:3,
                                      background:"rgba(99,102,241,0.08)",border:"1px dashed rgba(99,102,241,0.14)" }}/>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div style={{ width:26,height:26,borderRadius:6,
                                background:miss?"rgba(239,68,68,0.07)":"rgba(99,102,241,0.1)",
                                border:`1px solid ${miss?"rgba(239,68,68,0.35)":"rgba(99,102,241,0.18)"}`,
                                display:"flex",alignItems:"center",justifyContent:"center",
                                fontSize:11,color:miss?"#ef4444":"transparent",fontWeight:700,
                                transition:"all 0.12s" }}>{miss?"✕":""}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ marginTop:14, paddingTop:12, borderTop:`1px solid ${C.border}`,
              display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
              <span style={{ fontSize:12, color:C.muted }}>
                {activeBenches} active × {form.benchType==="double"?2:1}/bench
                {missingBenches.size>0 && <span style={{ color:"#ef4444" }}> · {missingBenches.size} missing</span>}
              </span>
              <span style={{ fontSize:15, fontWeight:800, color:"#6366f1" }}>Capacity: {capacity}</span>
              {missingBenches.size>0 && (
                <button onClick={()=>setMissingBenches(new Set())} style={{
                  background:"none", border:"1px solid rgba(239,68,68,0.25)",
                  borderRadius:6, padding:"3px 10px", cursor:"pointer", color:"#fca5a5", fontSize:11 }}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
            <button onClick={()=>setStep(1)} style={{ background:C.card,
              border:`1px solid ${C.border}`, borderRadius:10, padding:"11px 20px",
              color:C.muted, cursor:"pointer", fontWeight:600, fontSize:13 }}>← Edit Config</button>
            <button onClick={handleSave} style={{
              background:"linear-gradient(135deg,#10b981,#059669)",
              border:"none", borderRadius:10, padding:"11px 26px",
              color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              {`✓ Save Hall (${capacity} seats)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
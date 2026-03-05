import React, { useState } from "react";
import { BRANCHES, BRANCH_COLORS, EXTRA_COLORS } from "../../constants/index";

const C = {
  bg:"#0a0c18", surface:"#111422", card:"#161929",
  border:"rgba(255,255,255,0.07)", text:"#f0f4ff",
  muted:"#4a5578", hint:"#2d3554",
};

const inp = (focused, accent="#6366f1") => ({
  width:"100%", padding:"11px 14px", background:C.bg,
  border:`1px solid ${focused?accent+"88":C.border}`,
  borderRadius:10, color:C.text, fontSize:13, outline:"none",
  boxSizing:"border-box", transition:"border-color 0.2s", fontFamily:"inherit",
});

const lbl = {
  display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.08em",
  textTransform:"uppercase", color:C.muted, marginBottom:6,
};

const hintStyle = { fontSize:11, color:C.hint, marginTop:3 };

const CLASS_OPTIONS = [
  "B.Tech 1st Year","B.Tech 2nd Year","B.Tech 3rd Year","B.Tech 4th Year",
  "M.Tech 1st Year","M.Tech 2nd Year",
];

function Section({ title, accent="#6366f1", children, cols=1 }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`,
      borderLeft:`3px solid ${accent}`, borderRadius:12, padding:"20px 22px" }}>
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em",
        textTransform:"uppercase", color:accent, marginBottom:16, opacity:0.85 }}>{title}</div>
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:14 }}>
        {children}
      </div>
    </div>
  );
}

function Steps({ step }) {
  const labels = ["Configure","Preview","Done"];
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:26, gap:0 }}>
      {labels.map((s,i)=>(
        <React.Fragment key={i}>
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 14px",
            background:step===i+1?"rgba(99,102,241,0.1)":step>i+1?"rgba(16,185,129,0.07)":"transparent",
            borderRadius:9, transition:"all 0.2s" }}>
            <div style={{ width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:11,fontWeight:800,
              background:step>i+1?"#10b981":step===i+1?"#6366f1":C.card,
              border:step<=i+1?`1px solid ${step===i+1?"#6366f1":C.border}`:"none",
              color:"#fff",flexShrink:0 }}>
              {step>i+1?"✓":i+1}
            </div>
            <span style={{ fontSize:12,fontWeight:600,
              color:step===i+1?"#a5b4fc":step>i+1?"#34d399":C.muted }}>{s}</span>
          </div>
          {i<labels.length-1&&<div style={{ flex:1,height:1,background:C.border,margin:"0 6px" }}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

function genRange(series, from, to) {
  const f=parseInt(from,10), t=parseInt(to,10);
  const pad=Math.max(String(from).length,String(to).length,2);
  if(isNaN(f)||isNaN(t)||f>t) return [];
  const out=[];
  for(let i=f;i<=t;i++) out.push(`${series}${String(i).padStart(pad,"0")}`);
  return out;
}

function parseExceptions(str) {
  return str.split(/[\n,\s]+/).map(s=>s.trim().toUpperCase()).filter(Boolean);
}

function mkRange()  { return { id:Date.now()+Math.random(), type:"range",  series:"", from:"01", to:"10" }; }
function mkSingle() { return { id:Date.now()+Math.random(), type:"single", rollNo:"" }; }

export default function AddStudentDataForm({ onBack, students, setStudents, notify }) {
  const [form, setForm] = useState({
    className:"B.Tech 2nd Year", branchName:"CSE",
    mainSeries:"25005A05", rangeFrom:"01", rangeTo:"86",
    exceptions:"", hasExtra:false, extraEntries:[mkRange()],
  });
  const [preview,    setPreview]    = useState(null);
  const [step,       setStep]       = useState(1);
  const [savedBatch, setSavedBatch] = useState(null);
  const [foc,        setFoc]        = useState(null);

  const upd = (k,v) => setForm(p=>({...p,[k]:v}));
  const fp  = k => ({ onFocus:()=>setFoc(k), onBlur:()=>setFoc(null) });

  const addEntry = (type) => setForm(p=>({...p, extraEntries:[...p.extraEntries, type==="single"?mkSingle():mkRange()]}));
  const remEntry = (id)   => setForm(p=>({...p, extraEntries:p.extraEntries.filter(e=>e.id!==id)}));
  const updEntry = (id,k,v) => setForm(p=>({...p, extraEntries:p.extraEntries.map(e=>{
    if(e.id!==id) return e;
    if(k==="type") return v==="single" ? { id:e.id, type:"single", rollNo:"" } : { id:e.id, type:"range", series:"", from:"01", to:"10" };
    return {...e,[k]:v};
  })}));

  const entryCount = (e) => {
    if(e.type==="single") return (e.rollNo||"").trim()?1:0;
    const f=parseInt(e.from,10),t=parseInt(e.to,10);
    return(!isNaN(f)&&!isNaN(t)&&f<=t)?t-f+1:0;
  };

  const handlePreview = () => {
    if(!form.mainSeries.trim()) return notify("Enter the main series!","error");
    const f=parseInt(form.rangeFrom,10), t=parseInt(form.rangeTo,10);
    if(isNaN(f)||isNaN(t)) return notify("Range must be numeric!","error");
    if(f>t)     return notify("'From' must be ≤ 'To'!","error");
    if(t-f>999) return notify("Range too large (max 1000)!","error");

    const exceptions = parseExceptions(form.exceptions);
    const mainRolls  = genRange(form.mainSeries.trim(), form.rangeFrom, form.rangeTo);
    const excluded   = mainRolls.filter(r=>exceptions.includes(r.toUpperCase()));
    const included   = mainRolls.filter(r=>!exceptions.includes(r.toUpperCase()));

    const extraGroups = [];
    if(form.hasExtra) {
      for(const e of form.extraEntries) {
        if(e.type==="single") {
          const r=(e.rollNo||"").trim().toUpperCase();
          if(r) extraGroups.push({ label:`Single: ${r}`, rolls:[r] });
        } else {
          if(!e.series.trim()) continue;
          const rolls=genRange(e.series.trim(),e.from,e.to);
          if(rolls.length>0) extraGroups.push({ label:`Range: ${e.series} (${rolls.length})`, rolls });
        }
      }
    }
    const extraAll = extraGroups.flatMap(g=>g.rolls);
    setPreview({ main:included, excluded, extraGroups, extra:extraAll, all:[...included,...extraAll] });
    setStep(2);
  };

  // ── Save to local state only — no backend ──────────────────
  const handleSave = () => {
    if(!preview) return;
    const yearMatch = form.className.match(/(\d)/);
    const year = yearMatch ? parseInt(yearMatch[1]) : 1;
    const branch = form.branchName;

    const newStudents = preview.all.map(rollNo => ({
      id:            Date.now() + Math.random(),
      rollNo,
      name:          `Student ${rollNo}`,
      branch,
      year,
      className:     form.className,
      phone:         "",
      email:         `${rollNo.toLowerCase()}@college.edu`,
      addedViaImport: true,
    }));

    const existingRolls = new Set(students.map(s => s.rollNo));
    const deduped = newStudents.filter(s => !existingRolls.has(s.rollNo));

    setStudents(prev => [...prev, ...deduped]);
    setSavedBatch({
      count:      deduped.length,
      duplicates: newStudents.length - deduped.length,
      branch,
      year,
      className:  form.className,
    });
    setStep(3);
    notify(`✅ ${deduped.length} students added!`);
  };

  const handleReset = () => {
    setForm({ className:"B.Tech 2nd Year", branchName:"CSE", mainSeries:"25005A05",
      rangeFrom:"01", rangeTo:"86", exceptions:"", hasExtra:false, extraEntries:[mkRange()] });
    setPreview(null); setStep(1); setSavedBatch(null);
  };

  const mainCount = Math.max(0,(parseInt(form.rangeTo)||0)-(parseInt(form.rangeFrom)||0)+1);

  return (
    <div style={{ maxWidth:900, animation:"fadeUp 0.35s ease" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:26 }}>
        <button onClick={onBack} style={{ background:"transparent", border:`1px solid ${C.border}`,
          borderRadius:8, padding:"7px 14px", color:C.muted, cursor:"pointer", fontSize:12, fontWeight:600 }}>
          ← Back
        </button>
        <div>
          <h1 style={{ fontSize:21, fontWeight:800, color:C.text, letterSpacing:"-0.02em", margin:0 }}>
            Add Student Data
          </h1>
          <p style={{ fontSize:12, color:C.muted, marginTop:3 }}>
            Generate student records from roll number series
          </p>
        </div>
      </div>

      <Steps step={step} />

      {/* ── Step 1 ── */}
      {step===1 && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Section title="Class" accent="#6366f1">
              <div>
                <label style={lbl}>Select Class</label>
                <select value={form.className} onChange={e=>upd("className",e.target.value)}
                  style={{ ...inp(false), cursor:"pointer" }}>
                  {CLASS_OPTIONS.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </Section>
            <Section title="Branch" accent="#8b5cf6">
              <div>
                <label style={lbl}>Select Branch</label>
                <select value={form.branchName} onChange={e=>upd("branchName",e.target.value)}
                  style={{ ...inp(false,"#8b5cf6"), cursor:"pointer" }}>
                  {BRANCHES.map(b=><option key={b} value={b}>{b}</option>)}
                </select>
                <p style={hintStyle}>
                  <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%",
                    background:BRANCH_COLORS[form.branchName]||"#6366f1",
                    marginRight:5, verticalAlign:"middle" }}/>
                  {form.branchName}
                </p>
              </div>
            </Section>
          </div>

          <Section title="Main Roll Number Series" accent="#0ea5e9" cols={3}>
            <div>
              <label style={lbl}>Series Prefix</label>
              <input value={form.mainSeries} onChange={e=>upd("mainSeries",e.target.value)}
                placeholder="e.g. 25005A05" style={inp(foc==="ms","#0ea5e9")} {...fp("ms")}/>
              <p style={hintStyle}>Common prefix of roll numbers</p>
            </div>
            <div>
              <label style={lbl}>From</label>
              <input value={form.rangeFrom} onChange={e=>upd("rangeFrom",e.target.value)}
                placeholder="01" style={inp(foc==="rf","#0ea5e9")} {...fp("rf")}/>
              <p style={hintStyle}>Starting number</p>
            </div>
            <div>
              <label style={lbl}>To</label>
              <input value={form.rangeTo} onChange={e=>upd("rangeTo",e.target.value)}
                placeholder="86" style={inp(foc==="rt","#0ea5e9")} {...fp("rt")}/>
              <p style={hintStyle}>Ending number</p>
            </div>
            {form.mainSeries && form.rangeFrom && form.rangeTo && (
              <div style={{ gridColumn:"1/-1", background:C.bg, border:"1px solid rgba(14,165,233,0.18)",
                borderRadius:9, padding:"10px 14px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <span style={{ fontSize:12, color:"#38bdf8", fontFamily:"monospace", fontWeight:600 }}>
                  {form.mainSeries}{String(parseInt(form.rangeFrom)||1).padStart(form.rangeFrom.length||2,"0")}
                  <span style={{ color:C.muted }}> → </span>
                  {form.mainSeries}{String(parseInt(form.rangeTo)||1).padStart(form.rangeTo.length||2,"0")}
                </span>
                <span style={{ marginLeft:"auto", fontSize:12, color:C.muted }}>
                  <span style={{ color:"#0ea5e9", fontWeight:800, fontSize:16 }}>{mainCount}</span> students
                </span>
              </div>
            )}
          </Section>

          <Section title="Exceptions — Excluded Students" accent="#f59e0b">
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lbl}>Excluded Roll Numbers</label>
              <textarea value={form.exceptions} onChange={e=>upd("exceptions",e.target.value)}
                rows={2} placeholder={"Enter roll numbers separated by commas or new lines\ne.g. 25005A0508, 25005A0523"}
                style={{ ...inp(foc==="ex","#f59e0b"), resize:"vertical", lineHeight:1.7 }}
                onFocus={()=>setFoc("ex")} onBlur={()=>setFoc(null)}/>
              <p style={hintStyle}>Dropped / detained students to exclude</p>
            </div>
          </Section>

          {/* Extra section */}
          <Section title="Extra Students (Optional)" accent="#10b981">
            <div style={{ gridColumn:"1/-1" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:form.hasExtra?18:0 }}>
                <button onClick={()=>upd("hasExtra",!form.hasExtra)} style={{
                  display:"flex", alignItems:"center", gap:9, padding:"8px 16px",
                  background:form.hasExtra?"rgba(16,185,129,0.12)":"rgba(255,255,255,0.04)",
                  border:`1px solid ${form.hasExtra?"#10b981":C.border}`,
                  borderRadius:9, cursor:"pointer", color:form.hasExtra?"#34d399":C.muted,
                  fontSize:12, fontWeight:700, transition:"all 0.18s",
                }}>
                  <div style={{ width:16,height:16,borderRadius:4,
                    border:`2px solid ${form.hasExtra?"#10b981":C.muted}`,
                    background:form.hasExtra?"#10b981":"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    {form.hasExtra&&<span style={{ fontSize:10,color:"#fff",fontWeight:800 }}>✓</span>}
                  </div>
                  Enable Extra Students
                </button>
                <span style={{ fontSize:11, color:C.muted }}>
                  Lateral entry, detained, or different-series students
                </span>
              </div>

              {form.hasExtra && (
                <div style={{ display:"flex", flexDirection:"column", gap:10, animation:"fadeUp 0.25s ease" }}>
                  {form.extraEntries.map((entry, idx)=>{
                    const color = EXTRA_COLORS[idx % EXTRA_COLORS.length];
                    const count = entryCount(entry);
                    return (
                      <div key={entry.id} style={{ background:C.bg,
                        border:`1px solid ${color}25`, borderLeft:`2px solid ${color}`,
                        borderRadius:10, padding:"14px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:20,height:20,borderRadius:5,background:`${color}22`,
                              display:"flex",alignItems:"center",justifyContent:"center",
                              fontSize:10,fontWeight:800,color }}>{idx+1}</div>
                            {/* Type toggle */}
                            <div style={{ display:"flex", borderRadius:7, overflow:"hidden", border:`1px solid ${C.border}` }}>
                              {[{ val:"range", label:"📋 Range" },{ val:"single", label:"👤 Single" }].map(t=>(
                                <button key={t.val} onClick={()=>updEntry(entry.id,"type",t.val)} style={{
                                  padding:"4px 12px", fontSize:11, fontWeight:600,
                                  border:"none", cursor:"pointer", transition:"all 0.15s",
                                  background:entry.type===t.val?`${color}22`:C.card,
                                  color:entry.type===t.val?color:C.muted,
                                }}>{t.label}</button>
                              ))}
                            </div>
                            {count>0&&(
                              <span style={{ background:`${color}18`,color,padding:"2px 8px",
                                borderRadius:8,fontSize:11,fontWeight:600 }}>
                                +{count} student{count>1?"s":""}
                              </span>
                            )}
                          </div>
                          {form.extraEntries.length>1&&(
                            <button onClick={()=>remEntry(entry.id)} style={{
                              background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",
                              borderRadius:6,padding:"3px 10px",cursor:"pointer",color:"#fca5a5",fontSize:11 }}>
                              Remove
                            </button>
                          )}
                        </div>

                        {entry.type==="single" ? (
                          <div>
                            <label style={lbl}>Roll Number</label>
                            <input value={entry.rollNo||""}
                              onChange={e=>updEntry(entry.id,"rollNo",e.target.value.toUpperCase())}
                              placeholder="e.g. 25005A0587"
                              style={{ ...inp(false,color), fontFamily:"monospace" }}/>
                            <p style={hintStyle}>Exact roll number of this student</p>
                          </div>
                        ) : (
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                            <div>
                              <label style={lbl}>Series Prefix</label>
                              <input value={entry.series}
                                onChange={e=>updEntry(entry.id,"series",e.target.value)}
                                placeholder="e.g. 25005A06" style={inp(false,color)}/>
                            </div>
                            <div>
                              <label style={lbl}>From</label>
                              <input value={entry.from}
                                onChange={e=>updEntry(entry.id,"from",e.target.value)}
                                placeholder="01" style={inp(false,color)}/>
                            </div>
                            <div>
                              <label style={lbl}>To</label>
                              <input value={entry.to}
                                onChange={e=>updEntry(entry.id,"to",e.target.value)}
                                placeholder="10" style={inp(false,color)}/>
                            </div>
                            {entry.series.trim()&&count>0&&(
                              <div style={{ gridColumn:"1/-1", background:`${color}0c`,
                                border:`1px solid ${color}20`, borderRadius:7,
                                padding:"7px 12px", fontSize:11, color, fontFamily:"monospace" }}>
                                {entry.series}{String(parseInt(entry.from)||1).padStart(String(entry.from).length||2,"0")}
                                <span style={{ color:C.muted }}> → </span>
                                {entry.series}{String(parseInt(entry.to)||1).padStart(String(entry.to).length||2,"0")}
                                <span style={{ color:C.muted, fontFamily:"inherit", marginLeft:10 }}>+{count} students</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>addEntry("range")} style={{ flex:1, padding:"9px 14px",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                      background:"rgba(16,185,129,0.07)", border:"1px dashed rgba(16,185,129,0.35)",
                      borderRadius:9, cursor:"pointer", color:"#10b981", fontSize:12, fontWeight:600 }}>
                      📋 Add Another Range
                    </button>
                    <button onClick={()=>addEntry("single")} style={{ flex:1, padding:"9px 14px",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                      background:"rgba(14,165,233,0.07)", border:"1px dashed rgba(14,165,233,0.35)",
                      borderRadius:9, cursor:"pointer", color:"#0ea5e9", fontSize:12, fontWeight:600 }}>
                      👤 Add Single Student
                    </button>
                  </div>

                  {form.extraEntries.some(e=>entryCount(e)>0)&&(
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
                      background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 14px" }}>
                      <span style={{ fontSize:12,color:C.muted }}>Total extra students:</span>
                      <span style={{ fontSize:16,fontWeight:800,color:"#10b981" }}>
                        +{form.extraEntries.reduce((s,e)=>s+entryCount(e),0)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:4 }}>
            <button onClick={handlePreview} style={{
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              border:"none", borderRadius:10, padding:"12px 26px",
              color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer",
            }}>Preview Students →</button>
          </div>
        </div>
      )}

      {/* ── Step 2: Preview ── */}
      {step===2&&preview&&(
        <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp 0.3s ease" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { label:"Main Series",   val:preview.main.length,    color:"#6366f1" },
              { label:"Extra",         val:preview.extra.length,   color:"#10b981" },
              { label:"Excluded",      val:preview.excluded.length, color:"#ef4444" },
              { label:"Total to Add",  val:preview.all.length,     color:"#f59e0b" },
            ].map(s=>(
              <div key={s.label} style={{ background:C.card,border:`1px solid ${C.border}`,
                borderRadius:10,padding:"14px 16px",textAlign:"center" }}>
                <div style={{ fontSize:26,fontWeight:800,color:s.color }}>{s.val}</div>
                <div style={{ fontSize:10,color:C.muted,textTransform:"uppercase",
                  letterSpacing:"0.07em",marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:10,
            padding:"12px 16px",display:"flex",gap:20,flexWrap:"wrap" }}>
            <div><span style={{ fontSize:11,color:C.muted }}>Class: </span>
              <strong style={{ fontSize:13,color:C.text }}>{form.className}</strong></div>
            <div><span style={{ fontSize:11,color:C.muted }}>Branch: </span>
              <strong style={{ fontSize:13,color:BRANCH_COLORS[form.branchName]||"#a5b4fc" }}>{form.branchName}</strong></div>
            <div><span style={{ fontSize:11,color:C.muted }}>Series: </span>
              <strong style={{ fontSize:13,color:C.text,fontFamily:"monospace" }}>{form.mainSeries}</strong></div>
          </div>

          <RollBlock label={`Main — ${preview.main.length} students`} rolls={preview.main} color="#6366f1" />
          {preview.extraGroups.map((g,i)=>(
            <RollBlock key={i} label={g.label} rolls={g.rolls} color={EXTRA_COLORS[i%EXTRA_COLORS.length]} />
          ))}
          {preview.excluded.length>0&&(
            <div style={{ background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.18)",
              borderRadius:10,padding:"14px 18px" }}>
              <div style={{ fontSize:12,fontWeight:700,color:"#fca5a5",marginBottom:10 }}>
                Excluded — {preview.excluded.length}
              </div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {preview.excluded.map(r=>(
                  <span key={r} style={{ background:"rgba(239,68,68,0.12)",color:"#fca5a5",
                    padding:"2px 9px",borderRadius:6,fontSize:11,fontFamily:"monospace",
                    textDecoration:"line-through" }}>{r}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
            <button onClick={()=>setStep(1)} style={{ background:C.card,
              border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 20px",
              color:C.muted,cursor:"pointer",fontWeight:600,fontSize:13 }}>← Edit</button>
            <button onClick={handleSave} style={{
              background:"linear-gradient(135deg,#10b981,#059669)",
              border:"none",borderRadius:10,padding:"11px 26px",
              color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer" }}>
              ✓ Add {preview.all.length} Students
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Done ── */}
      {step===3&&savedBatch&&(
        <div style={{ textAlign:"center",animation:"fadeUp 0.35s ease" }}>
          <div style={{ background:C.card,border:"1px solid rgba(16,185,129,0.25)",
            borderRadius:20,padding:"50px 40px",maxWidth:520,margin:"0 auto" }}>
            <div style={{ fontSize:48,marginBottom:16 }}>✅</div>
            <h2 style={{ fontSize:24,fontWeight:800,color:C.text,marginBottom:6 }}>Students Added!</h2>
            <p style={{ fontSize:13,color:C.muted,marginBottom:28 }}>
              {savedBatch.count} students added to the list.
            </p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:28 }}>
              {[
                { label:"Added",   val:savedBatch.count,      color:"#10b981" },
                { label:"Skipped", val:savedBatch.duplicates, color:"#f59e0b" },
                { label:"Class",   val:savedBatch.className,  color:"#6366f1" },
                { label:"Branch",  val:savedBatch.branch,     color:BRANCH_COLORS[savedBatch.branch]||"#a5b4fc" },
              ].map(i=>(
                <div key={i.label} style={{ background:C.bg,borderRadius:10,padding:"14px" }}>
                  <div style={{ fontSize:10,color:C.muted,textTransform:"uppercase",
                    letterSpacing:"0.07em",marginBottom:4 }}>{i.label}</div>
                  <div style={{ fontWeight:800,fontSize:17,color:i.color }}>{i.val}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
              <button onClick={handleReset} style={{ background:"#6366f1",border:"none",
                borderRadius:10,padding:"11px 22px",color:"#fff",fontWeight:700,
                fontSize:13,cursor:"pointer" }}>Add Another Batch</button>
              <button onClick={onBack} style={{ background:C.card,
                border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 22px",
                color:C.muted,cursor:"pointer",fontWeight:600,fontSize:13 }}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RollBlock({ label, rolls, color }) {
  return (
    <div style={{ background:C.card,border:`1px solid ${color}20`,borderRadius:10,padding:"14px 16px" }}>
      <div style={{ fontSize:12,fontWeight:700,color:C.text,marginBottom:10,
        display:"flex",alignItems:"center",gap:8 }}>
        <span style={{ width:8,height:8,borderRadius:2,background:color,display:"inline-block" }}/>
        {label}
      </div>
      <div style={{ display:"flex",flexWrap:"wrap",gap:5,maxHeight:130,overflowY:"auto" }}>
        {rolls.map(r=>(
          <span key={r} style={{ background:`${color}12`,color,padding:"2px 9px",
            borderRadius:6,fontSize:11,fontFamily:"monospace",fontWeight:600 }}>{r}</span>
        ))}
      </div>
    </div>
  );
}
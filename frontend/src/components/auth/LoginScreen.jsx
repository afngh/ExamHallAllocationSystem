import React, { useState } from "react";

const ROLES = [
  {
    key:"developer", label:"Developer", short:"DEV",
    desc:"Platform management & admin control",
    color:"#f59e0b", bg:"rgba(245,158,11,0.1)",
    emoji:"⚙️",
  },
  {
    key:"admin", label:"Administrator", short:"ADMIN",
    desc:"Full system control & exam allocation",
    color:"#6366f1", bg:"rgba(99,102,241,0.1)",
    emoji:"🛡️",
  },
  {
    key:"staff", label:"Staff / Invigilator", short:"STAFF",
    desc:"View seating charts & manage halls",
    color:"#0ea5e9", bg:"rgba(14,165,233,0.1)",
    emoji:"👤",
  },
  {
    key:"student", label:"Student", short:"STU",
    desc:"View your assigned seat allocation",
    color:"#10b981", bg:"rgba(16,185,129,0.1)",
    emoji:"🎓",
  },
];

const ROLE_META = {
  developer: { label:"Developer Portal",   color:"#f59e0b", emoji:"⚙️" },
  admin:     { label:"Administrator Login", color:"#6366f1", emoji:"🛡️" },
  staff:     { label:"Staff Login",         color:"#0ea5e9", emoji:"👤" },
  student:   { label:"Student Portal",      color:"#10b981", emoji:"🎓" },
};

export default function LoginScreen({ role, setRole, loginData, setLoginData, loginError, handleLogin, loading }) {
  return (
    <div style={{
      minHeight:"100vh", display:"flex",
      background:"#080a14",
      fontFamily:"'DM Sans','Segoe UI',sans-serif",
      position:"relative", overflow:"hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp { from{transform:translateY(18px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes float  { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        @keyframes grain  { 0%,100%{transform:translate(0,0)} 25%{transform:translate(-1%,1%)} 50%{transform:translate(1%,-1%)} 75%{transform:translate(-1%,-1%)} }
        .role-card:hover { transform:translateX(4px) !important; }
        .login-input:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-glow) !important; }
        .sign-btn:hover:not(:disabled) { opacity:0.88 !important; transform:translateY(-1px) !important; }
      `}</style>

      {/* Background grid */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:`
          linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)`,
        backgroundSize:"48px 48px",
      }}/>

      {/* Glows */}
      <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%",
        background:"radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)",
        top:"-20%", left:"-10%", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%",
        background:"radial-gradient(circle,rgba(14,165,233,0.08) 0%,transparent 70%)",
        bottom:"-15%", right:"-8%", pointerEvents:"none" }}/>

      {/* Left panel */}
      <div style={{
        width:"45%", minHeight:"100vh", padding:"48px 52px",
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        borderRight:"1px solid rgba(255,255,255,0.05)",
        position:"relative",
      }}>
        {/* Brand */}
        <div style={{ animation:"fadeUp 0.5s ease" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:0 }}>
            <div style={{
              width:42, height:42, borderRadius:12,
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, boxShadow:"0 4px 20px rgba(99,102,241,0.4)",
            }}>🎓</div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800,
                color:"#f0f4ff", letterSpacing:"-0.02em" }}>ExamSeat Pro</div>
              <div style={{ fontSize:11, color:"#3d4a6b", fontWeight:500,
                letterSpacing:"0.06em", textTransform:"uppercase" }}>Hall Allocation System</div>
            </div>
          </div>
        </div>

        {/* Center illustration area */}
        <div style={{ flex:1, display:"flex", flexDirection:"column",
          justifyContent:"center", paddingTop:40, paddingBottom:40 }}>
          <div style={{ animation:"fadeUp 0.7s ease" }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em",
              textTransform:"uppercase", color:"#3d4a6b", marginBottom:12 }}>
              ── PORTAL ACCESS
            </div>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:38, fontWeight:800,
              color:"#f0f4ff", lineHeight:1.15, marginBottom:16, letterSpacing:"-0.03em" }}>
              Welcome to<br/>
              <span style={{ background:"linear-gradient(135deg,#a5b4fc,#6366f1)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                Exam Management
              </span>
            </h1>
            <p style={{ fontSize:14, color:"#3d4a6b", lineHeight:1.7, maxWidth:340 }}>
              Streamlined hall allocation and seating management for B.Tech examinations.
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display:"flex", gap:16, marginTop:40, animation:"fadeUp 0.9s ease" }}>
            {[
              { val:"1000+", label:"Students" },
              { val:"4",     label:"Roles" },
              { val:"Real-time", label:"Allocation" },
            ].map(s=>(
              <div key={s.label} style={{ flex:1, background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.06)", borderRadius:12,
                padding:"14px 12px", textAlign:"center" }}>
                <div style={{ fontSize:17, fontWeight:800, color:"#a5b4fc",
                  fontFamily:"'Syne',sans-serif" }}>{s.val}</div>
                <div style={{ fontSize:10, color:"#3d4a6b", marginTop:3,
                  textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize:11, color:"#2a3350", animation:"fadeUp 1s ease" }}>
          © 2025 ExamSeat Pro · Secure Access Portal
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        padding:"40px 32px",
      }}>
        <div style={{ width:"100%", maxWidth:420, animation:"fadeUp 0.6s ease" }}>
          {!role ? (
            <RoleSelector setRole={setRole} />
          ) : (
            <LoginForm
              role={role} setRole={setRole}
              loginData={loginData} setLoginData={setLoginData}
              loginError={loginError} handleLogin={handleLogin} loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Role selector ──────────────────────────────────────────────
function RoleSelector({ setRole }) {
  return (
    <div>
      <div style={{ marginBottom:32 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800,
          color:"#f0f4ff", letterSpacing:"-0.02em", marginBottom:6 }}>
          Choose your role
        </h2>
        <p style={{ fontSize:13, color:"#3d4a6b" }}>
          Select how you're accessing the system
        </p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {ROLES.map((r, i) => (
          <button
            key={r.key}
            className="role-card"
            onClick={()=>setRole(r.key)}
            style={{
              display:"flex", alignItems:"center", gap:14,
              padding:"15px 18px",
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:14, cursor:"pointer", textAlign:"left",
              transition:"all 0.2s ease",
              animation:`fadeUp ${0.4+i*0.1}s ease`,
              width:"100%",
            }}
            onMouseEnter={e=>{
              e.currentTarget.style.background=r.bg;
              e.currentTarget.style.borderColor=r.color+"55";
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.background="rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";
            }}
          >
            {/* Icon */}
            <div style={{
              width:44, height:44, borderRadius:12,
              background:r.bg, border:`1px solid ${r.color}30`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, flexShrink:0,
            }}>{r.emoji}</div>

            {/* Text */}
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#f0f4ff",
                marginBottom:2 }}>{r.label}</div>
              <div style={{ fontSize:12, color:"#3d4a6b" }}>{r.desc}</div>
            </div>

            {/* Badge + arrow */}
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px",
                background:r.bg, color:r.color, borderRadius:6,
                letterSpacing:"0.06em" }}>{r.short}</span>
              <span style={{ color:"#3d4a6b", fontSize:16 }}>›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Login form ─────────────────────────────────────────────────
function LoginForm({ role, setRole, loginData, setLoginData, loginError, handleLogin, loading }) {
  const [showPwd, setShowPwd] = useState(false);
  const [foc, setFoc] = useState(null);
  const meta = ROLE_META[role] || ROLE_META.admin;
  const r = ROLES.find(x=>x.key===role) || ROLES[1];

  const inpStyle = (key) => ({
    width:"100%", padding:"12px 14px", borderRadius:10,
    background:"rgba(255,255,255,0.04)",
    border:`1px solid ${foc===key ? r.color+"77" : "rgba(255,255,255,0.08)"}`,
    color:"#f0f4ff", fontSize:14, outline:"none",
    boxSizing:"border-box", fontFamily:"inherit",
    boxShadow: foc===key ? `0 0 0 3px ${r.color}18` : "none",
    transition:"all 0.2s",
    "--accent": r.color,
    "--accent-glow": r.color+"18",
  });

  const lbl = {
    display:"block", fontSize:11, fontWeight:700,
    letterSpacing:"0.08em", textTransform:"uppercase",
    color:"#3d4a6b", marginBottom:7,
  };

  return (
    <div>
      {/* Back */}
      <button onClick={()=>setRole(null)} style={{
        display:"flex", alignItems:"center", gap:6,
        background:"transparent", border:"none",
        color:"#3d4a6b", cursor:"pointer",
        fontSize:13, fontWeight:600, marginBottom:28, padding:0,
        transition:"color 0.2s",
      }}
        onMouseEnter={e=>e.currentTarget.style.color="#a5b4fc"}
        onMouseLeave={e=>e.currentTarget.style.color="#3d4a6b"}>
        ← All roles
      </button>

      {/* Role badge header */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
        <div style={{
          width:52, height:52, borderRadius:15,
          background:r.bg, border:`1px solid ${r.color}40`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:24,
        }}>{meta.emoji}</div>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800,
            color:"#f0f4ff", letterSpacing:"-0.02em" }}>{meta.label}</div>
          <div style={{ fontSize:12, color:"#3d4a6b", marginTop:2 }}>
            {role==="student" ? "Enter your roll number" : "Enter your credentials to continue"}
          </div>
        </div>
      </div>

      {/* Error */}
      {loginError && (
        <div style={{
          background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)",
          borderRadius:10, padding:"11px 14px", color:"#fca5a5",
          fontSize:13, marginBottom:20, display:"flex", gap:8, alignItems:"center",
        }}>
          <span>⚠️</span> {loginError}
        </div>
      )}

      {/* Fields */}
      <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:20 }}>
        {role==="student" ? (
          <div>
            <label style={lbl}>Roll Number</label>
            <input
              value={loginData.roll}
              onChange={e=>setLoginData(p=>({...p,roll:e.target.value}))}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              onFocus={()=>setFoc("roll")} onBlur={()=>setFoc(null)}
              placeholder="e.g. 25005A0501"
              style={inpStyle("roll")}
            />
          </div>
        ) : (
          <>
            <div>
              <label style={lbl}>Username</label>
              <input
                value={loginData.username}
                onChange={e=>setLoginData(p=>({...p,username:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                onFocus={()=>setFoc("user")} onBlur={()=>setFoc(null)}
                placeholder={`Enter ${role} username`}
                autoComplete="username"
                style={inpStyle("user")}
              />
            </div>
            <div>
              <label style={lbl}>Password</label>
              <div style={{ position:"relative" }}>
                <input
                  type={showPwd?"text":"password"}
                  value={loginData.password}
                  onChange={e=>setLoginData(p=>({...p,password:e.target.value}))}
                  onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                  onFocus={()=>setFoc("pwd")} onBlur={()=>setFoc(null)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ ...inpStyle("pwd"), paddingRight:44 }}
                />
                <button onClick={()=>setShowPwd(p=>!p)} style={{
                  position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer",
                  color:"#3d4a6b", fontSize:16, padding:2,
                  transition:"color 0.2s",
                }}
                  onMouseEnter={e=>e.currentTarget.style.color="#a5b4fc"}
                  onMouseLeave={e=>e.currentTarget.style.color="#3d4a6b"}>
                  {showPwd?"🙈":"👁️"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sign in button */}
      <button
        className="sign-btn"
        onClick={handleLogin}
        disabled={loading}
        style={{
          width:"100%", padding:"13px",
          borderRadius:12, border:"none",
          background: loading ? "#1e2235" : `linear-gradient(135deg,${r.color},${r.color}cc)`,
          color: loading ? "#3d4a6b" : "#fff",
          fontWeight:700, fontSize:15, cursor: loading?"not-allowed":"pointer",
          transition:"all 0.2s", letterSpacing:"0.01em",
          boxShadow: loading ? "none" : `0 4px 20px ${r.color}40`,
        }}>
        {loading ? "Signing in…" : `Sign in as ${r.label}`}
      </button>

      {/* Divider + demo hint */}
      {role!=="student" && (
        <div style={{ marginTop:18, textAlign:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }}/>
            <span style={{ fontSize:11, color:"#2a3350", fontWeight:600,
              letterSpacing:"0.06em" }}>DEMO</span>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }}/>
          </div>
          <div style={{ display:"inline-flex", gap:6, alignItems:"center",
            background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:8, padding:"7px 14px" }}>
            {{
              developer: <><Code>dev</Code><Sep/>Password: <Code>dev@123</Code></>,
              admin:     <><Code>admin</Code><Sep/>Password: <Code>admin123</Code></>,
              staff:     <><Code>staff</Code><Sep/>Password: <Code>staff123</Code></>,
            }[role]}
          </div>
        </div>
      )}
    </div>
  );
}

function Code({ children }) {
  return <span style={{ fontFamily:"monospace", color:"#a5b4fc", fontSize:12, fontWeight:600 }}>{children}</span>;
}
function Sep() {
  return <span style={{ color:"#2a3350", fontSize:11 }}>·</span>;
}

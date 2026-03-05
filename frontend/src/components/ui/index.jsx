import React from "react";
import Icon from "./Icon";
import { inputStyle, labelStyle, btnStyle } from "../../constants/styles";

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
      <div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800,
          background:"linear-gradient(135deg,#f8fafc,#94a3b8)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>
          {title}
        </h1>
        <p style={{ color:"#475569", fontSize:14 }}>{subtitle}</p>
      </div>
      {children && <div style={{ display:"flex", gap:10, flexShrink:0 }}>{children}</div>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ title, children }) {
  return (
    <div style={{ background:"#151825", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"22px 24px" }}>
      <h3 style={{ fontSize:15, fontWeight:700, color:"#e2e8f0", marginBottom:16 }}>{title}</h3>
      {children}
    </div>
  );
}

// ─── FormCard ─────────────────────────────────────────────────────────────────
export function FormCard({ title, icon, color, children }) {
  return (
    <div style={{ background:"#151825", border:"1px solid rgba(255,255,255,0.07)",
      borderRadius:16, padding:"22px 24px", borderTop:`2px solid ${color}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
        <div style={{ width:32, height:32, borderRadius:10, background:`${color}22`,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon name={icon} size={16} color={color}/>
        </div>
        <h3 style={{ fontSize:14, fontWeight:700, color:"#e2e8f0" }}>{title}</h3>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>{children}</div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:9998,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#151825", border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:20, padding:"28px", width:"100%", maxWidth:460, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h2 style={{ fontWeight:700, fontSize:18 }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#64748b", fontSize:22 }}>✕</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inputStyle}/>
    </div>
  );
}

// ─── StepBar ─────────────────────────────────────────────────────────────────
export function StepBar({ steps, currentStep, activeColor = "#6366f1" }) {
  return (
    <div style={{ display:"flex", gap:0, marginBottom:28, background:"#151825",
      border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, overflow:"hidden" }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ flex:1, padding:"14px 20px", display:"flex", alignItems:"center", gap:10,
          background: currentStep === s.n ? `${activeColor}26` : currentStep > s.n ? "rgba(16,185,129,0.08)" : "transparent",
          borderRight: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
          <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:12, fontWeight:700,
            background: currentStep > s.n ? "#10b981" : currentStep === s.n ? activeColor : "#1e2235",
            color:"#fff", flexShrink:0 }}>
            {currentStep > s.n ? "✓" : s.n}
          </div>
          <span style={{ fontSize:13, fontWeight:600,
            color: currentStep === s.n ? `${activeColor}dd` : currentStep > s.n ? "#34d399" : "#475569" }}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Notification Toast ───────────────────────────────────────────────────────
export function NotificationToast({ notification }) {
  if (!notification) return null;
  const bgMap = { error:"#ef4444", warning:"#f59e0b", info:"#0ea5e9", success:"#10b981" };
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:9999,
      background: bgMap[notification.type] || bgMap.success,
      color:"#fff", padding:"12px 20px", borderRadius:12, fontSize:14, fontWeight:600,
      boxShadow:"0 8px 30px rgba(0,0,0,0.4)", maxWidth:380, animation:"slideIn 0.3s ease" }}>
      {notification.msg}
    </div>
  );
}

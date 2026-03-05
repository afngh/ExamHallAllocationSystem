import React, { useState } from "react";
import Icon from "../ui/Icon";
import { PageHeader } from "../ui/index.jsx";
import { btnStyle } from "../../constants/styles";
import { MiniHallPreview } from "./HallPrimitives";
import HallLayoutView from "./HallLayoutView";
import AddExamHallForm from "./AddExamHallForm";
import { generateHallAllotmentPdf } from "../../utils/generatePdf";

export default function HallsPage({ halls, setHalls, hallStats, allocations, isAllocated, notify, role }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewHall, setViewHall]       = useState(null);
  const [pdfBusyId, setPdfBusyId]     = useState(null); // tracks which hall is generating PDF

  if (showAddForm) {
    return (
      <AddExamHallForm
        onBack={() => setShowAddForm(false)}
        onSave={hall => {
          setHalls(prev => [...prev, hall]);
          setShowAddForm(false);
          notify("✅ Exam hall added!");
        }}
        notify={notify}
      />
    );
  }

  if (viewHall) {
    return <HallLayoutView hall={viewHall} allocations={allocations} onBack={() => setViewHall(null)} />;
  }

  // ── Per-hall PDF download ──────────────────────────────────────────────
  const handleHallPdf = async (hall) => {
    if (!isAllocated) {
      notify("Run allocation first before downloading PDF.", "error");
      return;
    }
    setPdfBusyId(hall.id);
    try {
      await generateHallAllotmentPdf({
        halls: [hall],          // only THIS hall
        allocations,
        examName: "",
        examDate: "",
        session:  "",
      });
      notify(`📄 PDF for ${hall.name} downloaded.`);
    } catch (e) {
      notify("PDF generation failed: " + e.message, "error");
    } finally {
      setTimeout(() => setPdfBusyId(null), 1500);
    }
  };

  return (
    <div style={{ animation:"fadeUp 0.5s ease" }}>
      <PageHeader title="Exam Halls" subtitle={`${halls.length} halls configured`}>
        {role === "admin" && (
          <button onClick={() => setShowAddForm(true)} style={btnStyle("#6366f1")}>
            <Icon name="add" size={16} color="#fff"/> Add Exam Hall
          </button>
        )}
      </PageHeader>

      {halls.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          background: "#151825", borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🏛️</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>
            No halls configured yet
          </div>
          <div style={{ color: "#475569", fontSize: 13, marginBottom: 20 }}>
            Add exam halls to get started with allocation.
          </div>
          {role === "admin" && (
            <button onClick={() => setShowAddForm(true)} style={btnStyle("#6366f1")}>
              <Icon name="add" size={16} color="#fff"/> Add First Hall
            </button>
          )}
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
          {hallStats.map(h => (
            <HallCard
              key={h.id}
              hall={h}
              isAllocated={isAllocated}
              pdfBusy={pdfBusyId === h.id}
              onView={() => setViewHall(h)}
              onDownloadPdf={() => handleHallPdf(h)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Hall Card ────────────────────────────────────────────────────────────────
function HallCard({ hall: h, isAllocated, pdfBusy, onView, onDownloadPdf }) {
  return (
    <div style={{
      background: "#151825", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16, overflow: "hidden",
    }}>
      {/* Card header */}
      <div style={{ padding:"20px 22px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:"#f8fafc" }}>{h.name}</div>
            <div style={{ color:"#64748b", fontSize:12, marginTop:2 }}>Room {h.roomNo} · {h.floor}</div>
          </div>
          <span style={{
            background: h.benchType==="double" ? "rgba(14,165,233,0.15)" : "rgba(99,102,241,0.15)",
            color:      h.benchType==="double" ? "#38bdf8" : "#a5b4fc",
            padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700,
            textTransform:"uppercase", letterSpacing:"0.05em",
          }}>
            {h.benchType==="double" ? "Double Seater" : "Single Seater"}
          </span>
        </div>
        <MiniHallPreview hall={h} />
      </div>

      {/* Stats */}
      <div style={{ padding:"14px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:12 }}>
          {[
            { label:"Rows",     value: h.rows },
            { label:"Cols",     value: h.cols },
            { label:"Active",   value: (h.rows*h.cols)-(h.missingBenches||[]).length,
              accent: (h.missingBenches||[]).length > 0 },
            { label:"Capacity", value: h.capacity },
          ].map(s => (
            <div key={s.label} style={{ background:"#0c0e1a", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
              <div style={{ color:"#475569", fontSize:10, textTransform:"uppercase", marginBottom:3 }}>{s.label}</div>
              <div style={{ fontWeight:700, fontSize:15, color:s.accent?"#f59e0b":"#e2e8f0" }}>{s.value}</div>
              {s.label==="Active" && (h.missingBenches||[]).length > 0 && (
                <div style={{ fontSize:9, color:"#ef4444", marginTop:1 }}>−{(h.missingBenches||[]).length} missing</div>
              )}
            </div>
          ))}
        </div>

        {/* Occupancy bar */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <span style={{ fontSize:12, color:"#64748b" }}>{h.occupied}/{h.capacity} occupied</span>
          <span style={{ fontSize:12, fontWeight:600, color:h.pct>90?"#ef4444":h.pct>70?"#f59e0b":"#10b981" }}>{h.pct}%</span>
        </div>
        <div style={{ height:5, background:"#1e2235", borderRadius:3, overflow:"hidden", marginBottom:14 }}>
          <div style={{ height:"100%", borderRadius:3,
            background: h.pct>90?"#ef4444":h.pct>70?"#f59e0b":"#10b981",
            width:`${h.pct}%`, transition:"width 0.8s ease",
          }}/>
        </div>

        {/* Action buttons row */}
        <div style={{ display:"flex", gap:8 }}>
          {/* View layout */}
          <button onClick={onView} style={{
            flex:1, padding:"9px",
            background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)",
            borderRadius:8, color:"#a5b4fc", cursor:"pointer", fontSize:12, fontWeight:600,
          }}>
            <Icon name="search" size={13} color="#a5b4fc"/> View Layout
            {!isAllocated && <span style={{ color:"#475569", fontWeight:400 }}> (empty)</span>}
          </button>

          {/* Per-hall PDF download — only shown after allocation */}
          {isAllocated && (
            <button
              onClick={onDownloadPdf}
              disabled={pdfBusy}
              title={`Download PDF for ${h.name}`}
              style={{
                flex:1, padding:"9px",
                background: pdfBusy ? "rgba(239,68,68,0.05)" : "rgba(239,68,68,0.1)",
                border:"1px solid rgba(239,68,68,0.25)",
                borderRadius:8, color:"#f87171", cursor: pdfBusy ? "not-allowed" : "pointer",
                fontSize:12, fontWeight:600, opacity: pdfBusy ? 0.6 : 1,
                display:"flex", alignItems:"center", justifyContent:"center", gap:5,
              }}
            >
              <Icon name="download" size={13} color="#f87171"/>
              {pdfBusy ? "Generating…" : "PDF"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

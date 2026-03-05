import React, { useState } from "react";
import Icon from "../ui/Icon";
import { PageHeader, Card } from "../ui/index.jsx";
import { btnStyle } from "../../constants/styles";
import { generateHallAllotmentPdf } from "../../utils/generatePdf";

export default function ReportsPage({ allocations, halls, branchStats, isAllocated, notify }) {
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [session,  setSession]  = useState("");
  const [pdfBusy,  setPdfBusy]  = useState(false);

  // ── CSV export ────────────────────────────────────────────────────────────
  const downloadCSV = () => {
    if (!isAllocated) return notify("Generate allocation first!", "error");
    const headers = "Roll No,Name,Branch,Year,Hall,Seat No,Row,Col,Slot\n";
    const csvRows = allocations.map(a =>
      `${a.rollNo},${a.name},${a.branch},${a.year},${a.hallName},` +
      `${a.seatNumber},${a.row},${a.col},` +
      `${a.benchType === "double" ? (a.slot ?? 0) + 1 : "-"}`
    ).join("\n");
    const blob = new Blob([headers + csvRows], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const el   = document.createElement("a");
    el.href = url;
    el.download = "exam_allocation.csv";
    el.click();
    notify("CSV downloaded!");
  };

  // ── PDF export ────────────────────────────────────────────────────────────
  const handleGeneratePdf = async () => {
    if (!isAllocated)     return notify("Run allocation first!", "error");
    if (!halls.length)    return notify("No halls configured!", "error");
    setPdfBusy(true);
    try {
      await generateHallAllotmentPdf({ halls, allocations, examName, examDate, session });
      notify("📄 PDF downloaded — one page per hall.");
    } catch (e) {
      notify("PDF generation failed: " + e.message, "error");
    } finally {
      setTimeout(() => setPdfBusy(false), 1500);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ animation: "fadeUp 0.5s ease" }}>

      {/* Page header with action buttons */}
      <PageHeader title="Reports & Analytics" subtitle="Allocation summary and exports">
        <button onClick={downloadCSV} style={btnStyle("#10b981")}>
          <Icon name="download" size={16} color="#fff" /> Export CSV
        </button>
        <button
          onClick={handleGeneratePdf}
          disabled={pdfBusy || !isAllocated}
          style={{ ...btnStyle("#ef4444"), opacity: (!isAllocated || pdfBusy) ? 0.45 : 1 }}
        >
          <Icon name="report" size={16} color="#fff" />
          {pdfBusy ? "Preparing…" : "Generate PDF"}
        </button>
      </PageHeader>

      {/* PDF Options panel */}
      <div style={{
        background: "#151825",
        border: "1px solid rgba(255,255,255,0.07)",
        borderTop: "2px solid #ef4444",
        borderRadius: 16,
        padding: "18px 22px",
        marginBottom: 22,
      }}>
        {/* Panel heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "rgba(239,68,68,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="report" size={16} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>PDF Options</div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 1 }}>
              Optional details printed on every hall page header
            </div>
          </div>
        </div>

        {/* Input fields */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
        }}>
          <PdfField
            label="Exam / Subject Name"
            value={examName}
            onChange={setExamName}
            placeholder="e.g. B.Tech Sem 5 – Nov 2025"
          />
          <PdfField
            label="Exam Date"
            value={examDate}
            onChange={setExamDate}
            placeholder="e.g. 15-11-2025"
          />
          <PdfField
            label="Session"
            value={session}
            onChange={setSession}
            placeholder="e.g. FN (10:00 AM – 1:00 PM)"
          />
        </div>

        {/* Generate button + status */}
        <div style={{
          marginTop: 14, display: "flex", alignItems: "center",
          gap: 12, flexWrap: "wrap",
        }}>
          <button
            onClick={handleGeneratePdf}
            disabled={pdfBusy || !isAllocated}
            style={{
              ...btnStyle("#ef4444"),
              padding: "11px 24px", fontSize: 13,
              opacity: (!isAllocated || pdfBusy) ? 0.45 : 1,
            }}
          >
            <Icon name="report" size={16} color="#fff" />
            {pdfBusy
              ? "Preparing PDF…"
              : `Generate PDF (${halls.length} hall${halls.length !== 1 ? "s" : ""})`}
          </button>
          <span style={{ fontSize: 12, color: "#475569" }}>
            {isAllocated
              ? `${allocations.length} students · ${halls.length} halls · one page per hall`
              : "Run allocation first to enable PDF export."}
          </span>
        </div>
      </div>

      {/* Reports content */}
      {!isAllocated ? (
        <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>
          Run allocation first to view reports.
        </div>
      ) : (
        <>
          {/* Branch stats grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16, marginBottom: 24,
          }}>
            {branchStats.map(b => (
              <div key={b.branch} style={{
                background: "#151825",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14, padding: "18px 20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{
                    width: 12, height: 12, borderRadius: 3,
                    background: b.color, display: "inline-block",
                  }} />
                  <span style={{ fontWeight: 700, color: "#f8fafc" }}>{b.branch}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: b.color }}>{b.allocated}</div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                  of {b.total} allocated
                </div>
              </div>
            ))}
          </div>

          {/* Hall summary table */}
          <Card title="Hall-wise Summary">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Hall", "Room", "Bench Type", "Capacity", "Occupied", "Free"].map(h => (
                    <th key={h} style={{
                      padding: "10px 14px", textAlign: "left",
                      color: "#64748b", fontSize: 11, textTransform: "uppercase",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {halls.map(h => {
                  const occ = allocations.filter(a => a.hallId === h.id).length;
                  return (
                    <tr key={h.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "10px 14px", color: "#e2e8f0" }}>{h.name}</td>
                      <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{h.roomNo}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{
                          background: h.benchType === "double"
                            ? "rgba(14,165,233,0.15)" : "rgba(99,102,241,0.15)",
                          color: h.benchType === "double" ? "#38bdf8" : "#a5b4fc",
                          padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                        }}>
                          {h.benchType === "double" ? "Double" : "Single"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{h.capacity}</td>
                      <td style={{ padding: "10px 14px", color: "#10b981", fontWeight: 600 }}>{occ}</td>
                      <td style={{ padding: "10px 14px", color: "#f59e0b" }}>{h.capacity - occ}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}

// ── Small reusable input field ────────────────────────────────────────────────
function PdfField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{
        display: "block", color: "#64748b", fontSize: 11, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5,
      }}>
        {label}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "9px 12px",
          background: "#0c0e1a",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 9, color: "#e2e8f0", fontSize: 12, outline: "none",
        }}
      />
    </div>
  );
}

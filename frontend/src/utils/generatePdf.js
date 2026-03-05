/**
 * generateHallAllotmentPdf
 * ─────────────────────────────────────────────────────────────────────────────
 * Matches the physical university exam sheet format shown in the reference photo:
 *
 *  • All halls stacked top-to-bottom on the SAME page
 *  • Each hall = one centered bold heading + one flat register-number table
 *    + bench numbers in the top of every cell
 *  • Department summary box on the right of every table
 *  • If halls overflow a page, a new page starts automatically
 *  • A4 landscape, 150 dpi (good balance of sharpness vs file size)
 */

// ─── Page constants (A4 landscape @ 150 dpi) ─────────────────────────────────
const DPI      = 150;
const MM       = DPI / 25.4;

const PW       = Math.round(297 * MM);   // 1754 px  (landscape width)
const PH       = Math.round(210 * MM);   // 1240 px  (landscape height)
const MARGIN   = Math.round(8  * MM);    // 8 mm margin

// ─── Public entry point ───────────────────────────────────────────────────────

export async function generateHallAllotmentPdf({
  halls, allocations,
  examName = "", examDate = "", session = "",
}) {
  if (!halls?.length)       { alert("No halls configured."); return; }
  if (!allocations?.length) { alert("Run allocation first."); return; }

  // ── Measure each hall's rendered height on a dummy canvas ──────────────
  const pageGroups = [];   // array of pages; each page = array of hall indices
  let   currentGroup = [];
  let   usedH = 0;

  const availH = PH - MARGIN * 2;

  halls.forEach((hall, idx) => {
    const h = estimateHallHeight(hall, allocations);
    if (currentGroup.length > 0 && usedH + h > availH) {
      // Overflow — start a new page
      pageGroups.push(currentGroup);
      currentGroup = [idx];
      usedH = h;
    } else {
      currentGroup.push(idx);
      usedH += h;
    }
  });
  if (currentGroup.length) pageGroups.push(currentGroup);

  // ── Render each page ──────────────────────────────────────────────────
  const totalPages  = pageGroups.length;
  const jpegB64List = pageGroups.map((hallIndices, pageIdx) =>
    renderPage(
      hallIndices.map(i => halls[i]),
      allocations,
      { examName, examDate, session, pageNum: pageIdx + 1, totalPages }
    )
  );

  // ── Assemble and download ─────────────────────────────────────────────
  const pdfBytes = buildPdfBinary(jpegB64List);
  const blob     = new Blob([pdfBytes], { type: "application/pdf" });
  const url      = URL.createObjectURL(blob);
  const anchor   = document.createElement("a");
  anchor.href     = url;
  anchor.download = `Hall_Allotment${examName ? "_" + examName.replace(/\s+/g, "_") : ""}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => { anchor.remove(); URL.revokeObjectURL(url); }, 1500);
}

// ─── Height estimator ─────────────────────────────────────────────────────────

function estimateHallHeight(hall, allocations) {
  const rows     = Math.max(1, hall.rows  || 6);
  const CELL_H   = Math.round(11 * MM);
  const HEADING  = Math.round(7  * MM);
  const GAP      = Math.round(3  * MM);
  return HEADING + rows * CELL_H + GAP;
}

// ─── Page renderer ────────────────────────────────────────────────────────────

function renderPage(hallsOnPage, allocations, meta) {
  const { examName, examDate, session, pageNum, totalPages } = meta;

  const canvas  = document.createElement("canvas");
  canvas.width  = PW;
  canvas.height = PH;
  const ctx     = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, PW, PH);

  let curY    = MARGIN;
  const usableW = PW - MARGIN * 2;

  // ── Document header (first page only) ──────────────────────────────────
  if (pageNum === 1 && (examName || examDate || session)) {
    const parts = [examName, examDate, session].filter(Boolean);
    ctx.fillStyle    = "#000000";
    ctx.font         = `bold ${Math.round(4.5 * MM)}px Arial`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(parts.join("   |   "), PW / 2, curY + Math.round(3 * MM));
    curY += Math.round(8 * MM);
  }

  // ── Draw each hall ──────────────────────────────────────────────────────
  hallsOnPage.forEach((hall, hallIdx) => {
    curY = drawHall(ctx, hall, allocations, curY, usableW);
  });

  // ── Page footer ────────────────────────────────────────────────────────
  const footerY = PH - MARGIN - Math.round(5 * MM);
  ctx.strokeStyle = "#aaaaaa";
  ctx.lineWidth   = 0.5;
  ctx.beginPath(); ctx.moveTo(MARGIN, footerY); ctx.lineTo(MARGIN + usableW, footerY); ctx.stroke();

  ctx.fillStyle    = "#444444";
  ctx.font         = `${Math.round(2.5 * MM)}px Arial`;
  ctx.textBaseline = "top";
  ctx.textAlign    = "left";
  ctx.fillText("Hall In-charge: ______________________", MARGIN, footerY + Math.round(1.5 * MM));
  ctx.textAlign = "center";
  ctx.fillText("Chief Superintendent: ______________________", PW / 2, footerY + Math.round(1.5 * MM));
  ctx.textAlign = "right";
  ctx.fillText(`Page ${pageNum} of ${totalPages}`, MARGIN + usableW, footerY + Math.round(1.5 * MM));

  return canvas.toDataURL("image/jpeg", 0.95).split(",")[1];
}

// ─── Draw one hall (heading + table + dept summary) ──────────────────────────

function drawHall(ctx, hall, allocations, startY, usableW) {
  const rows          = Math.max(1, hall.rows  || 6);
  const cols          = Math.max(1, hall.cols  || 8);
  const isDouble      = hall.benchType === "double";
  const spotsPerBench = isDouble ? 2 : 1;
  const displayCols   = cols * spotsPerBench;

  // ── Build seat map: benchIdx → { slot → rollNo } ──────────────────────
  const hallAllocs = allocations
    .filter(a => a.hallId === hall.id)
    .sort((a, b) => a.seatNumber - b.seatNumber);

  const benchMap = {};
  hallAllocs.forEach(a => {
    const bIdx = (a.row - 1) * cols + (a.col - 1);
    if (!benchMap[bIdx]) benchMap[bIdx] = {};
    benchMap[bIdx][a.slot ?? 0] = a.rollNo || "";
  });

  // ── Branch counts ──────────────────────────────────────────────────────
  const branchCounts = {};
  hallAllocs.forEach(a => {
    branchCounts[a.branch] = (branchCounts[a.branch] || 0) + 1;
  });
  const deptStr = Object.entries(branchCounts)
    .map(([b, n]) => `${b}: ${n}`)
    .join("  &  ");

  // ── Layout ────────────────────────────────────────────────────────────
  const HEADING_H  = Math.round(7  * MM);
  const CELL_H     = Math.round(11 * MM);
  const BENCH_H    = Math.round(4  * MM);   // bench-number badge height inside cell
  const DEPT_W     = Math.round(26 * MM);
  const DEPT_GAP   = Math.round(2  * MM);
  const tableW     = usableW - DEPT_W - DEPT_GAP;
  const CELL_W     = Math.floor(tableW / displayCols);
  const actualW    = CELL_W * displayCols;
  const tableH     = rows * CELL_H;
  const tableX     = MARGIN;
  const deptX      = tableX + actualW + DEPT_GAP;

  // ── Hall heading ───────────────────────────────────────────────────────
  const hallLabel = `${hall.name.toUpperCase()}${hall.roomNo ? " - " + hall.roomNo : ""}`;
  ctx.fillStyle    = "#000000";
  ctx.font         = `bold ${Math.round(4 * MM)}px Arial`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(hallLabel, tableX + actualW / 2, startY + HEADING_H / 2);
  startY += HEADING_H;

  // ── Table cells ────────────────────────────────────────────────────────
  const regFontPx   = Math.max(10, Math.round(CELL_H * 0.30));
  const benchFontPx = Math.max(8,  Math.round(BENCH_H * 0.55));

  for (let r = 0; r < rows; r++) {
    for (let dc = 0; dc < displayCols; dc++) {
      const benchCol = isDouble ? Math.floor(dc / 2) : dc;
      const slot     = isDouble ? dc % 2 : 0;
      const benchIdx = r * cols + benchCol;
      const benchNum = benchIdx + 1;
      const rollNo   = benchMap[benchIdx]?.[slot] ?? "";

      const cellX = tableX + dc * CELL_W;
      const cellY = startY + r  * CELL_H;

      // Cell background — alternating rows
      ctx.fillStyle = r % 2 === 1 ? "#eeeeee" : "#ffffff";
      ctx.fillRect(cellX, cellY, CELL_W, CELL_H);

      // Bench number badge (pale blue strip at top of cell)
      ctx.fillStyle = "#dce8f5";
      ctx.fillRect(cellX + 1, cellY + 1, CELL_W - 2, BENCH_H - 1);

      ctx.fillStyle    = "#1a3a5c";
      ctx.font         = `bold ${benchFontPx}px Arial`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      const label = isDouble
        ? `${benchNum}${slot === 0 ? "L" : "R"}`
        : `${benchNum}`;
      ctx.fillText(label, cellX + CELL_W / 2, cellY + BENCH_H / 2);

      // Register number
      if (rollNo) {
        ctx.fillStyle    = "#000000";
        ctx.font         = `bold ${regFontPx}px Arial`;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";

        // Fit text within cell width
        let display = rollNo;
        ctx.font = `bold ${regFontPx}px Arial`;
        const maxW = CELL_W - 4;
        while (ctx.measureText(display).width > maxW && display.length > 4) {
          display = display.slice(1);
        }
        ctx.fillText(display, cellX + CELL_W / 2, cellY + BENCH_H + (CELL_H - BENCH_H) / 2);
      }

      // Cell border
      ctx.strokeStyle = "#aaaaaa";
      ctx.lineWidth   = 0.5;
      ctx.strokeRect(cellX, cellY, CELL_W, CELL_H);
    }
  }

  // Stronger row separators
  ctx.strokeStyle = "#666666";
  ctx.lineWidth   = 0.7;
  for (let r = 1; r < rows; r++) {
    const y = startY + r * CELL_H;
    ctx.beginPath(); ctx.moveTo(tableX, y); ctx.lineTo(tableX + actualW, y); ctx.stroke();
  }

  // Bench-group separators for double benches
  if (isDouble) {
    ctx.strokeStyle = "#333333";
    ctx.lineWidth   = 1;
    for (let bc = 1; bc < cols; bc++) {
      const x = tableX + bc * 2 * CELL_W;
      ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, startY + tableH); ctx.stroke();
    }
  }

  // Outer border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth   = 1.5;
  ctx.strokeRect(tableX, startY, actualW, tableH);

  // ── Department summary box ────────────────────────────────────────────
  ctx.fillStyle   = "#f5f5f5";
  ctx.fillRect(deptX, startY, DEPT_W, tableH);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth   = 1.2;
  ctx.strokeRect(deptX, startY, DEPT_W, tableH);

  ctx.fillStyle    = "#000000";
  ctx.font         = `bold ${Math.round(3 * MM)}px Arial`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";

  // Split dept string across lines if needed
  const deptLines = Object.entries(branchCounts)
    .map(([b, n]) => `${b}: ${n}`);
  const lineH = Math.min(Math.round(4.5 * MM), tableH / (deptLines.length + 1));
  const totalTextH = deptLines.length * lineH;
  let deptY = startY + (tableH - totalTextH) / 2 + lineH / 2;

  deptLines.forEach(line => {
    ctx.fillText(line, deptX + DEPT_W / 2, deptY);
    deptY += lineH;
  });

  return startY + tableH + Math.round(3 * MM);  // return new curY with gap
}

// ─── PDF binary assembler ─────────────────────────────────────────────────────

function buildPdfBinary(jpegB64List) {
  const PAGE_W = 842;  // A4 landscape in PDF points
  const PAGE_H = 595;
  const N      = jpegB64List.length;

  const segments  = [];
  const objOffset = [];
  let   off       = 0;
  const enc       = new TextEncoder();

  const pt = (str) => { segments.push({ text: str }); off += enc.encode(str).length; };
  const pb = (arr) => { segments.push({ bytes: arr }); off += arr.length; };
  const mk = (n)   => { objOffset[n] = off; };

  pt("%PDF-1.4\n");
  pb(new Uint8Array([0x25, 0xFF, 0xFF, 0xFF, 0xFF, 0x0A]));

  const iO  = (i) => 3 + i * 3;
  const cO  = (i) => 3 + i * 3 + 1;
  const pO  = (i) => 3 + i * 3 + 2;
  const tot = 2 + N * 3;
  const pgs = [];

  for (let i = 0; i < N; i++) {
    const jb     = base64ToBytes(jpegB64List[i]);
    const { w, h } = readJpegDimensions(jb);

    mk(iO(i));
    pt(`${iO(i)} 0 obj\n<</Type /XObject /Subtype /Image /Width ${w} /Height ${h}\n/ColorSpace /DeviceRGB /BitsPerComponent 8\n/Filter /DCTDecode /Length ${jb.length}>>\nstream\n`);
    pb(jb);
    pt(`\nendstream\nendobj\n`);

    const cs = `q\n${PAGE_W} 0 0 ${PAGE_H} 0 0 cm\n/Img${i} Do\nQ\n`;
    mk(cO(i));
    pt(`${cO(i)} 0 obj\n<</Length ${cs.length}>>\nstream\n${cs}endstream\nendobj\n`);

    pgs.push(pO(i));
    mk(pO(i));
    pt(`${pO(i)} 0 obj\n<</Type /Page /Parent 2 0 R\n/MediaBox [0 0 ${PAGE_W} ${PAGE_H}]\n/Contents ${cO(i)} 0 R\n/Resources <</XObject <</Img${i} ${iO(i)} 0 R>>>>>>\nendobj\n`);
  }

  mk(2); pt(`2 0 obj\n<</Type /Pages /Kids [${pgs.map(n=>`${n} 0 R`).join(" ")}] /Count ${N}>>\nendobj\n`);
  mk(1); pt(`1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj\n`);

  const xs = off;
  let xref = `xref\n0 ${tot+1}\n0000000000 65535 f \n`;
  for (let n = 1; n <= tot; n++) xref += `${(objOffset[n]??0).toString().padStart(10,"0")} 00000 n \n`;
  xref += `trailer\n<</Size ${tot+1} /Root 1 0 R>>\nstartxref\n${xs}\n%%EOF\n`;
  pt(xref);

  const len = segments.reduce((s,g) => s + (g.bytes ? g.bytes.length : enc.encode(g.text).length), 0);
  const out = new Uint8Array(len);
  let   pos = 0;
  for (const g of segments) {
    const c = g.bytes ?? enc.encode(g.text);
    out.set(c, pos); pos += c.length;
  }
  return out;
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function readJpegDimensions(bytes) {
  let i = 2;
  while (i < bytes.length - 8) {
    if (bytes[i] !== 0xFF) break;
    const m = bytes[i + 1];
    if (m >= 0xC0 && m <= 0xC2) return { w: (bytes[i+7]<<8)|bytes[i+8], h: (bytes[i+5]<<8)|bytes[i+6] };
    if (m === 0xD9 || m === 0xDA) break;
    i += 2 + ((bytes[i+2]<<8)|bytes[i+3]);
  }
  return { w: PW, h: PH };
}

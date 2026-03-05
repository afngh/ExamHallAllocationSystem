export const inputStyle = {
  width:"100%", padding:"10px 14px", background:"#0c0e1a",
  border:"1px solid rgba(255,255,255,0.1)", borderRadius:10,
  color:"#e2e8f0", fontSize:13, outline:"none", boxSizing:"border-box"
};

export const labelStyle = {
  display:"block", color:"#64748b", fontSize:12, fontWeight:600,
  textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6
};

export const hintStyle = { color:"#374151", fontSize:11, marginTop:5 };

export const btnStyle = (bg) => ({
  display:"inline-flex", alignItems:"center", gap:8,
  padding:"10px 18px", background:bg, border:"none",
  borderRadius:10, color:"#fff", cursor:"pointer",
  fontWeight:600, fontSize:13, transition:"opacity 0.2s ease"
});

import React from "react";
import Icon from "../ui/Icon";

const DEVELOPER_NAV = [
  { id:"developer", label:"Admin Panel", icon:"settings" },
];

const ADMIN_NAV = [
  { id:"dashboard",   label:"Dashboard",    icon:"dashboard" },
  { id:"datamanager", label:"Data Manager", icon:"upload"    },
  { id:"students",    label:"Students",     icon:"students"  },
  { id:"halls",       label:"Exam Halls",   icon:"hall"      },
  { id:"allocate",    label:"Allocation",   icon:"allocate"  },
  { id:"reports",     label:"Reports",      icon:"report"    },
];

const STAFF_NAV = [
  { id:"dashboard", label:"Dashboard",    icon:"dashboard" },
  { id:"halls",     label:"Exam Halls",   icon:"hall"      },
  { id:"allocate",  label:"View Seating", icon:"allocate"  },
  { id:"reports",   label:"Reports",      icon:"report"    },
];

const ROLE_GRADIENT = {
  developer: "linear-gradient(135deg,#f59e0b,#d97706)",
  admin:     "linear-gradient(135deg,#6366f1,#8b5cf6)",
  staff:     "linear-gradient(135deg,#0ea5e9,#38bdf8)",
  student:   "linear-gradient(135deg,#10b981,#34d399)",
};

export default function Sidebar({ collapsed, setCollapsed, activePage, setActivePage, role, onLogout, user }) {
  const isStudent   = role === "student";
  const isDeveloper = role === "developer";

  const nav =
    isDeveloper ? DEVELOPER_NAV :
    role === "admin" ? ADMIN_NAV :
    role === "staff" ? STAFF_NAV :
    [];

  const w = isStudent ? 72 : (collapsed ? 72 : 240);

  return (
    <aside style={{
      width: w, minWidth: w, height: "100vh", background: "#111320",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex", flexDirection: "column",
      transition: "width 0.25s ease", overflow: "hidden",
      position: "relative", zIndex: 10, flexShrink: 0,
    }}>

      {/* Brand */}
      <div style={{
        padding: "24px 16px 20px", display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon name="examdesk" size={22} color="#fff"/>
        </div>

        {!collapsed && !isStudent && (
          <div>
            <div style={{
              fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15,
              background: "linear-gradient(135deg,#a5b4fc,#c4b5fd)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>ExamSeat</div>
            <div style={{ color: "#475569", fontSize: 11 }}>Pro v2.0</div>
          </div>
        )}

        {!isStudent && (
          <button onClick={() => setCollapsed(!collapsed)} style={{
            marginLeft: "auto", background: "none", border: "none",
            cursor: "pointer", color: "#64748b", padding: 4,
            display: "flex", flexShrink: 0,
          }}>
            <span style={{ fontSize: 18 }}>{collapsed ? "›" : "‹"}</span>
          </button>
        )}
      </div>

      {/* User info */}
      <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: ROLE_GRADIENT[role] || ROLE_GRADIENT.staff,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff",
          }}>
            {(user.name || user.username || "?")[0]?.toUpperCase()}
          </div>
          {!collapsed && !isStudent && (
            <div style={{ overflow: "hidden" }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: "#e2e8f0",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{user.name || user.username}</div>
              <div style={{
                fontSize: 11, color: "#475569",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>{role}</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        {nav.map(item => (
          <NavItem key={item.id} item={item}
            isActive={activePage === item.id}
            collapsed={collapsed || isStudent}
            onClick={() => setActivePage(item.id)}
          />
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onLogout} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "11px 12px", borderRadius: 10, border: "none", cursor: "pointer",
          background: "transparent", color: "#ef4444", transition: "background 0.15s ease",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <Icon name="logout" size={18} color="#ef4444"/>
          {!collapsed && !isStudent && (
            <span style={{ fontSize: 14, fontWeight: 500 }}>Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}

function NavItem({ item, isActive, collapsed, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12,
      padding: "11px 12px", borderRadius: 10, border: "none", cursor: "pointer",
      background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
      color: isActive ? "#a5b4fc" : "#64748b",
      marginBottom: 2, transition: "all 0.15s ease", textAlign: "left",
      borderLeft: isActive ? "2px solid #6366f1" : "2px solid transparent",
    }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      <Icon name={item.icon} size={18} color={isActive ? "#a5b4fc" : "#64748b"}/>
      {!collapsed && (
        <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
      )}
    </button>
  );
}
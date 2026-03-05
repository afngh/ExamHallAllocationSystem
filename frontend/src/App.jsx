// src/App.jsx
import { useState, useEffect } from "react";
import { useNotification } from "./hooks/useNotification";
import { useAuth } from "./hooks/useAuth";
import { ALGORITHM_REGISTRY, DEFAULT_ALGORITHM } from "./utils/algorithms";
import { BRANCH_COLORS } from "./constants/index";

import LoginScreen     from "./components/auth/LoginScreen";
import Sidebar         from "./components/layout/Sidebar";
import { NotificationToast } from "./components/ui/index.jsx";
import DeveloperPanel  from "./components/developer/DeveloperPanel";

import Dashboard       from "./components/dashboard/Dashboard";
import StudentsPage    from "./components/students/StudentsPage";
import HallsPage       from "./components/halls/HallsPage";
import AllocatePage    from "./components/allocate/AllocatePage";
import ReportsPage     from "./components/reports/ReportsPage";
import DataManagerPage from "./components/datamanager/DataManagerPage";
import { AlgorithmPage, SchemaPage, StudentView } from "./components/misc/index.jsx";

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-track { background:#1a1d2e; }
  ::-webkit-scrollbar-thumb { background:#334155; border-radius:3px; }
  input, select, button, textarea { font-family:inherit; }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
  @keyframes slideIn { from{transform:translateX(40px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes fadeUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
`;

export default function App() {
  const [students,         setStudents]         = useState([]);
  const [halls,            setHalls]            = useState([]);
  const [allocations,      setAllocations]      = useState([]);
  const [isAllocated,      setIsAllocated]      = useState(false);
  const [activePage,       setActivePage]       = useState("dashboard");
  const [selectedHall,     setSelectedHall]     = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [allocStats,       setAllocStats]       = useState(null);

  const { notification, notify } = useNotification();
  const {
    role, setRole, loginData, setLoginData, loginError,
    loading: authLoading, currentUser, handleLogin, handleLogout,
  } = useAuth();

  // Set default page when role changes — no API calls needed
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "developer") setActivePage("developer");
    else setActivePage("dashboard");
  }, [currentUser]);

  // ── Allocation ────────────────────────────────────────────────
  const handleAllocate = (algoKey = DEFAULT_ALGORITHM, filteredStudents, filteredHalls, onInsufficientCapacity) => {
    if ((filteredHalls||halls).length === 0) { notify("Add exam halls first!", "error"); return; }
    const checkStudents = filteredStudents || students;
    const checkHalls    = filteredHalls    || halls;
    const totalCapacity = checkHalls.reduce((s, h) => s + h.capacity, 0);
    if (totalCapacity < checkStudents.length) {
      notify(
        `Hall capacity (${totalCapacity}) is less than students (${checkStudents.length}). Add more halls or skip some groups.`,
        "error"
      );
      if (typeof onInsufficientCapacity === "function") onInsufficientCapacity();
      return;
    }
    const algo = ALGORITHM_REGISTRY[algoKey] || ALGORITHM_REGISTRY[DEFAULT_ALGORITHM];
    const useStudents = filteredStudents || students;
    const useHalls    = filteredHalls    || halls;
    const t0 = performance.now();
    const result = algo.fn(useStudents, useHalls);
    const latencyMs = +(performance.now() - t0).toFixed(3);

    setAllocations(result);
    setIsAllocated(true);
    setAllocStats({
      latencyMs,
      studentCount: result.length,
      hallCount:    useHalls.length,
      algoKey,
      algoLabel:    algo.label,
      timestamp:    new Date().toLocaleTimeString(),
    });
    notify(`[${algo.label}] Allocated ${result.length} students across ${halls.length} halls!`);
  };

  const handleReset = () => {
    setAllocations([]);
    setIsAllocated(false);
    setAllocStats(null);
    notify("Allocation reset.", "info");
  };

  const handleLogoutAndReset = () => {
    handleLogout();
    // Keep students, halls, allocations — data persists across logout/login
    setActivePage("dashboard");
  };

  // ── Derived stats ─────────────────────────────────────────────
  const activeBranches = [...new Set(students.map(s => s.branch))];
  const branchStats = activeBranches.map(b => ({
    branch:    b,
    total:     students.filter(s => s.branch === b).length,
    allocated: allocations.filter(a => a.branch === b).length,
    color:     BRANCH_COLORS[b] || "#64748b",
  }));
  const hallStats = halls.map(h => ({
    ...h,
    occupied: allocations.filter(a => a.hallId === h.id).length,
    pct: Math.round((allocations.filter(a => a.hallId === h.id).length / (h.capacity || 1)) * 100),
  }));

  const totalStudents  = students.length;
  const totalHalls     = halls.length;
  const allocatedCount = allocations.length;
  const totalCapacity  = halls.reduce((s, h) => s + h.capacity, 0);

  // ── Not logged in ─────────────────────────────────────────────
  if (!currentUser) {
    return (
      <LoginScreen
        role={role} setRole={setRole}
        loginData={loginData} setLoginData={setLoginData}
        loginError={loginError} handleLogin={handleLogin}
        loading={authLoading}
      />
    );
  }

  const studentAllocation = currentUser.role === "student"
    ? allocations.find(a => a.rollNo === currentUser.rollNo)
    : null;

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'DM Sans','Segoe UI',sans-serif", background:"#0c0e1a", color:"#e2e8f0" }}>
      <style>{GLOBAL_STYLES}</style>
      <NotificationToast notification={notification} />

      <Sidebar
        collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed}
        activePage={activePage} setActivePage={setActivePage}
        role={currentUser.role} onLogout={handleLogoutAndReset} user={currentUser}
      />

      <main style={{ flex:1, overflow:"auto", padding:"28px 32px" }}>
        {currentUser.role === "student" ? (
          <StudentView user={currentUser} allocation={studentAllocation} isAllocated={isAllocated} />
        ) : currentUser.role === "developer" ? (
          <DeveloperPanel notify={notify} />
        ) : (
          <PageRouter
            activePage={activePage} setActivePage={setActivePage}
            students={students} setStudents={setStudents}
            halls={halls} setHalls={setHalls}
            allocations={allocations} isAllocated={isAllocated}
            hallStats={hallStats} branchStats={branchStats}
            totalStudents={totalStudents} totalHalls={totalHalls}
            allocatedCount={allocatedCount} totalCapacity={totalCapacity}
            selectedHall={selectedHall} setSelectedHall={setSelectedHall}
            onAllocate={handleAllocate} onReset={handleReset}
            notify={notify} role={currentUser.role}
            allocStats={allocStats}
          />
        )}
      </main>
    </div>
  );
}

function PageRouter({
  activePage, setActivePage,
  students, setStudents, halls, setHalls,
  allocations, isAllocated, hallStats, branchStats,
  totalStudents, totalHalls, allocatedCount, totalCapacity,
  selectedHall, setSelectedHall,
  onAllocate, onReset, notify, role,
  allocStats,
}) {
  switch (activePage) {
    case "dashboard":
      return (
        <Dashboard
          totalStudents={totalStudents} totalHalls={totalHalls}
          allocatedCount={allocatedCount} totalCapacity={totalCapacity}
          branchStats={branchStats} hallStats={hallStats}
          isAllocated={isAllocated} setActivePage={setActivePage}
        />
      );
    case "students":
      return (
        <StudentsPage
          students={students} setStudents={setStudents}
          notify={notify} role={role}
        />
      );
    case "halls":
      return (
        <HallsPage
          halls={halls} setHalls={setHalls} hallStats={hallStats}
          allocations={allocations} isAllocated={isAllocated}
          notify={notify} role={role}
        />
      );
    case "allocate":
      return (
        <AllocatePage
          halls={halls} students={students}
          allocations={allocations} isAllocated={isAllocated}
          onAllocate={(algoKey, filteredStudents, filteredHalls) => onAllocate(algoKey, filteredStudents, filteredHalls, () => setActivePage("halls"))}
          onReset={onReset}
          selectedHall={selectedHall} setSelectedHall={setSelectedHall}
          role={role}
          allocStats={allocStats}
        />
      );
    case "reports":
      return (
        <ReportsPage
          allocations={allocations} halls={halls}
          branchStats={branchStats} isAllocated={isAllocated}
          notify={notify}
        />
      );
    case "datamanager":
      return (
        <DataManagerPage
          students={students} setStudents={setStudents}
          halls={halls} setHalls={setHalls}
          notify={notify}
        />
      );
    case "algorithm": return <AlgorithmPage />;
    case "schema":    return <SchemaPage />;
    default:          return null;
  }
}
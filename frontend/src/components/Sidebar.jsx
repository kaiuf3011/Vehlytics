import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  LayoutDashboard, Truck, BarChart3, Bell, Calendar,
  Zap, LogOut, Wifi, WifiOff
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Truck, label: "Fleet", path: "/fleet" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Bell, label: "Alerts", path: "/alerts" },
  { icon: Calendar, label: "Schedule", path: "/schedule" },
];

export default function Sidebar({ connected }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "FM";

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ display: "flex", alignItems: "center" }}><Truck size={22} color="#fff" /></div>
        <div>
          <div className="sidebar-logo-text">FleetMind</div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 1 }}>AI Platform v1.0</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            className={`nav-item ${location.pathname === path ? "active" : ""}`}
            onClick={() => navigate(path)}
          >
            <Icon size={16} className="nav-icon" />
            {label}
          </button>
        ))}

        <div className="nav-section-title" style={{ marginTop: 24 }}>System</div>
        <div className="nav-item" style={{ cursor: "default" }}>
          {connected ? (
            <><Wifi size={16} style={{ color: "var(--emerald)" }} />
              <span style={{ color: "var(--emerald)", fontSize: "0.8rem" }}>Live Connected</span></>
          ) : (
            <><WifiOff size={16} style={{ color: "var(--red)" }} />
              <span style={{ color: "var(--red)", fontSize: "0.8rem" }}>Reconnecting...</span></>
          )}
        </div>
        <div className="nav-item" style={{ cursor: "default" }}>
          <Zap size={16} style={{ color: "var(--amber)" }} />
          <span style={{ fontSize: "0.78rem" }}>AI Engine Active</span>
        </div>
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={logout} title="Logout">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name truncate">{user?.name || "Fleet Admin"}</div>
            <div className="user-role">{user?.role || "admin"} · click to logout</div>
          </div>
          <LogOut size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}

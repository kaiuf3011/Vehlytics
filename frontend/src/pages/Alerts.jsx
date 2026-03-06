import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { socket } from "../services/socket.js";
import AlertsPanel from "../components/AlertsPanel.jsx";
import { Bell, RefreshCw, AlertOctagon, AlertTriangle, Info } from "lucide-react";

export default function Alerts() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);

  const fetchAlerts = async () => {
    const a = await api.getAlerts(token);
    if (Array.isArray(a)) setAlerts(a);
  };

  useEffect(() => {
    fetchAlerts();
    socket.on("alert", (alert) => {
      setLiveAlerts((prev) => [{ ...alert, isLive: true }, ...prev].slice(0, 20));
    });
    const interval = setInterval(fetchAlerts, 5000);
    return () => { socket.off("alert"); clearInterval(interval); };
  }, [token]);

  const allAlerts = [...liveAlerts, ...alerts];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alert Center</h1>
          <p className="page-subtitle">Real-time fleet alerts and maintenance warnings</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAlerts}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid-3 section-gap">
        {["critical", "warning", "info"].map((sev) => {
          const count = allAlerts.filter((a) => a.severity === sev).length;
          const colors = { critical: "var(--red)", warning: "var(--amber)", info: "var(--cyan)" };
          const Icons = { critical: AlertOctagon, warning: AlertTriangle, info: Info };
          const Icon = Icons[sev];
          return (
            <div key={sev} className="stat-card" style={{ "--accent-color": colors[sev] }}>
              <div style={{ marginBottom: 4, display: "flex", justifyContent: "center" }}><Icon size={24} style={{ color: colors[sev] }} /></div>
              <div className="stat-value" style={{ color: colors[sev], fontSize: "1.8rem" }}>{count}</div>
              <div className="stat-label">{sev} alerts</div>
            </div>
          );
        })}
      </div>

      <AlertsPanel alerts={allAlerts} />

      {allAlerts.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "40px", marginTop: 20 }}>
          <Bell size={32} style={{ color: "var(--emerald)", marginBottom: 12 }} />
          <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--emerald)" }}>All clear</div>
          <div style={{ color: "var(--text-muted)", marginTop: 4 }}>No active alerts at this time</div>
        </div>
      )}
    </div>
  );
}

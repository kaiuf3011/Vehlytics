import React, { useState } from "react";
import { Bell, X, AlertTriangle, Info, Zap, CheckCircle2 } from "lucide-react";

const ICON_MAP = {
  critical: AlertTriangle,
  warning: Zap,
  info: Info,
};

const COLOR_MAP = {
  critical: "var(--red)",
  warning: "var(--amber)",
  info: "var(--cyan)",
};

export default function AlertsPanel({ alerts = [] }) {
  const [dismissed, setDismissed] = useState(new Set());

  const visible = alerts.filter((_, i) => !dismissed.has(i));
  const criticalCount = visible.filter((a) => a.severity === "critical").length;

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Bell size={16} style={{ color: "var(--text-secondary)" }} />
          <span className="card-title">Live Alerts</span>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="badge badge-critical">{criticalCount} critical</span>
          )}
          <span className="text-xs text-muted">{visible.length} active</span>
        </div>
      </div>

      <div style={{ maxHeight: 320, overflowY: "auto" }}>
        {visible.length === 0 ? (
          <div
            style={{
              padding: "20px 16px",
              textAlign: "center",
              color: "var(--emerald)",
              fontSize: "0.85rem",
              background: "var(--emerald-dim)",
              borderRadius: 8,
              border: "1px solid rgba(16,212,138,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><CheckCircle2 size={16} /> No active alerts — fleet operating normally</div>
          </div>
        ) : (
          visible.map((alert, i) => {
            const Icon = ICON_MAP[alert.severity] || Info;
            const color = COLOR_MAP[alert.severity] || "var(--cyan)";
            return (
              <div key={i} className={`alert-item ${alert.severity}`} style={{ position: "relative" }}>
                <Icon size={14} style={{ color, flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div className="alert-title" style={{ color }}>
                    {alert.vehicleId}
                    <span
                      className={`badge ${alert.severity === "critical" ? "badge-critical" : alert.severity === "warning" ? "badge-warning" : "badge-info"}`}
                      style={{ marginLeft: 8 }}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <div className="alert-msg">{alert.message}</div>
                </div>
                <button
                  onClick={() => setDismissed((prev) => new Set([...prev, i]))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

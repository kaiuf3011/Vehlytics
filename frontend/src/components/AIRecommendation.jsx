import React from "react";
import { Brain, AlertTriangle, Zap, Battery, Activity, CheckCircle2 } from "lucide-react";

function calcRisk(v) {
  let score = 0;
  if (v.engineTemp > 100) score += 40;
  else if (v.engineTemp > 95) score += 20;
  if (v.healthScore < 70) score += 30;
  else if (v.healthScore < 80) score += 10;
  if (v.fuelLevel < 15) score += 20;
  if (v.batteryLevel < 20) score += 15;
  return Math.min(score, 100);
}

function InsightRow({ icon: Icon, color, text, vehicleId }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 8,
        background: `${color}10`,
        border: `1px solid ${color}25`,
        marginBottom: 8,
      }}
    >
      <Icon size={14} style={{ color, marginTop: 1, flexShrink: 0 }} />
      <div>
        <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--text-primary)" }}>{vehicleId}</span>
        {" — "}
        <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{text}</span>
      </div>
    </div>
  );
}

export default function AIRecommendation({ vehicles = [] }) {
  const insights = [];

  for (const v of vehicles) {
    const risk = calcRisk(v);
    if (v.engineTemp > 100) {
      insights.push({ icon: AlertTriangle, color: "var(--red)", text: `Engine overheating (${v.engineTemp?.toFixed(0)}°C) — immediate inspection`, vehicleId: v.vehicleId });
    }
    if (v.fuelLevel < 15) {
      insights.push({ icon: Zap, color: "var(--amber)", text: `Fuel critically low (${v.fuelLevel?.toFixed(0)}%) — refuel before dispatch`, vehicleId: v.vehicleId });
    }
    if (v.batteryLevel < 20) {
      insights.push({ icon: Battery, color: "var(--cyan)", text: `Battery low (${v.batteryLevel?.toFixed(0)}%) — route to charging station`, vehicleId: v.vehicleId });
    }
    if (risk >= 60 && v.engineTemp <= 100 && v.fuelLevel >= 15) {
      insights.push({ icon: Activity, color: "var(--purple)", text: `High maintenance risk (score: ${risk}) — schedule inspection soon`, vehicleId: v.vehicleId });
    }
  }

  // Best vehicle
  const available = vehicles.filter((v) => v.status === "available" && v.fuelLevel > 30 && v.healthScore > 75);
  const best = available.sort((a, b) => b.healthScore - a.healthScore)[0];

  const fleetHealth = vehicles.length
    ? Math.round(vehicles.reduce((s, v) => s + (v.healthScore || 0), 0) / vehicles.length)
    : 0;

  return (
    <div className="ai-panel">
      <div className="ai-header">
        <div className="ai-icon"><Brain size={18} style={{ color: "var(--purple)" }} /></div>
        <div>
          <div className="ai-title">AI Fleet Insights</div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Real-time analysis · {vehicles.length} vehicles monitored
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: fleetHealth >= 80 ? "var(--emerald)" : fleetHealth >= 60 ? "var(--amber)" : "var(--red)" }}>
            {fleetHealth}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Fleet Score</div>
        </div>
      </div>

      {best && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: 8,
            marginBottom: 14,
          }}
        >
          <Zap size={16} style={{ color: "var(--cyan)" }} />
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--cyan)" }}>
              Recommended: {best.vehicleId}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Best available vehicle — {best.status} · Health {best.healthScore?.toFixed(0)}% · Fuel {best.fuelLevel?.toFixed(0)}%
            </div>
          </div>
        </div>
      )}

      {insights.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            background: "var(--emerald-dim)",
            border: "1px solid rgba(16,212,138,0.25)",
            borderRadius: 8,
            fontSize: "0.8rem",
            color: "var(--emerald)",
          }}
        >
          <CheckCircle2 size={16} /> All vehicles operating within normal parameters
        </div>
      ) : (
        <div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {insights.length} Active Alert{insights.length > 1 ? "s" : ""}
          </div>
          {insights.map((ins, i) => (
            <InsightRow key={i} {...ins} />
          ))}
        </div>
      )}
    </div>
  );
}

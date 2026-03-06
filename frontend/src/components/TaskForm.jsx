import React, { useState } from "react";
import { Zap, Loader, MapPin, Package, Star, Target, Check } from "lucide-react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

// AI Route Optimizer (mirrors backend ai-engine)
function haversine(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function scoreVehicle(v, taskLoc) {
  const dist = haversine(v.location || { lat: 37.77, lng: -122.41 }, taskLoc);
  const distScore = Math.max(0, 1 - dist / 50) * 35;
  const fuelScore = ((v.fuelLevel || 0) / 100) * 25;
  const healthScore = ((v.healthScore || 0) / 100) * 25;
  const batteryScore = ((v.batteryLevel || 0) / 100) * 10;
  const maintPenalty = ((v.maintenanceRisk || 0) / 100) * 15;
  const statusBonus = v.status === "available" ? 5 : 0;
  const total = distScore + fuelScore + healthScore + batteryScore + statusBonus - maintPenalty;
  return {
    vehicleId: v.vehicleId,
    score: Math.round(Math.max(0, Math.min(100, total))),
    distanceKm: parseFloat(dist.toFixed(1)),
    estimatedMinutes: Math.round((dist / 40) * 60),
    confidence: total >= 70 ? "HIGH" : total >= 45 ? "MEDIUM" : "LOW",
    breakdown: {
      proximity: Math.round(distScore),
      fuel: Math.round(fuelScore),
      health: Math.round(healthScore),
      battery: Math.round(batteryScore),
      maintenance: Math.round(maintPenalty),
    },
    status: v.status,
    fuelLevel: v.fuelLevel,
    healthScore: v.healthScore,
  };
}

const ZONES = [
  { label: "Downtown SF", lat: 37.7749, lng: -122.4194 },
  { label: "North Beach", lat: 37.8014, lng: -122.4088 },
  { label: "Mission District", lat: 37.7599, lng: -122.4148 },
  { label: "SOMA", lat: 37.7785, lng: -122.3948 },
  { label: "Sunset District", lat: 37.7528, lng: -122.4988 },
];

const TASK_TYPES = ["Delivery", "Pickup", "Inspection", "Maintenance", "Emergency", "Transfer"];

export default function TaskForm({ vehicles = [], onAssigned }) {
  const { token } = useAuth();
  const [taskType, setTaskType] = useState("Delivery");
  const [zone, setZone] = useState(0);
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [assigned, setAssigned] = useState(false);

  const handleFindBest = async () => {
    if (!vehicles.length) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1400)); // AI analysis delay
    const taskLoc = ZONES[zone];
    const ranked = vehicles
      .filter((v) => v.status !== "offline" && v.status !== "maintenance")
      .map((v) => scoreVehicle(v, taskLoc))
      .sort((a, b) => b.score - a.score);
    setResult(ranked.slice(0, 3));
    setLoading(false);
    setAssigned(false);
  };

  const handleAssign = async (vehicleId) => {
    const taskData = {
      vehicleId,
      taskType,
      zone: ZONES[zone].label,
      priority,
      notes,
    };
    await api.assignTask(taskData, token);
    setAssigned(vehicleId);
    onAssigned?.(taskData);
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}><Target size={16} style={{ color: "var(--cyan)" }} /> AI Task Assignment</span>
        {result && (
          <span className="badge badge-info">AI Ranked {result.length} vehicles</span>
        )}
      </div>

      <div className="grid-3 mb-4">
        <div className="input-group">
          <label className="input-label">Task Type</label>
          <select
            className="input select"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
          >
            {TASK_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Pickup Zone</label>
          <select
            className="input select"
            value={zone}
            onChange={(e) => setZone(+e.target.value)}
          >
            {ZONES.map((z, i) => <option key={i} value={i}>{z.label}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Priority</label>
          <select
            className="input select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="input-group mb-4">
        <label className="input-label">Notes (optional)</label>
        <input
          className="input"
          placeholder="Delivery instructions, special requirements..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        className={`btn btn-primary ${loading ? "" : ""}`}
        onClick={handleFindBest}
        disabled={loading || !vehicles.length}
      >
        {loading ? (
          <><Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> Analyzing Fleet...</>
        ) : (
          <><Zap size={15} /> Find Best Vehicle</>
        )}
      </button>

      {/* Results */}
      {result && (
        <div style={{ marginTop: 20 }}>
          <div className="divider" style={{ margin: "16px 0" }} />
          <div className="text-xs text-muted mb-3">
            AI ranked {result.length} vehicles for <strong style={{ color: "var(--text-primary)" }}>{taskType}</strong> in{" "}
            <strong style={{ color: "var(--text-primary)" }}>{ZONES[zone].label}</strong>
          </div>
          {result.map((r, i) => (
            <div
              key={r.vehicleId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                marginBottom: 8,
                background: i === 0 ? "rgba(0,212,255,0.06)" : "var(--bg-tertiary)",
                border: `1px solid ${i === 0 ? "rgba(0,212,255,0.25)" : "var(--border)"}`,
                borderRadius: "var(--radius-sm)",
              }}
            >
              {i === 0 && <Star size={14} style={{ color: "var(--cyan)", flexShrink: 0 }} />}
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", minWidth: 60 }}>
                {r.vehicleId}
              </div>
              {/* Score ring mini */}
              <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                  <circle
                    cx="22" cy="22" r="18"
                    fill="none"
                    stroke={r.score >= 70 ? "var(--cyan)" : r.score >= 50 ? "var(--amber)" : "var(--red)"}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(r.score / 100) * 113} 113`}
                    transform="rotate(-90 22 22)"
                  />
                  <text x="22" y="27" textAnchor="middle" fontSize="10" fill="var(--text-primary)" fontWeight="700">
                    {r.score}
                  </text>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span className={`badge ${r.confidence === "HIGH" ? "badge-available" : r.confidence === "MEDIUM" ? "badge-busy" : "badge-maintenance"}`}>
                    {r.confidence}
                  </span>
                  <span className="text-xs text-muted">
                    <MapPin size={10} style={{ display: "inline", marginRight: 3 }} />
                    {r.distanceKm} km · ~{r.estimatedMinutes} min
                  </span>
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", gap: 10 }}>
                  <span>Fuel {r.fuelLevel?.toFixed(0)}%</span>
                  <span>Health {r.healthScore?.toFixed(0)}%</span>
                  <span className={`badge ${r.status === "available" ? "badge-available" : "badge-busy"}`} style={{ padding: "1px 6px", fontSize: "0.65rem" }}>{r.status}</span>
                </div>
              </div>
              <button
                className={`btn btn-sm ${assigned === r.vehicleId ? "btn-success" : "btn-primary"}`}
                onClick={() => handleAssign(r.vehicleId)}
                disabled={!!assigned}
              >
                {assigned === r.vehicleId ? <><Check size={14} style={{ display: "inline", marginBottom: -2 }} /> Assigned</> : "Assign"}
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

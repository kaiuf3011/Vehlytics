import React from "react";
import { Gauge, Thermometer, Fuel, Battery, MapPin, AlertTriangle } from "lucide-react";

function MetricBar({ label, value, max = 100, type }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="metric-item">
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        <span className="metric-value">{parseFloat(value ?? 0).toFixed(0)}{type === "temp" ? "°C" : "%"}</span>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-fill progress-${type === "temp" ? "risk" : type === "health" ? "health" : type === "battery" ? "battery" : "fuel"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function statusBadge(status) {
  const cls = {
    available: "badge-available",
    busy: "badge-busy",
    maintenance: "badge-maintenance",
    offline: "badge-offline",
  }[status] || "badge-offline";
  return <span className={`badge ${cls}`}>{status}</span>;
}

export default function VehicleCard({ vehicle, onClick }) {
  const risk = vehicle.maintenanceRisk ?? 0;
  const hasAlert = risk > 40;

  return (
    <div className="vehicle-card" onClick={() => onClick?.(vehicle)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="vehicle-id">{vehicle.vehicleId}</div>
          <div className="vehicle-label">{vehicle.label || vehicle.type || "Fleet Vehicle"}</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          {statusBadge(vehicle.status)}
          {hasAlert && (
            <span style={{ fontSize: "0.68rem", color: "var(--amber)", display: "flex", alignItems: "center", gap: 3 }}>
              <AlertTriangle size={10} /> Alert
            </span>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="vehicle-metrics">
        <MetricBar label="Fuel" value={vehicle.fuelLevel} type="fuel" />
        <MetricBar label="Health" value={vehicle.healthScore} type="health" />
        <MetricBar label="Battery" value={vehicle.batteryLevel} type="battery" />
        <MetricBar
          label="Risk"
          value={risk}
          type="temp"
        />
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Gauge size={13} />
          <span>{parseFloat(vehicle.speed ?? 0).toFixed(0)} km/h</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <Thermometer size={13} />
          <span>{parseFloat(vehicle.engineTemp ?? 0).toFixed(0)}°C</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <MapPin size={13} />
          <span>
            {vehicle.location
              ? `${vehicle.location.lat?.toFixed(3)}, ${vehicle.location.lng?.toFixed(3)}`
              : "No GPS"}
          </span>
        </div>
      </div>

      {/* Driver score */}
      {vehicle.driverScore !== undefined && (
        <div className="flex items-center justify-between mt-3" style={{ paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <span className="text-xs text-muted">Driver Score</span>
          <span style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: vehicle.driverScore >= 90 ? "var(--emerald)" : vehicle.driverScore >= 70 ? "var(--amber)" : "var(--red)"
          }}>
            {vehicle.driverScore}/100
          </span>
        </div>
      )}
    </div>
  );
}

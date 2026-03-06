import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { socket } from "../services/socket.js";
import { api } from "../services/api.js";
import FleetStats from "../components/FleetStats.jsx";
import VehicleCard from "../components/VehicleCard.jsx";
import TaskForm from "../components/TaskForm.jsx";
import AIRecommendation from "../components/AIRecommendation.jsx";
import AlertsPanel from "../components/AlertsPanel.jsx";
import MapView from "../components/MapView.jsx";
import TelemetryChart from "../components/TelemetryChart.jsx";
import { RefreshCw } from "lucide-react";

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [s, v, a] = await Promise.all([
        api.getFleetStats(token),
        api.getVehicles(token),
        api.getAlerts(token),
      ]);
      if (!s.error) setStats(s);
      if (Array.isArray(v)) setVehicles(v);
      if (Array.isArray(a)) setAlerts(a);
    } catch {}
  }, [token]);

  useEffect(() => {
    fetchAll();

    // Listen for real-time telemetry
    const handleUpdate = (data) => {
      setLastUpdate(new Date());
      setTelemetryHistory((prev) => [data, ...prev].slice(0, 100));
      // Update vehicle in grid
      setVehicles((prev) => {
        const idx = prev.findIndex((v) => v.vehicleId === data.vehicleId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...data };
          return updated;
        }
        return [data, ...prev];
      });
    };

    socket.on("telemetry_update", handleUpdate);
    // Refresh stats every 10s
    const interval = setInterval(() => { fetchAll(); }, 10000);

    return () => {
      socket.off("telemetry_update", handleUpdate);
      clearInterval(interval);
    };
  }, [fetchAll]);

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Overview</h1>
          <p className="page-subtitle">
            {lastUpdate
              ? `Last update: ${lastUpdate.toLocaleTimeString()}`
              : "Connecting to live telemetry feed..."}
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAll}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <FleetStats stats={stats} />

      {/* AI + Alerts row */}
      <div className="grid-2 section-gap">
        <AIRecommendation vehicles={vehicles} />
        <AlertsPanel alerts={alerts} />
      </div>

      {/* Task form */}
      <div className="section-gap">
        <TaskForm vehicles={vehicles} onAssigned={fetchAll} />
      </div>

      {/* Map + Chart row */}
      <div className="grid-2 section-gap">
        <MapView vehicles={vehicles} />
        <TelemetryChart history={telemetryHistory} />
      </div>

      {/* Live vehicle grid */}
      <div className="section-gap">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Live Vehicles
          </h2>
          <span className="text-xs text-muted">{vehicles.length} vehicles</span>
        </div>
        <div className="grid-auto">
          {vehicles.map((v) => (
            <VehicleCard key={v.vehicleId || v._id} vehicle={v} />
          ))}
          {vehicles.length === 0 && (
            <div style={{ gridColumn: "1/-1", padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              No vehicles reporting. Start the simulator to see live data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

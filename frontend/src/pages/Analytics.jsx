import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { socket } from "../services/socket.js";
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const PIE_COLORS = { available: "#10d48a", busy: "#f59e0b", maintenance: "#ef4444", offline: "#64748b" };

function KPICard({ label, value, color, unit }) {
  return (
    <div className="stat-card" style={{ "--accent-color": color }}>
      <div className="stat-value" style={{ color, fontSize: "1.5rem" }}>{value}{unit}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Analytics() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.getVehicles(token).then((v) => { if (Array.isArray(v)) setVehicles(v); });

    const handleUpdate = (data) => {
      setHistory((prev) => [{ ...data, t: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
      setVehicles((prev) => {
        const idx = prev.findIndex((v) => v.vehicleId === data.vehicleId);
        if (idx >= 0) { const u = [...prev]; u[idx] = { ...u[idx], ...data }; return u; }
        return [data, ...prev];
      });
    };
    socket.on("telemetry_update", handleUpdate);
    return () => socket.off("telemetry_update", handleUpdate);
  }, [token]);

  // Derived stats
  const avgSpeed = vehicles.length ? (vehicles.reduce((s, v) => s + (v.speed || 0), 0) / vehicles.length).toFixed(1) : 0;
  const avgFuel = vehicles.length ? (vehicles.reduce((s, v) => s + (v.fuelLevel || 0), 0) / vehicles.length).toFixed(1) : 0;
  const avgHealth = vehicles.length ? (vehicles.reduce((s, v) => s + (v.healthScore || 0), 0) / vehicles.length).toFixed(1) : 0;
  const avgTemp = vehicles.length ? (vehicles.reduce((s, v) => s + (v.engineTemp || 0), 0) / vehicles.length).toFixed(1) : 0;

  // Pie data
  const statusCounts = vehicles.reduce((acc, v) => {
    acc[v.status || "offline"] = (acc[v.status || "offline"] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Bar data
  const barData = vehicles.map((v) => ({
    id: v.vehicleId,
    fuel: parseFloat(v.fuelLevel?.toFixed(1) || 0),
    health: parseFloat(v.healthScore?.toFixed(1) || 0),
  }));

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Fleet performance insights and telemetry analysis</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4 section-gap">
        <KPICard label="Avg Speed" value={avgSpeed} unit=" km/h" color="var(--cyan)" />
        <KPICard label="Avg Fuel" value={avgFuel} unit="%" color="var(--amber)" />
        <KPICard label="Avg Health" value={avgHealth} unit="%" color="var(--emerald)" />
        <KPICard label="Avg Temp" value={avgTemp} unit="°C" color="var(--red)" />
      </div>

      {/* Pie + Bar */}
      <div className="grid-2 section-gap">
        <div className="card">
          <div className="card-header"><span className="card-title">Status Distribution</span></div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={{ stroke: "var(--text-muted)" }}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name] || "#64748b"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No data yet</div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Fuel & Health by Vehicle</span></div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ left: -20, right: 8, top: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="id" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                <Bar dataKey="fuel" fill="#f59e0b" name="Fuel %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="health" fill="#10d48a" name="Health %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No data yet</div>
          )}
        </div>
      </div>

      {/* Live feed */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Live Speed Feed</span>
          <span className="badge badge-info">{history.length} data points</span>
        </div>
        {history.length >= 2 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[...history].reverse()} margin={{ left: -20, right: 8, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: "var(--text-muted)" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: "var(--text-muted)" }} domain={[0, 140]} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="speed" stroke="#00d4ff" dot={false} strokeWidth={2} name="Speed (km/h)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
            Waiting for live telemetry...
          </div>
        )}
      </div>
    </div>
  );
}

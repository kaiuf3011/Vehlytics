import React, { useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Activity } from "lucide-react";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, fontSize: "0.78rem" }}>
          {p.name}: <strong>{parseFloat(p.value).toFixed(1)}</strong>
          {p.dataKey === "engineTemp" ? "°C" : "%"}
        </div>
      ))}
    </div>
  );
}

export default function TelemetryChart({ history = [] }) {
  const chartData = history.slice(-20).map((d, i) => ({
    t: d.timestamp ? new Date(d.timestamp).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : `T${i}`,
    speed: parseFloat(d.speed ?? 0).toFixed(1),
    engineTemp: parseFloat(d.engineTemp ?? 0).toFixed(1),
    fuelLevel: parseFloat(d.fuelLevel ?? 0).toFixed(1),
    healthScore: parseFloat(d.healthScore ?? 0).toFixed(1),
  }));

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Activity size={15} style={{ color: "var(--cyan)" }} />
          <span className="card-title">Live Telemetry Feed</span>
        </div>
        <span className="badge badge-info">{history.length} data points</span>
      </div>

      {chartData.length < 2 ? (
        <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Waiting for live telemetry data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--text-muted)" }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} domain={[0, 120]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}
              iconType="circle"
              iconSize={8}
            />
            <Line type="monotone" dataKey="speed" stroke="#00d4ff" strokeWidth={2} dot={false} name="Speed" />
            <Line type="monotone" dataKey="fuelLevel" stroke="#f59e0b" strokeWidth={2} dot={false} name="Fuel %" />
            <Line type="monotone" dataKey="healthScore" stroke="#10d48a" strokeWidth={2} dot={false} name="Health %" />
            <Line type="monotone" dataKey="engineTemp" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Temp" strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

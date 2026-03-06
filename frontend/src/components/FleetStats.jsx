import React from "react";
import { Truck, CheckCircle, Clock, AlertTriangle, Heart } from "lucide-react";

function StatCard({ label, value, icon: Icon, color, subtext }) {
  return (
    <div className="stat-card" style={{ "--accent-color": color }}>
      <div className="stat-icon" style={{ background: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="stat-value" style={{ color }}>{value ?? "—"}</div>
      <div className="stat-label">{label}</div>
      {subtext && <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>{subtext}</div>}
    </div>
  );
}

export default function FleetStats({ stats }) {
  return (
    <div className="grid-4 section-gap">
      <StatCard
        label="Total Vehicles"
        value={stats?.totalVehicles ?? 0}
        icon={Truck}
        color="var(--cyan)"
        subtext="Active fleet"
      />
      <StatCard
        label="Available"
        value={stats?.availableVehicles ?? 0}
        icon={CheckCircle}
        color="var(--emerald)"
        subtext="Ready for dispatch"
      />
      <StatCard
        label="Busy"
        value={stats?.busyVehicles ?? 0}
        icon={Clock}
        color="var(--amber)"
        subtext="On task"
      />
      <StatCard
        label="Fleet Health"
        value={stats?.avgHealth ? `${stats.avgHealth}%` : "—"}
        icon={Heart}
        color={
          stats?.avgHealth >= 85
            ? "var(--emerald)"
            : stats?.avgHealth >= 65
            ? "var(--amber)"
            : "var(--red)"
        }
        subtext={`${stats?.alertCount ?? 0} active alerts`}
      />
    </div>
  );
}

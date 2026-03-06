import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { socket } from "../services/socket.js";
import VehicleCard from "../components/VehicleCard.jsx";
import { Search, Filter } from "lucide-react";

const STATUS_FILTERS = ["all", "available", "busy", "maintenance", "offline"];

export default function Fleet() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    api.getVehicles(token).then((v) => { if (Array.isArray(v)) setVehicles(v); });

    const handleUpdate = (data) => {
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
    return () => socket.off("telemetry_update", handleUpdate);
  }, [token]);

  const filtered = vehicles.filter((v) => {
    const matchSearch = v.vehicleId?.toLowerCase().includes(search.toLowerCase()) || v.label?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Management</h1>
          <p className="page-subtitle">Real-time telemetry for {vehicles.length} vehicles</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5" style={{ flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            className="input"
            placeholder="Search vehicle ID or label..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "var(--text-muted)" }} />
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle grid */}
      <div className="grid-auto">
        {filtered.map((v) => (
          <VehicleCard key={v.vehicleId || v._id} vehicle={v} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)" }}>
          {search || statusFilter !== "all"
            ? "No vehicles match your filter."
            : "No vehicles reporting. Start the simulator."}
        </div>
      )}
    </div>
  );
}

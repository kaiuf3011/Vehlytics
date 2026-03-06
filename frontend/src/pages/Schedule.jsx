import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { Calendar, Clock } from "lucide-react";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am–8pm
const COLORS = ["var(--cyan)", "var(--emerald)", "var(--amber)", "var(--purple)", "var(--red)"];

function randomTasks(vehicles) {
  const taskTypes = ["Delivery", "Pickup", "Maintenance", "Inspection", "Transfer"];
  const zones = ["Downtown", "Mission", "SOMA", "North Beach", "Sunset"];
  const tasks = [];
  vehicles.forEach((v, vi) => {
    const numTasks = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numTasks; i++) {
      const startHour = 8 + Math.floor(Math.random() * 10);
      const duration = Math.floor(Math.random() * 2) + 1;
      tasks.push({
        vehicleId: v.vehicleId,
        type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
        zone: zones[Math.floor(Math.random() * zones.length)],
        startHour,
        endHour: Math.min(startHour + duration, 20),
        color: COLORS[vi % COLORS.length],
      });
    }
  });
  return tasks;
}

export default function Schedule() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [tasks, setTasks] = useState([]);
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  useEffect(() => {
    api.getVehicles(token).then((v) => {
      if (Array.isArray(v)) {
        setVehicles(v);
        setTasks(randomTasks(v));
      }
    });
  }, [token]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Task Schedule</h1>
          <p className="page-subtitle">Gantt-style fleet schedule — today's assignments</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Clock size={14} />
          {now.toLocaleTimeString()}
        </div>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 700 }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "100px repeat(12, 1fr)", marginBottom: 8 }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", padding: "0 8px" }}>Vehicle</div>
            {HOURS.map((h) => (
              <div key={h} style={{ fontSize: "0.68rem", color: "var(--text-muted)", textAlign: "center" }}>
                {h > 12 ? `${h - 12}pm` : h === 12 ? "12pm" : `${h}am`}
              </div>
            ))}
          </div>

          {/* Current time indicator */}
          {currentHour >= 8 && currentHour <= 20 && (
            <div style={{ position: "relative", height: 0, zIndex: 10 }}>
              <div
                style={{
                  position: "absolute",
                  left: `calc(100px + ${((currentHour - 8) / 12) * 100}%)`,
                  top: 0,
                  width: 2,
                  height: `${(vehicles.length || 3) * 48 + 10}px`,
                  background: "var(--red)",
                  opacity: 0.8,
                }}
              >
                <div style={{ position: "absolute", top: -6, left: -16, background: "var(--red)", borderRadius: 4, padding: "2px 6px", fontSize: "0.65rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
                  NOW
                </div>
              </div>
            </div>
          )}

          {/* Vehicle rows */}
          {vehicles.map((v) => {
            const vTasks = tasks.filter((t) => t.vehicleId === v.vehicleId);
            return (
              <div
                key={v.vehicleId}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr",
                  height: 44,
                  alignItems: "center",
                  borderTop: "1px solid var(--border)",
                  position: "relative",
                }}
              >
                <div style={{ fontSize: "0.77rem", fontWeight: 700, color: "var(--text-primary)", padding: "0 8px" }}>
                  {v.vehicleId}
                </div>
                <div style={{ position: "relative", height: "100%", background: "rgba(255,255,255,0.01)", borderLeft: "1px solid var(--border)" }}>
                  {vTasks.map((task, i) => {
                    const left = ((task.startHour - 8) / 12) * 100;
                    const width = ((task.endHour - task.startHour) / 12) * 100;
                    return (
                      <div
                        key={i}
                        title={`${task.type} – ${task.zone}`}
                        style={{
                          position: "absolute",
                          left: `${left}%`,
                          width: `${width}%`,
                          top: "20%",
                          height: "60%",
                          background: `${task.color}22`,
                          border: `1px solid ${task.color}66`,
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          padding: "0 6px",
                          overflow: "hidden",
                        }}
                      >
                        <span style={{ fontSize: "0.65rem", color: task.color, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {task.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {vehicles.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
              Start the simulator to generate schedule data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

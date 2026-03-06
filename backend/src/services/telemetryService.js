// In-memory store for demo mode (when MongoDB is not available)
export const memStore = {
  telemetry: [],
  users: [],
};

// AI Engine imports (inline for backend use)
export function calcMaintenanceRisk(data) {
  let score = 0;
  if (data.engineTemp > 100) score += 40;
  if (data.engineTemp > 95) score += 15;
  if (data.healthScore < 70) score += 30;
  if (data.healthScore < 80) score += 10;
  if (data.fuelLevel < 10) score += 20;
  if (data.batteryLevel < 20) score += 15;
  return Math.min(score, 100);
}

export function calcDriverScore(data) {
  let score = 100;
  if (data.speed > 120) score -= 20;
  else if (data.speed > 100) score -= 10;
  if (data.engineTemp > 105) score -= 15;
  return Math.max(score, 0);
}

export function getAlerts(vehicles) {
  const alerts = [];
  for (const v of vehicles) {
    if (v.engineTemp > 100) {
      alerts.push({ vehicleId: v.vehicleId, severity: "critical", message: `Engine overheating risk (${v.engineTemp}°C)` });
    }
    if (v.fuelLevel < 15) {
      alerts.push({ vehicleId: v.vehicleId, severity: v.fuelLevel < 8 ? "critical" : "warning", message: `Low fuel (${v.fuelLevel}%)` });
    }
    if (v.batteryLevel < 20) {
      alerts.push({ vehicleId: v.vehicleId, severity: "warning", message: `Low battery (${v.batteryLevel}%)` });
    }
    if (v.healthScore < 70) {
      alerts.push({ vehicleId: v.vehicleId, severity: "warning", message: `Poor vehicle health (score: ${v.healthScore})` });
    }
    if (v.speed > 120) {
      alerts.push({ vehicleId: v.vehicleId, severity: "warning", message: `Overspeeding detected (${v.speed} km/h)` });
    }
  }
  return alerts;
}

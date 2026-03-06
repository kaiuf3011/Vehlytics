/**
 * FleetMind AI — Maintenance Prediction Engine
 * Predicts vehicle failure risk based on telemetry signals.
 */

export function predictMaintenance(vehicle) {
  let riskScore = 0;
  const alerts = [];

  // Engine temperature analysis
  if (vehicle.engineTemp > 105) {
    riskScore += 45;
    alerts.push({ code: "ENG_OVERHEAT_CRITICAL", message: "Critical engine overheating — immediate inspection required" });
  } else if (vehicle.engineTemp > 98) {
    riskScore += 25;
    alerts.push({ code: "ENG_OVERHEAT_WARN", message: "Engine temperature elevated — monitor closely" });
  } else if (vehicle.engineTemp > 92) {
    riskScore += 10;
  }

  // Health score degradation
  if (vehicle.healthScore < 60) {
    riskScore += 35;
    alerts.push({ code: "HEALTH_CRITICAL", message: "Vehicle health score critically low — maintenance urgent" });
  } else if (vehicle.healthScore < 70) {
    riskScore += 20;
    alerts.push({ code: "HEALTH_WARN", message: "Vehicle health degraded — schedule maintenance" });
  } else if (vehicle.healthScore < 80) {
    riskScore += 8;
  }

  // Fuel level
  if (vehicle.fuelLevel < 8) {
    riskScore += 20;
    alerts.push({ code: "FUEL_CRITICAL", message: "Fuel critically low — refuel immediately" });
  } else if (vehicle.fuelLevel < 15) {
    riskScore += 10;
    alerts.push({ code: "FUEL_LOW", message: "Fuel level low — refuel soon" });
  }

  // Battery degradation
  if (vehicle.batteryLevel < 15) {
    riskScore += 15;
    alerts.push({ code: "BATTERY_CRITICAL", message: "Battery critical — charge immediately" });
  } else if (vehicle.batteryLevel < 25) {
    riskScore += 8;
  }

  const clampedRisk = Math.min(riskScore, 100);
  return {
    vehicleId: vehicle.vehicleId,
    riskScore: clampedRisk,
    riskLevel: clampedRisk >= 70 ? "CRITICAL" : clampedRisk >= 40 ? "HIGH" : clampedRisk >= 20 ? "MEDIUM" : "LOW",
    alerts,
    recommendation: clampedRisk >= 70
      ? "🚨 Immediate maintenance required — remove from service"
      : clampedRisk >= 40
      ? "⚠️ Schedule maintenance within 24 hours"
      : clampedRisk >= 20
      ? "📋 Monitor closely — plan inspection"
      : "✅ Vehicle operating normally",
  };
}

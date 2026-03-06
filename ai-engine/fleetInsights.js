/**
 * FleetMind AI — Fleet Insights Orchestrator
 * Combines all AI modules into a unified fleet intelligence report.
 */
import { predictMaintenance } from "./maintenancePrediction.js";
import { calcDriverScore } from "./driverBehavior.js";
import { optimizeEnergy } from "./energyOptimization.js";
import { predictBatteryHealth } from "./batteryPrediction.js";
import { optimizeRoute } from "./routeOptimizer.js";

export function generateFleetInsights(vehicles, taskLocation = null) {
  if (!vehicles || vehicles.length === 0) return { insights: [], summary: null };

  const insights = vehicles.map((v) => ({
    vehicleId: v.vehicleId,
    maintenance: predictMaintenance(v),
    driver: calcDriverScore(v),
    energy: optimizeEnergy(v),
    battery: predictBatteryHealth(v),
  }));

  // Fleet-level summary
  const avgHealth = Math.round(vehicles.reduce((s, v) => s + (v.healthScore || 0), 0) / vehicles.length);
  const criticalVehicles = insights.filter((i) => i.maintenance.riskLevel === "CRITICAL").length;
  const highRiskVehicles = insights.filter((i) => i.maintenance.riskLevel === "HIGH").length;

  const fleetHealthScore = Math.max(0, avgHealth - criticalVehicles * 10 - highRiskVehicles * 5);

  let routeRecommendation = null;
  if (taskLocation) {
    const ranked = optimizeRoute(vehicles, taskLocation);
    routeRecommendation = ranked.slice(0, 3);
  }

  return {
    fleetHealthScore,
    fleetHealthGrade:
      fleetHealthScore >= 90 ? "A" : fleetHealthScore >= 75 ? "B" : fleetHealthScore >= 60 ? "C" : "D",
    totalVehicles: vehicles.length,
    criticalAlerts: criticalVehicles,
    highRiskAlerts: highRiskVehicles,
    insights,
    routeRecommendation,
    generatedAt: new Date().toISOString(),
  };
}

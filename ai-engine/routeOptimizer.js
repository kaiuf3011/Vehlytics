/**
 * FleetMind AI — Route Optimizer
 * Selects the best vehicle for a task based on distance, fuel, health, and availability.
 */

// Haversine distance formula (km)
function haversineDistance(loc1, loc2) {
  const R = 6371;
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function scoreVehicle(vehicle, taskLocation) {
  const dist = haversineDistance(vehicle.location || { lat: 37.7749, lng: -122.4194 }, taskLocation);
  const maxDist = 50; // km

  const distScore = Math.max(0, 1 - dist / maxDist) * 35;       // 35 pts — proximity
  const fuelScore = (vehicle.fuelLevel / 100) * 25;              // 25 pts — fuel
  const healthScore = (vehicle.healthScore / 100) * 25;          // 25 pts — health
  const batteryScore = (vehicle.batteryLevel / 100) * 10;        // 10 pts — battery
  const maintenancePenalty = (vehicle.maintenanceRisk || 0) / 100 * 15; // -15 pts max
  const statusBonus = vehicle.status === "available" ? 5 : 0;    //  5 pts — availability

  const total = distScore + fuelScore + healthScore + batteryScore + statusBonus - maintenancePenalty;

  return {
    vehicleId: vehicle.vehicleId,
    score: Math.round(Math.max(0, Math.min(100, total))),
    breakdown: {
      proximity: Math.round(distScore),
      fuel: Math.round(fuelScore),
      health: Math.round(healthScore),
      battery: Math.round(batteryScore),
      maintenance: Math.round(maintenancePenalty),
      availability: statusBonus,
    },
    distanceKm: parseFloat(dist.toFixed(2)),
    estimatedMinutes: Math.round((dist / 40) * 60),
    status: vehicle.status,
    confidence: total >= 70 ? "HIGH" : total >= 45 ? "MEDIUM" : "LOW",
  };
}

export function optimizeRoute(vehicles, taskLocation) {
  if (!vehicles || vehicles.length === 0) return [];

  const scored = vehicles
    .filter((v) => v.status !== "offline" && v.status !== "maintenance")
    .map((v) => scoreVehicle(v, taskLocation))
    .sort((a, b) => b.score - a.score);

  return scored;
}

export function getBestVehicle(vehicles, taskLocation) {
  const ranked = optimizeRoute(vehicles, taskLocation);
  return ranked[0] || null;
}

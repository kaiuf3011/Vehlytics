/**
 * FleetMind AI — Energy Optimization Module
 * Provides fuel and battery efficiency recommendations.
 */

export function optimizeEnergy(vehicle) {
  const recommendations = [];
  let efficiencyScore = 100;

  // Battery optimization (EVs)
  if (vehicle.batteryLevel < 15) {
    efficiencyScore -= 30;
    recommendations.push({
      type: "CHARGE_IMMEDIATELY",
      message: `⚡ Battery at ${vehicle.batteryLevel}% — route to nearest charging station immediately`,
      priority: "critical",
    });
  } else if (vehicle.batteryLevel < 30) {
    efficiencyScore -= 15;
    recommendations.push({
      type: "CHARGE_SOON",
      message: `⚡ Battery at ${vehicle.batteryLevel}% — plan charging stop within next trip`,
      priority: "high",
    });
  }

  // Fuel optimization
  if (vehicle.fuelLevel < 12) {
    efficiencyScore -= 25;
    recommendations.push({
      type: "REFUEL_IMMEDIATELY",
      message: `⛽ Fuel at ${vehicle.fuelLevel}% — refuel before next assignment`,
      priority: "critical",
    });
  } else if (vehicle.fuelLevel < 25) {
    efficiencyScore -= 10;
    recommendations.push({
      type: "REFUEL_SOON",
      message: `⛽ Fuel at ${vehicle.fuelLevel}% — consider refueling soon`,
      priority: "medium",
    });
  }

  // Speed efficiency
  if (vehicle.speed > 100 && vehicle.fuelLevel < 40) {
    efficiencyScore -= 10;
    recommendations.push({
      type: "SPEED_EFFICIENCY",
      message: "Reduce speed to improve fuel efficiency on low tank",
      priority: "low",
    });
  }

  return {
    vehicleId: vehicle.vehicleId,
    efficiencyScore: Math.max(0, efficiencyScore),
    recommendations,
    estimatedRange:
      vehicle.batteryLevel > 0
        ? `${Math.round((vehicle.batteryLevel / 100) * 300)} km` // assuming 300km max range
        : `${Math.round((vehicle.fuelLevel / 100) * 600)} km`, // assuming 600km max range
  };
}

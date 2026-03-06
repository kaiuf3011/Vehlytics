/**
 * FleetMind AI — Battery Lifecycle Prediction
 * Estimates remaining battery health and useful life.
 */

export function predictBatteryHealth(vehicle) {
  // Simulate charge cycles based on battery level patterns
  const estimatedCycles = vehicle._chargeCycles || Math.floor(Math.random() * 500 + 100);
  const temperature = vehicle.engineTemp || 85;

  let health = 100;

  // Cycle degradation (Li-ion loses ~20% after 800 cycles)
  health -= estimatedCycles * 0.025;

  // Temperature stress
  if (temperature > 45) health -= 8;
  else if (temperature > 40) health -= 4;

  // Low battery abuse penalty
  if (vehicle.batteryLevel < 5 && vehicle.status !== "charging") health -= 5;

  health = Math.max(0, Math.min(100, health));

  const yearsRemaining = ((health - 80) / 100) * 5; // Below 80% is EOL

  return {
    vehicleId: vehicle.vehicleId,
    batteryHealthPercent: Math.round(health),
    estimatedCycles,
    yearsRemaining: Math.max(0, parseFloat(yearsRemaining.toFixed(1))),
    status:
      health >= 90
        ? "Excellent — battery in great condition"
        : health >= 80
        ? "Good — normal degradation"
        : health >= 70
        ? "Fair — consider battery inspection"
        : "Poor — battery replacement recommended",
    recommendation:
      health < 75
        ? "🔋 Schedule battery replacement inspection"
        : health < 85
        ? "🔋 Monitor battery health quarterly"
        : "🔋 Battery healthy — continue normal operation",
  };
}

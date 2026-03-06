/**
 * FleetMind AI — Driver Behavior Scoring
 * Analyzes driving patterns and generates a safety score.
 */

export function calcDriverScore(data) {
  let score = 100;
  const incidents = [];

  // Overspeed detection
  if (data.speed > 130) {
    score -= 25;
    incidents.push({ type: "CRITICAL_OVERSPEED", message: `Extreme speeding: ${data.speed} km/h`, severity: "critical" });
  } else if (data.speed > 110) {
    score -= 15;
    incidents.push({ type: "OVERSPEED", message: `Overspeeding: ${data.speed} km/h`, severity: "warning" });
  } else if (data.speed > 90) {
    score -= 8;
    incidents.push({ type: "SPEED_ADVISORY", message: `Above recommended speed: ${data.speed} km/h`, severity: "info" });
  }

  // Engine stress (proxy for harsh driving)
  if (data.engineTemp > 105) {
    score -= 15;
    incidents.push({ type: "ENGINE_STRESS", message: "Harsh driving detected — engine under stress", severity: "warning" });
  } else if (data.engineTemp > 98) {
    score -= 5;
  }

  // Fuel efficiency (low fuel + high speed = poor efficiency)
  if (data.fuelLevel < 10 && data.speed > 80) {
    score -= 10;
    incidents.push({ type: "INEFFICIENT_DRIVING", message: "Driving aggressively on low fuel", severity: "warning" });
  }

  return {
    vehicleId: data.vehicleId,
    score: Math.max(0, score),
    grade: score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 45 ? "D" : "F",
    incidents,
    recommendation:
      score >= 90
        ? "Excellent driver — safe and efficient"
        : score >= 75
        ? "Good driving — minor improvements possible"
        : score >= 60
        ? "Moderate risk — driver coaching recommended"
        : "High risk — immediate driver review required",
  };
}

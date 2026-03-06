import axios from "axios";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const vehicles = JSON.parse(readFileSync(join(__dirname, "vehicles.json"), "utf-8"));

const API_URL = "http://localhost:5001/api/telemetry";

function rand(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

// Simulate gradual state changes per vehicle
const state = {};
vehicles.forEach((v) => {
  state[v.vehicleId] = {
    speed: rand(20, 80),
    engineTemp: rand(78, 90),
    fuelLevel: rand(40, 95),
    batteryLevel: rand(50, 100),
    healthScore: rand(75, 98),
    lat: v.baseLocation.lat,
    lng: v.baseLocation.lng,
    status: "available",
  };
});

function getNextState(vehicleId) {
  const s = state[vehicleId];

  // Gradual speed change
  s.speed = Math.max(0, Math.min(140, s.speed + rand(-10, 10)));

  // Temperature follows speed
  s.engineTemp = Math.max(70, Math.min(112, s.engineTemp + (s.speed > 90 ? rand(0.5, 1.5) : rand(-1, 0.5))));

  // Fuel drains slowly
  s.fuelLevel = Math.max(0, s.fuelLevel - rand(0.1, 0.4));

  // Battery drains slowly
  s.batteryLevel = Math.max(0, s.batteryLevel - rand(0.05, 0.2));

  // Health fluctuates
  s.healthScore = Math.max(50, Math.min(100, s.healthScore + rand(-0.5, 0.2)));

  // GPS drift
  s.lat += rand(-0.001, 0.001);
  s.lng += rand(-0.001, 0.001);

  // Status — occasionally busy
  s.status = Math.random() > 0.7 ? "busy" : "available";

  state[vehicleId] = s;
  return s;
}

let tick = 0;

async function sendTelemetry() {
  tick++;
  // Pick a random subset of vehicles each tick for realism
  const batch = vehicles.sort(() => Math.random() - 0.5).slice(0, Math.ceil(Math.random() * vehicles.length));

  for (const v of batch) {
    const s = getNextState(v.vehicleId);
    const payload = {
      vehicleId: v.vehicleId,
      speed: parseFloat(s.speed.toFixed(1)),
      engineTemp: parseFloat(s.engineTemp.toFixed(1)),
      fuelLevel: parseFloat(s.fuelLevel.toFixed(1)),
      batteryLevel: parseFloat(s.batteryLevel.toFixed(1)),
      healthScore: parseFloat(s.healthScore.toFixed(1)),
      status: s.status,
      location: { lat: parseFloat(s.lat.toFixed(6)), lng: parseFloat(s.lng.toFixed(6)) },
      timestamp: new Date().toISOString(),
    };

    try {
      await axios.post(API_URL, payload, { timeout: 3000 });
      if (tick % 5 === 0) {
        console.log(`📡 [${new Date().toLocaleTimeString()}] ${v.vehicleId} → speed:${payload.speed} fuel:${payload.fuelLevel}% temp:${payload.engineTemp}°C`);
      }
    } catch (err) {
      console.error(`❌ Failed to send telemetry for ${v.vehicleId}: ${err.message}`);
    }
  }
}

console.log("🚗 FleetMind Vehicle Simulator starting...");
console.log(`📡 Sending telemetry to: ${API_URL}`);
console.log(`🚙 Simulating ${vehicles.length} vehicles\n`);

// Send immediately, then every 2 seconds
sendTelemetry();
setInterval(sendTelemetry, 2000);

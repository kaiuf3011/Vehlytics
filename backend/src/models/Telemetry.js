import mongoose from "mongoose";

const TelemetrySchema = new mongoose.Schema({
  vehicleId: { type: String, index: true, required: true },
  speed: { type: Number, default: 0 },
  engineTemp: { type: Number, default: 80 },
  fuelLevel: { type: Number, default: 100 },
  batteryLevel: { type: Number, default: 100 },
  healthScore: { type: Number, default: 100 },
  status: { type: String, enum: ["available", "busy", "maintenance", "offline"], default: "available" },
  location: {
    lat: { type: Number, default: 37.7749 },
    lng: { type: Number, default: -122.4194 },
  },
  driverScore: { type: Number, default: 100 },
  maintenanceRisk: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

// TTL: keep telemetry for 7 days
TelemetrySchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model("Telemetry", TelemetrySchema);

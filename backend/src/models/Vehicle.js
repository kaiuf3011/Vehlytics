import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema({
  vehicleId: { type: String, unique: true, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ["truck", "van", "sedan", "ev", "motorcycle"], default: "van" },
  year: { type: Number, default: 2023 },
  baseLocation: {
    lat: { type: Number, default: 37.7749 },
    lng: { type: Number, default: -122.4194 },
  },
  registeredAt: { type: Date, default: Date.now },
});

export default mongoose.model("Vehicle", VehicleSchema);

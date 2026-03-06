import Telemetry from "../models/Telemetry.js";
import { memStore, calcMaintenanceRisk, calcDriverScore, getAlerts } from "../services/telemetryService.js";
import { emitTelemetry } from "../sockets/socketServer.js";
import mongoose from "mongoose";

const isConnected = () => mongoose.connection.readyState === 1;

// POST /api/telemetry
export const ingestTelemetry = async (req, res) => {
  try {
    const payload = req.body;
    payload.maintenanceRisk = calcMaintenanceRisk(payload);
    payload.driverScore = calcDriverScore(payload);

    if (isConnected()) {
      const doc = new Telemetry(payload);
      await doc.save();
      emitTelemetry(doc.toObject());
      return res.status(201).json({ message: "Telemetry stored", id: doc._id });
    } else {
      // Demo mode — in-memory
      memStore.telemetry.unshift({ ...payload, _id: Date.now(), timestamp: new Date() });
      if (memStore.telemetry.length > 500) memStore.telemetry.pop();
      emitTelemetry({ ...payload, timestamp: new Date() });
      return res.status(201).json({ message: "Telemetry stored (demo mode)" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/telemetry/:vehicleId
export const getVehicleTelemetry = async (req, res) => {
  try {
    if (isConnected()) {
      const data = await Telemetry.find({ vehicleId: req.params.vehicleId })
        .sort({ timestamp: -1 })
        .limit(20);
      return res.json(data);
    } else {
      const data = memStore.telemetry
        .filter((t) => t.vehicleId === req.params.vehicleId)
        .slice(0, 20);
      return res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/telemetry/latest — latest record per vehicle
export const getLatestAll = async (req, res) => {
  try {
    if (isConnected()) {
      const data = await Telemetry.aggregate([
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: "$vehicleId",
            vehicleId: { $first: "$vehicleId" },
            speed: { $first: "$speed" },
            engineTemp: { $first: "$engineTemp" },
            fuelLevel: { $first: "$fuelLevel" },
            batteryLevel: { $first: "$batteryLevel" },
            healthScore: { $first: "$healthScore" },
            status: { $first: "$status" },
            location: { $first: "$location" },
            driverScore: { $first: "$driverScore" },
            maintenanceRisk: { $first: "$maintenanceRisk" },
            timestamp: { $first: "$timestamp" },
          },
        },
      ]);
      return res.json(data);
    } else {
      const seen = new Set();
      const data = memStore.telemetry.filter((t) => {
        if (seen.has(t.vehicleId)) return false;
        seen.add(t.vehicleId);
        return true;
      });
      return res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

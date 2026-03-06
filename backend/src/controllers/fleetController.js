import Telemetry from "../models/Telemetry.js";
import { memStore, getAlerts } from "../services/telemetryService.js";
import mongoose from "mongoose";

const isConnected = () => mongoose.connection.readyState === 1;

// GET /api/fleet/stats
export const getFleetStats = async (req, res) => {
  try {
    let latest = [];

    if (isConnected()) {
      latest = await Telemetry.aggregate([
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: "$vehicleId",
            status: { $first: "$status" },
            healthScore: { $first: "$healthScore" },
            fuelLevel: { $first: "$fuelLevel" },
            speed: { $first: "$speed" },
            engineTemp: { $first: "$engineTemp" },
            maintenanceRisk: { $first: "$maintenanceRisk" },
          },
        },
      ]);
    } else {
      const seen = new Set();
      latest = memStore.telemetry
        .filter((t) => { if (seen.has(t.vehicleId)) return false; seen.add(t.vehicleId); return true; })
        .map((t) => ({ _id: t.vehicleId, status: t.status, healthScore: t.healthScore, fuelLevel: t.fuelLevel, speed: t.speed, engineTemp: t.engineTemp, maintenanceRisk: t.maintenanceRisk }));
    }

    const totalVehicles = latest.length;
    const availableVehicles = latest.filter((v) => v.status === "available").length;
    const busyVehicles = latest.filter((v) => v.status === "busy").length;
    const maintenanceVehicles = latest.filter((v) => v.status === "maintenance").length;
    const avgHealth = totalVehicles > 0
      ? Math.round(latest.reduce((s, v) => s + (v.healthScore || 0), 0) / totalVehicles)
      : 0;
    const avgFuel = totalVehicles > 0
      ? Math.round(latest.reduce((s, v) => s + (v.fuelLevel || 0), 0) / totalVehicles)
      : 0;
    const alerts = getAlerts(latest.map((v) => ({ ...v, vehicleId: v._id })));

    res.json({
      totalVehicles,
      availableVehicles,
      busyVehicles,
      maintenanceVehicles,
      avgHealth,
      avgFuel,
      alertCount: alerts.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/fleet/vehicles — latest telemetry per vehicle
export const getVehicles = async (req, res) => {
  try {
    let data = [];
    if (isConnected()) {
      data = await Telemetry.aggregate([
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
        { $sort: { vehicleId: 1 } },
      ]);
    } else {
      const seen = new Set();
      data = memStore.telemetry
        .filter((t) => { if (seen.has(t.vehicleId)) return false; seen.add(t.vehicleId); return true; })
        .sort((a, b) => a.vehicleId.localeCompare(b.vehicleId));
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/fleet/alerts
export const getAlertsList = async (req, res) => {
  try {
    let latest = [];
    if (isConnected()) {
      latest = await Telemetry.aggregate([
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: "$vehicleId",
            vehicleId: { $first: "$vehicleId" },
            engineTemp: { $first: "$engineTemp" },
            fuelLevel: { $first: "$fuelLevel" },
            batteryLevel: { $first: "$batteryLevel" },
            healthScore: { $first: "$healthScore" },
            speed: { $first: "$speed" },
          },
        },
      ]);
    } else {
      const seen = new Set();
      latest = memStore.telemetry.filter((t) => { if (seen.has(t.vehicleId)) return false; seen.add(t.vehicleId); return true; });
    }
    const alerts = getAlerts(latest.map((v) => ({ ...v, vehicleId: v.vehicleId || v._id })));
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/fleet/task
export const assignTask = async (req, res) => {
  const task = { ...req.body, assignedAt: new Date(), id: `TASK-${Date.now()}` };
  // In production: persist to Task model
  res.status(201).json({ message: "Task assigned", task });
};

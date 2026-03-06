import express from "express";
import { ingestTelemetry, getVehicleTelemetry, getLatestAll } from "../controllers/telemetryController.js";
import { telemetryLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/", telemetryLimiter, ingestTelemetry);
router.get("/latest", getLatestAll);
router.get("/:vehicleId", getVehicleTelemetry);

export default router;

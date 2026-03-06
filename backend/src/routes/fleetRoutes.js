import express from "express";
import { getFleetStats, getVehicles, getAlertsList, assignTask } from "../controllers/fleetController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", getFleetStats);
router.get("/vehicles", getVehicles);
router.get("/alerts", getAlertsList);
router.post("/task", assignTask);

export default router;

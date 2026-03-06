import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./src/config/db.js";
import { initSocket } from "./src/sockets/socketServer.js";
import { apiLimiter } from "./src/middleware/rateLimiter.js";
import telemetryRoutes from "./src/routes/telemetryRoutes.js";
import fleetRoutes from "./src/routes/fleetRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import anTokenRoutes from "./src/routes/anTokenRoutes.js";

const app = express();
const httpServer = createServer(app);

// Init Socket.io
initSocket(httpServer);

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(apiLimiter);

// Routes
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/fleet", fleetRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/an-token", anTokenRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    platform: "FleetMind AI",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Start
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 FleetMind AI Backend running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io active`);
  console.log(`🔐 Demo login: admin@fleetmind.ai / demo123\n`);
});

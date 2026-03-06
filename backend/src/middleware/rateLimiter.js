import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const telemetryLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 20, // 20 vehicle updates per second
  message: { error: "Rate limit exceeded for telemetry ingestion." },
});

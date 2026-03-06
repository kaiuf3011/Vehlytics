import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { memStore } from "../services/telemetryService.js";
import mongoose from "mongoose";

const isConnected = () => mongoose.connection.readyState === 1;

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    if (isConnected()) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ error: "Email already registered" });
      const user = await User.create({ email, passwordHash, name, role: role || "viewer" });
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
      return res.status(201).json({ token, user: { email: user.email, name: user.name, role: user.role } });
    } else {
      // Demo mode
      if (memStore.users.find((u) => u.email === email)) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const user = { _id: Date.now(), email, passwordHash, name: name || "Fleet Operator", role: role || "admin" };
      memStore.users.push(user);
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
      return res.status(201).json({ token, user: { email, name: user.name, role: user.role } });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Always allow demo credentials
    if (email === "admin@fleetmind.ai" && password === "demo123") {
      const token = jwt.sign({ userId: "demo", role: "admin" }, process.env.JWT_SECRET, { expiresIn: "8h" });
      return res.json({ token, user: { email, name: "Fleet Admin", role: "admin" } });
    }

    if (isConnected()) {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
      return res.json({ token, user: { email: user.email, name: user.name, role: user.role } });
    } else {
      const user = memStore.users.find((u) => u.email === email);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
      return res.json({ token, user: { email, name: user.name, role: user.role } });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/profile
export const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

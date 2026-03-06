import express from "express";
import { AnClient } from "@21st-sdk/node";

const router = express.Router();

// Initialize the 21st SDK Client with the secure API Key
const an = new AnClient({ apiKey: process.env.AN_API_KEY });

// Endpoint to generate a short-lived token for the React frontend
router.post("/", async (req, res) => {
  try {
    const token = await an.tokens.create({ 
      agent: "vehlytics",
      expiresIn: "1h" 
    });
    
    // The create() method returns the token directly as an object { token: "...", expiresAt: "..." }
    res.json({ token: token.token || token });
  } catch (error) {
    console.error("Error generating 21st Agent token:", error);
    res.status(500).json({ error: "Failed to generate AI token" });
  }
});

export default router;

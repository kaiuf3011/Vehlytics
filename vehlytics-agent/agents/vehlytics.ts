import { agent, tool } from "@21st-sdk/agent"
import { z } from "zod"

export default agent({
  model: "claude-sonnet-4-6",
  systemPrompt: "You are the FleetMind AI assistant. You help fleet managers understand their vehicle telemetry, coordinate tasks, and monitor fleet health. Keep your answers concise, professional, and slightly futuristic.",
  tools: {
    getFleetStatus: tool({
      description: "Get the current high-level status of the fleet operations.",
      inputSchema: z.object({}),
      execute: async () => ({
        content: [{ type: "text", text: "The fleet currently has 5 active vehicles. Telemetry latency is sub-4ms. No critical alerts at this time." }],
      }),
    }),
  },
})

# FleetMind AI — Intelligent Fleet Telemetry Platform 🌍🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)

**FleetMind AI** is a production-grade, microservices-oriented fleet management and telemetry platform. Designed with enterprise-grade aesthetics and cutting-edge web technologies, it provides real-time tracking, AI-driven insights, and predictive maintenance for modern vehicle fleets.

---

## 📸 Product Overview

FleetMind AI acts as the central nervous system for commercial fleets. It ingests thousands of data points per second (speed, fuel, engine temp, battery, GPS) and processes them through an intelligent backend to give fleet managers actionable, real-time control.

Whether you're managing electric vehicles (EVs), delivery vans, or heavy transport trucks, FleetMind provides the intelligence needed to optimize routes, predict failures before they happen, and maximize vehicle uptime.

### 🔥 Key Features

*   **Interactive 3D Login**: A breathtaking, draggable WebGL globe powered by COBE to visualize global scale right from the entry point.
*   **Live Telemetry Dashboard**: Real-time WebSocket (Socket.io) integration displaying live speed, health scores, and active alerts.
*   **AI Chat Assistant**: Embedded chat overlay powered by the **21st SDK**, allowing managers to query fleet status naturally (e.g., "Which vehicles need maintenance?").
*   **Live Interactive Map**: Real-time Leaflet tracking of the entire fleet across Tamil Nadu, complete with pulsing status indicators and dynamic HTML markers.
*   **Predictive Maintenance Engine (Mocked)**: AI scoring algorithms that analyze engine temperatures and fuel levels to recommend service before a breakdown occurs.
*   **Dark SaaS UI/UX**: A highly premium, glassmorphic design system using CSS variables, custom scrollbars, and Lucide icons.

---

## 🛠️ Tech Stack

This project is divided into four distinct micro-architectures:

1.  **Backend (Node.js & Express)**
    *   REST API + Socket.io Server for real-time bidirectional events.
    *   MongoDB / Mongoose object modeling.
    *   JWT Authentication & API Rate Limiting.
    *   Integration with `@21st-sdk/node` for secure AI Agent token generation.
2.  **Frontend (Vite & React 19)**
    *   React Router DOM for seamless SPA navigation.
    *   `react-leaflet` & Carto Maps for live geographical tracking.
    *   `recharts` for beautiful, responsive telemetry data visualization.
    *   `@21st-sdk/react` + Vercel AI SDK for the floating chat interface.
    *   Lucide React for consistent, lightweight iconography.
3.  **Vehicle Simulator (Node.js)**
    *   A headless Node script that acts as hardware IoT devices, independently calculating GPS drift, fuel burn rates, and speed fluctuations, injecting live data into the backend every 2 seconds.
4.  **AI Engine (21st Agent)**
    *   A standalone `vehlytics-agent` deployed to the cloud (Claude-Sonnet-4.6) equipped with the system prompt and tools to understand the FleetMind context.

---

## 🚀 Getting Started

Follow these steps to run the complete simulation environment locally.

### Prerequisites

*   Node.js (v18 or higher)
*   MongoDB (running locally on port `27017` or update the URI in `.env`)
*   A 21st Developer API Key (`AN_API_KEY`)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
MONGO_URI=mongodb://localhost:27017/fleetmind
JWT_SECRET=your_super_secret_jwt_key
PORT=5001
NODE_ENV=development
AN_API_KEY=your_21st_api_key_here
```

Start the backend server:
```bash
npm run dev
```

### 2. Simulator Setup

In a new terminal, start the IoT vehicle simulator:
```bash
cd simulator
npm install
node simulator.js
```
*You should see logs indicating that 15 simulated vehicles are broadcasting telemetry.*

### 3. Frontend Setup

In a third terminal, launch the React dashboard:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` (or the port Vite provides).

---

## 📁 Project Structure

```text
Vehlytics/
├── backend/                  # Node/Express API & WebSocket Server
│   ├── src/
│   │   ├── config/           # Database connections
│   │   ├── controllers/      # Route logic (Auth, Telemetry, Fleet)
│   │   ├── middleware/       # JWT Auth & Rate Limiting
│   │   ├── models/           # Mongoose Schemas
│   │   ├── routes/           # Express Routers
│   │   ├── services/         # Business logic
│   │   └── sockets/          # Socket.io event handlers
│   └── server.js             # Entry point
│
├── frontend/                 # Vite + React Dashboard
│   ├── src/
│   │   ├── components/       # Reusable UI (Sidebar, MapView, AIChat)
│   │   ├── context/          # React Context (Auth)
│   │   ├── pages/            # View components (Login, Dashboard)
│   │   ├── services/         # Axios & Socket client instances
│   │   └── theme.json        # 21st SDK Custom UI Theme
│   └── index.css             # Global dark mode SaaS design system
│
├── simulator/                # Mock IoT Data Generator
│   ├── simulator.js          # Physics & transmission logic
│   └── vehicles.json         # Fleet configuration and start coordinates
│
└── vehlytics-agent/          # 21st Agent Cloud Configuration
    └── agents/
        └── vehlytics.ts      # Claude model settings and tool definitions
```

---

## 🤝 Contributing

This project was built rapidly as a hackathon prototype but structured for massive scalability. If you have suggestions or improvements, feel free to open an issue or submit a pull request!

## 📜 License

This project is licensed under the MIT License.

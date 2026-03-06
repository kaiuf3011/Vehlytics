const API_BASE = "http://localhost:5001/api";

export const api = {
  // Auth
  login: (email, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json()),

  register: (data) =>
    fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  // Telemetry
  getVehicleTelemetry: (vehicleId, token) =>
    fetch(`${API_BASE}/telemetry/${vehicleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  getLatestAll: (token) =>
    fetch(`${API_BASE}/telemetry/latest`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  // Fleet
  getFleetStats: (token) =>
    fetch(`${API_BASE}/fleet/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  getVehicles: (token) =>
    fetch(`${API_BASE}/fleet/vehicles`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  getAlerts: (token) =>
    fetch(`${API_BASE}/fleet/alerts`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),

  assignTask: (data, token) =>
    fetch(`${API_BASE}/fleet/task`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
};

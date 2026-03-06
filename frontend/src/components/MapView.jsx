import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

// Fix for default Leaflet icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const STATUS_COLORS = {
  available: "#10d48a",
  busy: "#f59e0b",
  maintenance: "#ef4444",
  offline: "#64748b",
};

// Custom HTML icon for vehicles to match the FleetMind design
const createVehicleIcon = (status, id) => {
  const color = STATUS_COLORS[status] || STATUS_COLORS.offline;
  return L.divIcon({
    className: "vehicle-marker",
    html: `
      <div style="
        width: 16px; height: 16px; 
        background: ${color}; 
        border: 2px solid white; 
        border-radius: 50%;
        box-shadow: 0 0 10px ${color}80;
        position: relative;
      ">
        ${status === 'available' ? `
          <div style="
            position: absolute; top: -6px; left: -6px; right: -6px; bottom: -6px;
            border-radius: 50%; border: 1px solid ${color};
            animation: pulse-ring 2s infinite;
          "></div>
        ` : ''}
      </div>
      <div style="
        font-size: 10px; font-weight: 600; color: white; 
        background: rgba(0,0,0,0.6); padding: 2px 4px; 
        border-radius: 4px; margin-top: 4px;
        white-space: nowrap; transform: translateX(-25%);
      ">${id}</div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// Component to dynamically fit bounds of all markers
function MapBounds({ vehicles }) {
  const map = useMap();

  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const bounds = L.latLngBounds(vehicles.map(v => [v.location?.lat || 10.79, v.location?.lng || 78.70]));
      // Only fit bounds if they are valid
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [vehicles, map]);

  return null;
}

export default function MapView({ vehicles = [] }) {
  // Tamil Nadu center default (approximate center of state)
  const center = [10.7905, 78.7047];

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: 0, overflow: "hidden" }}>
      <div className="card-header" style={{ padding: "16px 20px 12px", borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <MapPin size={15} style={{ color: "var(--cyan)" }} />
          <span className="card-title">Fleet Map — Live Tracking</span>
        </div>
        <div className="flex items-center gap-3">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", minHeight: 400 }}>
        <MapContainer 
          center={center} 
          zoom={12} 
          style={{ height: "100%", width: "100%", background: "#0a0f1c" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">Carto</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <MapBounds vehicles={vehicles} />

          {vehicles.map((v) => {
            if (!v.location?.lat || !v.location?.lng) return null;
            return (
              <Marker 
                key={v.vehicleId} 
                position={[v.location.lat, v.location.lng]}
                icon={createVehicleIcon(v.status, v.vehicleId)}
              >
                <Popup className="dark-popup">
                  <div style={{ color: "var(--text)", padding: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "white", marginBottom: 4 }}>{v.vehicleId}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      <div>Status: <span style={{ color: STATUS_COLORS[v.status] }}>{v.status}</span></div>
                      <div>Speed: {v.speed?.toFixed(0)} km/h</div>
                      <div>Fuel: {v.fuelLevel?.toFixed(0)}%</div>
                      <div>Health: {v.healthScore?.toFixed(0)}%</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(16, 212, 138, 0.7); opacity: 1; }
          100% { transform: scale(1.5); box-shadow: 0 0 0 10px rgba(16, 212, 138, 0); opacity: 0; }
        }
        .vehicle-marker { background: none; border: none; }
        .leaflet-container { font-family: 'Inter', sans-serif; }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: rgba(7, 11, 20, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          color: white;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .leaflet-popup-close-button { color: var(--text-muted) !important; }
      `}</style>
    </div>
  );
}

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader, Truck, Key, AlertTriangle, Rocket } from "lucide-react";
import { InteractiveGlobe } from "../components/InteractiveGlobe.jsx";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@fleetmind.ai");
  const [password, setPassword] = useState("demo123");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(email, password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login-page" style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: 'var(--bg-base)', 
      color: 'white',
      overflow: 'hidden'
    }}>
      {/* Dynamic Background */}
      <div className="login-bg" />
      <div className="login-grid" />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 4, height: 4,
            borderRadius: "50%",
            background: "var(--cyan)",
            opacity: 0.3,
            top: `${15 + i * 12}%`,
            left: `${10 + i * 14}%`,
            animation: `float ${3 + i}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.5}s`,
            zIndex: 1
          }}
        />
      ))}

      {/* Left Side - Login */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', zIndex: 10 }}>
        <div className="login-card" style={{ width: '100%', maxWidth: '420px', margin: 0 }}>
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon" style={{ display: "flex", alignItems: "center" }}><Truck size={28} color="var(--cyan)" /></div>
            <div>
              <div className="login-logo-name">FleetMind AI</div>
              <div className="login-tagline">Intelligent Fleet Telemetry Platform</div>
            </div>
          </div>

          {/* Demo credentials hint */}
          <div className="login-demo">
            <span><Key size={14} style={{ display: "inline", marginBottom: -2 }} /></span>
            <span>Demo: <strong>admin@fleetmind.ai</strong> / <strong>demo123</strong></span>
          </div>

          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to access your fleet dashboard</p>

          {error && <div className="error-msg"><AlertTriangle size={14} style={{ display: "inline", marginBottom: -2 }} /> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="fleet@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  className="input"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)"
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading
                ? <><Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> Authenticating...</>
                : <><Rocket size={16} /> Launch Dashboard</>}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: "16px", background: "rgba(0,212,255,0.04)", borderRadius: 8, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>
              FleetMind AI · Custom Telemetry Engine
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textAlign: "center", marginTop: 4 }}>
              Protected by military-grade AES-256 encryption
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Globe */}
      <div 
        className="globe-container"
        style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          position: 'relative',
          background: 'linear-gradient(to right, rgba(7, 11, 20, 1), rgba(0, 212, 255, 0.03))'
        }}
      >
        <div style={{ position: 'relative', zIndex: 10 }}>
          <InteractiveGlobe 
            size={580} 
            markers={[
              {lat: 37.77, lng: -122.41, size: 0.08}, // SF (HQ)
              {lat: 40.71, lng: -74.00, size: 0.05}, // NYC
              {lat: 51.50, lng: -0.12, size: 0.06},  // London
              {lat: 35.68, lng: 139.69, size: 0.07}, // Tokyo
              {lat: -33.86, lng: 151.20, size: 0.05} // Sydney
            ]} 
          />
          {/* Decorative stats overlay on globe */}
          <div style={{
            position: 'absolute',
            bottom: 40,
            right: 0,
            background: 'rgba(7, 11, 20, 0.8)',
            border: '1px solid var(--border)',
            padding: '16px 24px',
            borderRadius: 'var(--radius)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            gap: 24
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Nodes</div>
              <div style={{ fontSize: '1.4rem', color: 'var(--cyan)', fontWeight: 700 }}>12,408</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Telemetry</div>
              <div style={{ fontSize: '1.4rem', color: 'var(--emerald)', fontWeight: 700 }}>4ms</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float {
          from { transform: translateY(0) rotate(0deg); }
          to { transform: translateY(-20px) rotate(180deg); }
        }
        @media (max-width: 900px) {
          .globe-container { display: none !important; }
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

export function InteractiveGlobe({ size = 520, markers = [] }) {
  const canvasRef = useRef();

  useEffect(() => {
    let phi = 0;
    
    // Convert markers to cobe format: { location: [lat, lng], size: float }
    const cobeMarkers = markers.map(m => ({
      location: [m.lat, m.lng],
      size: m.size || 0.05
    }));

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.15],
      markerColor: [0, 0.83, 1], // Cyan markers to match FleetMind
      glowColor: [0.05, 0.2, 0.3],
      markers: cobeMarkers,
      onRender: (state) => {
        // Slowly rotate globe
        state.phi = phi;
        phi += 0.003;
      }
    });

    return () => {
      globe.destroy();
    };
  }, [size, markers]);

  return (
    <div style={{ width: size, height: size, maxWidth: '100%', aspectRatio: 1, margin: "auto", position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          contain: 'layout paint size',
          cursor: 'auto',
          userSelect: 'none',
        }}
      />
    </div>
  );
}

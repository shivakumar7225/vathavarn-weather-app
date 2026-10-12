import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Layers, Thermometer, CloudRain, Cloud, Wind, Gauge, ZoomIn, ZoomOut, Compass } from "lucide-react";

// Fix standard Leaflet default marker icons for Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LAYERS = [
  { id: "temp_new", label: "Temperature", icon: Thermometer, unit: "°C", legend: "Cold (-40°) to Hot (+40°)" },
  { id: "precipitation_new", label: "Rain Radar", icon: CloudRain, unit: "mm/h", legend: "Light to Heavy Rain" },
  { id: "clouds_new", label: "Clouds", icon: Cloud, unit: "%", legend: "Clear (0%) to Overcast (100%)" },
  { id: "wind_new", label: "Wind Speed", icon: Wind, unit: "m/s", legend: "Calm (0) to Storm (50+ m/s)" },
  { id: "pressure_new", label: "Pressure", icon: Gauge, unit: "hPa", legend: "Low (950) to High (1070 hPa)" },
];

export default function WeatherMapView({ coord, cityName, currentTemp, tempUnit }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const weatherLayerRef = useRef(null);
  const markerRef = useRef(null);

  const [activeLayer, setActiveLayer] = useState("temp_new");
  const [opacity, setOpacity] = useState(0.7);

  const lat = coord?.lat || 17.385;
  const lon = coord?.lon || 78.4867;

  // Initialize Leaflet map once on component mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      if (mapContainerRef.current._leaflet_id) {
        mapContainerRef.current._leaflet_id = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 7,
        zoomControl: false,
      });

      // Base OpenStreetMap Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Weather Overlay Layer whenever activeLayer or opacity changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (weatherLayerRef.current) {
      map.removeLayer(weatherLayerRef.current);
    }

    const tileUrl = `http://localhost:5000/api/map/tiles/${activeLayer}/{z}/{x}/{y}.png`;
    const newLayer = L.tileLayer(tileUrl, {
      opacity: opacity,
      maxZoom: 18,
    });

    newLayer.addTo(map);
    weatherLayerRef.current = newLayer;
  }, [activeLayer, opacity]);

  // Update Center & Marker when city coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView([lat, lon], 7);

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
    } else {
      const marker = L.marker([lat, lon]).addTo(map);
      markerRef.current = marker;
    }

    markerRef.current
      .bindPopup(
        `<div style="text-align: center; font-family: inherit;">
          <strong style="font-size: 15px; color: #222;">${cityName || "Selected City"}</strong>
          <div style="font-size: 18px; color: #EB6E4B; font-weight: 700; margin-top: 4px;">
            ${currentTemp !== undefined ? `${currentTemp}${tempUnit}` : ""}
          </div>
        </div>`
      )
      .openPopup();
  }, [lat, lon, cityName, currentTemp, tempUnit]);

  function handleZoomIn() {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  }

  function handleZoomOut() {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  }

  function handleResetView() {
    if (mapInstanceRef.current) mapInstanceRef.current.setView([lat, lon], 7);
  }

  return (
    <div className="weather-map-view">
      {/* Top Map Header & Layer Selector */}
      <div className="map-view-header">
        <div className="map-header-left">
          <div className="map-title-row">
            <Layers size={20} color="#EB6E4B" />
            <h2>Interactive Weather Radar & Satellite</h2>
          </div>
          <span className="map-subtitle">
            Live global OpenWeather atmospheric overlays centered on {cityName}
          </span>
        </div>

        {/* Layer Switcher Pills */}
        <div className="map-layer-pills">
          {LAYERS.map((layer) => {
            const IconComp = layer.icon;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                className={`layer-pill ${isActive ? "active" : ""}`}
                onClick={() => setActiveLayer(layer.id)}
              >
                <IconComp size={15} />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="map-canvas-wrapper">
        <div ref={mapContainerRef} className="leaflet-map-element" />

        {/* Floating Map Controls */}
        <div className="map-floating-controls">
          <button onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <button onClick={handleResetView} title="Recenter on City">
            <Compass size={18} />
          </button>
        </div>

        {/* Map Legend Overlay */}
        <div className="map-legend-card">
          <div className="legend-header">
            <strong>{LAYERS.find((l) => l.id === activeLayer)?.label} Overlay</strong>
            <span className="legend-sub">
              {LAYERS.find((l) => l.id === activeLayer)?.legend}
            </span>
          </div>

          <div className={`legend-bar legend-${activeLayer}`} />

          <div className="opacity-slider-row">
            <span>Overlay Opacity:</span>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
            />
            <span>{Math.round(opacity * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

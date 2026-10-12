import {
  Compass,
  Sunrise,
  Sunset,
  Droplets,
  Gauge,
  Eye,
  Cloud,
  Wind,
} from "lucide-react";

export default function AnalyticsView({ current, unit }) {
  if (!current) return null;

  const tempUnit = unit === "imperial" ? "°F" : "°C";
  const speedUnit = unit === "imperial" ? "mph" : "m/s";

  // Calculate Cardinal Direction from degrees
  function getCardinalDirection(deg) {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const idx = Math.round(deg / 22.5) % 16;
    return directions[idx];
  }

  // Calculate Dew Point approx: T - ((100 - RH) / 5)
  const dewPoint = (
    current.temperature -
    (100 - current.humidity) / 5
  ).toFixed(1);

  // Solar progress percentage using updated timestamp
  const now = current.updatedAt || current.sunset;
  const daylightDuration = Math.max(current.sunset - current.sunrise, 1);
  const daylightElapsed = Math.min(
    Math.max(now - current.sunrise, 0),
    daylightDuration
  );
  const sunProgressPercent = Math.round(
    (daylightElapsed / daylightDuration) * 100
  );

  const sunriseStr = new Date(current.sunrise * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const sunsetStr = new Date(current.sunset * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const daylightHours = (daylightDuration / 3600).toFixed(1);

  // Pressure evaluation
  const isHighPressure = current.pressure >= 1013;

  return (
    <div className="analytics-view-container">
      <div className="analytics-page-header">
        <div className="page-title-group">
          <Compass size={22} color="#EB6E4B" />
          <h2>Deep Atmospheric Analytics</h2>
        </div>
        <span className="page-subtitle">
          Real-time meteorological gauges and environmental indices for {current.city}
        </span>
      </div>

      <div className="analytics-grid">
        {/* 1. Rotating Wind Compass Card */}
        <div className="analytics-card wind-compass-card">
          <div className="analytics-card-header">
            <div className="card-title-wrap">
              <Wind size={18} color="#10B981" />
              <h3>Wind Velocity & Compass</h3>
            </div>
            <span className="status-pill">{getCardinalDirection(current.windDeg)}</span>
          </div>

          <div className="compass-widget">
            <div className="compass-dial">
              <span className="compass-point north">N</span>
              <span className="compass-point east">E</span>
              <span className="compass-point south">S</span>
              <span className="compass-point west">W</span>

              {/* Rotating Needle */}
              <div
                className="compass-needle"
                style={{ transform: `rotate(${current.windDeg}deg)` }}
              >
                <div className="needle-arrow-north"></div>
                <div className="needle-center-dot"></div>
                <div className="needle-arrow-south"></div>
              </div>
            </div>

            <div className="compass-readouts">
              <div className="readout-primary">
                <span className="readout-num">{current.windSpeed}</span>
                <span className="readout-unit">{speedUnit}</span>
              </div>
              <span className="readout-sub">
                Direction: <strong>{current.windDeg}° ({getCardinalDirection(current.windDeg)})</strong>
              </span>
              {current.windGust && (
                <span className="readout-sub">
                  Peak Gusts: <strong>{current.windGust} {speedUnit}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Solar Arc & Day Cycle Card */}
        <div className="analytics-card solar-arc-card">
          <div className="analytics-card-header">
            <div className="card-title-wrap">
              <Sunrise size={18} color="#F59E0B" />
              <h3>Solar Daylight Cycle</h3>
            </div>
            <span className="status-pill">{daylightHours}h daylight</span>
          </div>

          <div className="solar-arc-visual">
            <svg viewBox="0 0 200 100" className="solar-svg">
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="4"
                strokeDasharray="4 4"
              />
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="4"
                strokeDasharray="250"
                strokeDashoffset={250 - (250 * sunProgressPercent) / 100}
              />
            </svg>
            <div className="solar-time-row">
              <div className="solar-col">
                <Sunrise size={16} color="#F59E0B" />
                <span>Sunrise</span>
                <strong>{sunriseStr}</strong>
              </div>
              <div className="solar-col">
                <Sunset size={16} color="#EA580C" />
                <span>Sunset</span>
                <strong>{sunsetStr}</strong>
              </div>
            </div>
          </div>
          <div className="solar-footer">
            Daylight Progress: <strong>{sunProgressPercent}%</strong>
          </div>
        </div>

        {/* 3. Moisture & Dew Point Card */}
        <div className="analytics-card humidity-card">
          <div className="analytics-card-header">
            <div className="card-title-wrap">
              <Droplets size={18} color="#3B82F6" />
              <h3>Moisture & Dew Point</h3>
            </div>
            <span className="status-pill">
              {current.humidity > 65 ? "Humid" : current.humidity < 30 ? "Dry" : "Comfortable"}
            </span>
          </div>

          <div className="humidity-display">
            <div className="humidity-circle">
              <span className="hum-number">{current.humidity}%</span>
              <span className="hum-label">Relative</span>
            </div>
            <div className="humidity-details">
              <div className="detail-row">
                <span>Calculated Dew Point:</span>
                <strong>{dewPoint}{tempUnit}</strong>
              </div>
              <div className="detail-row">
                <span>Thermal Comfort:</span>
                <strong>
                  {current.humidity > 70
                    ? "Muggy & Sticky"
                    : current.humidity > 45
                    ? "Pleasant"
                    : "Crisp & Dry"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Barometric Pressure Card */}
        <div className="analytics-card pressure-card">
          <div className="analytics-card-header">
            <div className="card-title-wrap">
              <Gauge size={18} color="#8B5CF6" />
              <h3>Barometric Pressure</h3>
            </div>
            <span className="status-pill">
              {isHighPressure ? "High (Fair)" : "Low (Unsettled)"}
            </span>
          </div>

          <div className="pressure-display">
            <div className="pressure-value-block">
              <span className="press-number">{current.pressure}</span>
              <span className="press-unit">hPa</span>
            </div>
            <div className="pressure-bar-track">
              <div
                className="pressure-bar-fill"
                style={{
                  width: `${Math.min(
                    Math.max(((current.pressure - 980) / (1040 - 980)) * 100, 5),
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="pressure-explanation">
              Standard sea level is 1013 hPa. Current reading indicates{" "}
              {isHighPressure
                ? "stable atmosphere with low rain probability."
                : "lower atmospheric pressure, potentially leading to cloud formation."}
            </p>
          </div>
        </div>

        {/* 5. Visibility & Cloud Cover Card */}
        <div className="analytics-card visibility-card">
          <div className="analytics-card-header">
            <div className="card-title-wrap">
              <Eye size={18} color="#EC4899" />
              <h3>Optical Visibility</h3>
            </div>
            <span className="status-pill">
              {current.visibility >= 10000 ? "Excellent" : "Moderate"}
            </span>
          </div>

          <div className="visibility-content">
            <div className="vis-stat-row">
              <div>
                <span className="vis-number">{(current.visibility / 1000).toFixed(1)}</span>
                <span className="vis-unit">km</span>
              </div>
              <div className="cloud-stat">
                <Cloud size={16} color="#6B7280" />
                <span>Cloud Cover: <strong>{current.clouds}%</strong></span>
              </div>
            </div>

            <div className="cloud-bar-track">
              <div
                className="cloud-bar-fill"
                style={{ width: `${current.clouds}%` }}
              />
            </div>

            <p className="vis-explanation">
              {current.visibility >= 10000
                ? "Clear atmospheric transmission. Horizon is sharply visible."
                : "Light mist, haze, or airborne particulates present."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

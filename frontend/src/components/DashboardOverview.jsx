import {
  ArrowRight,
  Wind,
  Droplets,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  CloudRain,
  Compass,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function DashboardOverview({
  current,
  forecast,
  unit,
  onNavigateTab,
}) {
  if (!current) return null;

  const tempUnit = unit === "imperial" ? "°F" : "°C";
  const speedUnit = unit === "imperial" ? "mph" : "m/s";

  const formattedDate = new Date(current.updatedAt * 1000).toLocaleDateString(
    undefined,
    {
      weekday: "long",
      month: "short",
      day: "numeric",
    }
  );

  const formattedTime = new Date(current.updatedAt * 1000).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const sunriseTime = new Date(current.sunrise * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const sunsetTime = new Date(current.sunset * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Next 4 forecast slots for preview
  const nextSlots = (forecast || []).slice(0, 4);

  return (
    <div className="dashboard-overview-container">
      {/* Hero Weather Card */}
      <section className="hero-weather-card">
        <div className="hero-card-left">
          <div className="location-pill">
            <MapPin size={15} color="#EB6E4B" />
            <span>
              {current.city}, {current.country}
            </span>
            <span className="live-indicator">LIVE</span>
          </div>

          <div className="hero-time">
            {formattedDate} • Updated {formattedTime}
          </div>

          <div className="hero-temp-row">
            <span className="hero-temp-value">
              {Number(current.temperature).toFixed(1)}
              <span className="hero-temp-unit">{tempUnit}</span>
            </span>
            <div className="hero-icon-block">
              <img
                src={`https://openweathermap.org/img/wn/${current.icon}@4x.png`}
                alt={current.description}
                className="hero-weather-icon"
              />
              <span className="hero-condition-text">{current.description}</span>
            </div>
          </div>

          <div className="hero-substats">
            <span className="stat-item">
              Feels like: <strong>{Number(current.feelsLike).toFixed(1)}{tempUnit}</strong>
            </span>
            <span className="stat-separator">•</span>
            <span className="stat-item">
              High: <strong>{Math.round(current.tempMax)}{tempUnit}</strong> / Low:{" "}
              <strong>{Math.round(current.tempMin)}{tempUnit}</strong>
            </span>
          </div>
        </div>

        {/* Hero Card Right: Key Quick Conditions */}
        <div className="hero-card-right">
          <div className="hero-metric-tile">
            <Droplets size={20} color="#3B82F6" />
            <div>
              <span className="metric-label">Humidity</span>
              <span className="metric-value">{current.humidity}%</span>
            </div>
          </div>

          <div className="hero-metric-tile">
            <Wind size={20} color="#10B981" />
            <div>
              <span className="metric-label">Wind Speed</span>
              <span className="metric-value">
                {current.windSpeed} {speedUnit}
              </span>
            </div>
          </div>

          <div className="hero-metric-tile">
            <Gauge size={20} color="#F59E0B" />
            <div>
              <span className="metric-label">Pressure</span>
              <span className="metric-value">{current.pressure} hPa</span>
            </div>
          </div>

          <div className="hero-metric-tile">
            <Eye size={20} color="#8B5CF6" />
            <div>
              <span className="metric-label">Visibility</span>
              <span className="metric-value">
                {(current.visibility / 1000).toFixed(1)} km
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Interactive Quick-Jump Sections (Redirect on click) */}
      <div className="dashboard-quick-actions">
        {/* Card 1: Forecast Preview -> Redirects to 'forecast' */}
        <div
          className="interactive-action-card forecast-action-card"
          onClick={() => onNavigateTab("forecast")}
          role="button"
          tabIndex={0}
        >
          <div className="card-header-row">
            <div className="card-badge">
              <CloudRain size={16} />
              <span>Forecast Outlook</span>
            </div>
            <span className="jump-link">
              View 24h & 5-Day <ArrowRight size={14} />
            </span>
          </div>

          <h3 className="action-card-title">Next Few Hours</h3>
          <p className="action-card-desc">
            Upcoming conditions for {current.city}
          </p>

          <div className="mini-forecast-strip">
            {nextSlots.map((slot, i) => (
              <div key={i} className="mini-forecast-item">
                <span className="mini-time">
                  {new Date(slot.dt * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <img
                  src={`https://openweathermap.org/img/wn/${slot.icon}.png`}
                  alt={slot.description}
                  className="mini-icon"
                />
                <span className="mini-temp">
                  {Math.round(slot.temp)}{tempUnit}
                </span>
                {slot.pop > 0 && (
                  <span className="mini-pop">{Math.round(slot.pop * 100)}% rain</span>
                )}
              </div>
            ))}
          </div>

          <button className="card-cta-btn">
            Open Extended Forecast <ArrowRight size={14} />
          </button>
        </div>

        {/* Card 2: Interactive Radar Map Preview -> Redirects to 'maps' */}
        <div
          className="interactive-action-card radar-action-card"
          onClick={() => onNavigateTab("maps")}
          role="button"
          tabIndex={0}
        >
          <div className="card-header-row">
            <div className="card-badge radar-badge">
              <Sparkles size={16} />
              <span>Weather Maps & Radar</span>
            </div>
            <span className="jump-link">
              Launch Radar <ArrowRight size={14} />
            </span>
          </div>

          <h3 className="action-card-title">Interactive Satellite & Radar</h3>
          <p className="action-card-desc">
            Explore live temperature heatmaps, rain clouds, and wind currents
          </p>

          <div className="radar-preview-banner">
            <div className="radar-ring"></div>
            <div className="radar-sweep"></div>
            <div className="radar-pin">
              <MapPin size={20} color="#EB6E4B" />
              <span>{current.city}</span>
            </div>
          </div>

          <button className="card-cta-btn">
            Open Interactive Map <ArrowRight size={14} />
          </button>
        </div>

        {/* Card 3: Deep Atmospheric Analytics -> Redirects to 'analytics' */}
        <div
          className="interactive-action-card analytics-action-card"
          onClick={() => onNavigateTab("analytics")}
          role="button"
          tabIndex={0}
        >
          <div className="card-header-row">
            <div className="card-badge analytics-badge">
              <Compass size={16} />
              <span>Deep Analytics</span>
            </div>
            <span className="jump-link">
              Explore Dials <ArrowRight size={14} />
            </span>
          </div>

          <h3 className="action-card-title">Atmospheric Environment</h3>
          <p className="action-card-desc">
            Solar timeline, wind compass, and moisture indices
          </p>

          <div className="mini-analytics-strip">
            <div className="analytics-pill">
              <Sunrise size={18} color="#F59E0B" />
              <div>
                <span>Sunrise</span>
                <strong>{sunriseTime}</strong>
              </div>
            </div>
            <div className="analytics-pill">
              <Sunset size={18} color="#EA580C" />
              <div>
                <span>Sunset</span>
                <strong>{sunsetTime}</strong>
              </div>
            </div>
            <div className="analytics-pill">
              <Wind size={18} color="#10B981" />
              <div>
                <span>Bearing</span>
                <strong>{current.windDeg}°</strong>
              </div>
            </div>
          </div>

          <button className="card-cta-btn">
            Open Deep Analytics <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

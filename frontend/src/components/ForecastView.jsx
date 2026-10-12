import { useState } from "react";
import {
  Calendar,
  Clock,
  Droplets,
  Wind,
  ChevronDown,
  ChevronUp,
  Umbrella,
} from "lucide-react";

export default function ForecastView({ forecast, unit, cityName }) {
  const [expandedDay, setExpandedDay] = useState(null);

  if (!forecast || forecast.length === 0) {
    return (
      <div className="forecast-empty-state">
        <p>No forecast data available.</p>
      </div>
    );
  }

  const tempUnit = unit === "imperial" ? "°F" : "°C";
  const speedUnit = unit === "imperial" ? "mph" : "m/s";

  // First 8 items = Next 24 hours (every 3 hours)
  const hourlyData = forecast.slice(0, 8);

  // Group remaining items by date for 5-Day summary
  const groupedByDay = forecast.reduce((acc, item) => {
    const dateKey = new Date(item.dt * 1000).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  const dailySummaries = Object.entries(groupedByDay).map(([dateStr, items]) => {
    const minTemp = Math.min(...items.map((i) => i.tempMin));
    const maxTemp = Math.max(...items.map((i) => i.tempMax));
    const maxPop = Math.max(...items.map((i) => i.pop || 0));
    // Midday item for representative icon/description
    const repItem = items[Math.floor(items.length / 2)] || items[0];

    return {
      dateStr,
      minTemp,
      maxTemp,
      maxPop,
      icon: repItem.icon,
      description: repItem.description,
      items,
    };
  });

  // Calculate global min and max for range bar scaling
  const globalMin = Math.min(...dailySummaries.map((d) => d.minTemp));
  const globalMax = Math.max(...dailySummaries.map((d) => d.maxTemp));
  const rangeSpan = Math.max(globalMax - globalMin, 1);

  // SVG Chart dimensions for Hourly Curve
  const chartWidth = 720;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 30;

  const hourlyMin = Math.min(...hourlyData.map((h) => h.temp));
  const hourlyMax = Math.max(...hourlyData.map((h) => h.temp));
  const hourlySpan = Math.max(hourlyMax - hourlyMin, 1);

  // Points for SVG path
  const points = hourlyData.map((h, i) => {
    const x =
      paddingX +
      (i / (hourlyData.length - 1)) * (chartWidth - paddingX * 2);
    const y =
      chartHeight -
      paddingY -
      ((h.temp - hourlyMin) / hourlySpan) * (chartHeight - paddingY * 2);
    return { x, y, ...h };
  });

  // Generate smooth SVG bezier curve
  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX},${prev.y} ${midX},${pt.y} ${pt.x},${pt.y}`;
  }, "");

  // Area under curve
  const areaD = `${pathD} L ${points[points.length - 1].x},${chartHeight} L ${
    points[0].x
  },${chartHeight} Z`;

  return (
    <div className="forecast-view-container">
      {/* 1. 24-Hour Hourly Timeline */}
      <section className="forecast-card-section">
        <div className="section-title-row">
          <div className="title-left">
            <Clock size={20} color="#EB6E4B" />
            <h2>24-Hour Horizon</h2>
          </div>
          <span className="section-subtext">3-Hour Interval Progression for {cityName}</span>
        </div>

        <div className="hourly-chart-wrapper">
          <svg
            className="hourly-svg-chart"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EB6E4B" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#EB6E4B" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#tempGradient)" />
            <path
              d={pathD}
              fill="none"
              stroke="#EB6E4B"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {points.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#FFFFFF"
                  stroke="#EB6E4B"
                  strokeWidth="2.5"
                />
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  fill="#222222"
                  fontSize="12"
                  fontWeight="600"
                >
                  {Math.round(pt.temp)}{tempUnit}
                </text>
              </g>
            ))}
          </svg>

          {/* Time & Rain indicators below graph */}
          <div className="hourly-timeline-footer">
            {hourlyData.map((slot, i) => (
              <div key={i} className="hourly-footer-col">
                <span className="footer-time">
                  {new Date(slot.dt * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <img
                  src={`https://openweathermap.org/img/wn/${slot.icon}.png`}
                  alt={slot.description}
                  className="footer-icon"
                />
                {slot.pop > 0 ? (
                  <span className="footer-pop">
                    <Umbrella size={11} /> {Math.round(slot.pop * 100)}%
                  </span>
                ) : (
                  <span className="footer-dry">Dry</span>
                )}
                <span className="footer-wind">
                  {slot.windSpeed} {speedUnit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. 5-Day Extended Daily Forecast */}
      <section className="forecast-card-section">
        <div className="section-title-row">
          <div className="title-left">
            <Calendar size={20} color="#EB6E4B" />
            <h2>5-Day Extended Forecast</h2>
          </div>
          <span className="section-subtext">Tap any day to expand 3-hour breakdown</span>
        </div>

        <div className="daily-forecast-list">
          {dailySummaries.map((day, idx) => {
            const isExpanded = expandedDay === idx;
            const leftPercent = ((day.minTemp - globalMin) / rangeSpan) * 100;
            const widthPercent = Math.max(
              ((day.maxTemp - day.minTemp) / rangeSpan) * 100,
              8
            );

            return (
              <div
                key={day.dateStr}
                className={`daily-forecast-row ${isExpanded ? "expanded" : ""}`}
              >
                <div
                  className="daily-row-main"
                  onClick={() => setExpandedDay(isExpanded ? null : idx)}
                >
                  <div className="day-name-block">
                    <span className="day-name">
                      {idx === 0 ? "Today" : day.dateStr.split(",")[0]}
                    </span>
                    <span className="day-full-date">{day.dateStr}</span>
                  </div>

                  <div className="day-weather-summary">
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                      alt={day.description}
                      className="summary-icon"
                    />
                    <span className="summary-desc">{day.description}</span>
                    {day.maxPop > 0 && (
                      <span className="summary-rain-pill">
                        <Droplets size={12} /> {Math.round(day.maxPop * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Temperature Range Bar */}
                  <div className="temp-range-container">
                    <span className="range-min-val">
                      {Math.round(day.minTemp)}{tempUnit}
                    </span>
                    <div className="range-track">
                      <div
                        className="range-bar-fill"
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                      />
                    </div>
                    <span className="range-max-val">
                      {Math.round(day.maxTemp)}{tempUnit}
                    </span>
                  </div>

                  <button className="expand-chevron" aria-label="Expand day">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {/* Expanded Accordion: 3-Hour Slot Breakdown */}
                {isExpanded && (
                  <div className="expanded-day-breakdown">
                    <h4>Detailed Interval Breakdown</h4>
                    <div className="breakdown-grid">
                      {day.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="breakdown-item">
                          <span className="breakdown-time">
                            {new Date(item.dt * 1000).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <img
                            src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                            alt={item.description}
                          />
                          <span className="breakdown-temp">
                            {Math.round(item.temp)}{tempUnit}
                          </span>
                          <span className="breakdown-desc">{item.description}</span>
                          <div className="breakdown-stats">
                            <span>
                              <Droplets size={12} /> {item.humidity}%
                            </span>
                            <span>
                              <Wind size={12} /> {item.windSpeed} {speedUnit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

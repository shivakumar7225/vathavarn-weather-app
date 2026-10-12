import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import DashboardOverview from "./components/DashboardOverview";
import ForecastView from "./components/ForecastView";
import WeatherMapView from "./components/WeatherMapView";
import AnalyticsView from "./components/AnalyticsView";
import { AlertCircle, Loader2 } from "lucide-react";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("metric");
  const [selectedCity, setSelectedCity] = useState("Medchal");

  // Fetch weather data from our Node.js backend
  async function loadWeather(cityParam, latParam, lonParam, unitParam = unit) {
    setLoading(true);
    setError("");

    try {
      let url = "http://localhost:5000/api/weather?";
      if (latParam !== undefined && lonParam !== undefined) {
        url += `lat=${latParam}&lon=${lonParam}&units=${unitParam}`;
      } else {
        const cityToQuery = cityParam || selectedCity || "Medchal";
        url += `city=${encodeURIComponent(cityToQuery)}&units=${unitParam}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load weather data.");
      }

      setWeatherData(data);
      if (data.current?.city) {
        setSelectedCity(data.current.city);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Unable to reach the Vathavarn backend server.");
    } finally {
      setLoading(false);
    }
  }

  // Load initial city on startup
  useEffect(() => {
    const timer = setTimeout(() => {
      loadWeather("Medchal", undefined, undefined, "metric");
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When unit toggles, reload with current city/coordinates in new unit
  function handleUnitChange(newUnit) {
    setUnit(newUnit);
    if (weatherData?.current) {
      loadWeather(weatherData.current.city, undefined, undefined, newUnit);
    }
  }

  function handleSearchCity(cityName, lat, lon) {
    if (lat !== undefined && lon !== undefined) {
      loadWeather(undefined, lat, lon, unit);
    } else {
      loadWeather(cityName, undefined, undefined, unit);
    }
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadWeather(undefined, pos.coords.latitude, pos.coords.longitude, unit);
      },
      (err) => {
        setLoading(false);
        setError(err.message || "Location permission denied. Please search your city manually.");
      }
    );
  }

  const current = weatherData?.current;
  const forecast = weatherData?.forecast || [];

  return (
    <div className="vathavarn-app-layout">
      {/* Top Navbar with Branding, Search Autocomplete, Unit Toggle & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearchCity={handleSearchCity}
        onUseCurrentLocation={handleUseCurrentLocation}
        unit={unit}
        setUnit={handleUnitChange}
        loading={loading}
      />

      {/* Main Content Area */}
      <main className="vathavarn-main-content">
        {/* Error Notification */}
        {error && (
          <div className="vathavarn-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="vathavarn-loading-bar">
            <Loader2 size={18} className="spinner-icon" />
            <span>Fetching real-time atmospheric data for {selectedCity}...</span>
          </div>
        )}

        {/* Dynamic View Display */}
        {current && (
          <div className="view-content-wrapper">
            {activeTab === "overview" && (
              <DashboardOverview
                current={current}
                forecast={forecast}
                unit={unit}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === "forecast" && (
              <ForecastView
                forecast={forecast}
                unit={unit}
                cityName={current.city}
              />
            )}

            {activeTab === "maps" && (
              <WeatherMapView
                coord={current.coord}
                cityName={current.city}
                currentTemp={Math.round(current.temperature)}
                tempUnit={unit === "imperial" ? "°F" : "°C"}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsView current={current} unit={unit} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="vathavarn-footer">
        <div className="footer-content">
          <p className="footer-left">
            <strong>Vathavarn</strong> • Atmospheric & Meteorological Dashboard
          </p>
          <p className="footer-right">
            Powered by OpenWeatherMap API • Built with React & Node.js
          </p>
        </div>
      </footer>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Compass, BarChart3, Map, CloudSun, Loader2 } from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
  onSearchCity,
  onUseCurrentLocation,
  unit,
  setUnit,
  loading,
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Handle input text change and reset suggestions if empty
  function handleInputChange(e) {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim() || val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  // Debounced search for city suggestions
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await fetch(
          `http://localhost:5000/api/search?q=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Autocomplete error:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectSuggestion(item) {
    setQuery(item.name);
    setShowSuggestions(false);
    onSearchCity(item.name, item.lat, item.lon);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      onSearchCity(query.trim());
    }
  }

  return (
    <header className="vathavarn-header">
      <div className="header-top">
        {/* Brand Logo */}
        <div className="brand-container" onClick={() => setActiveTab("overview")}>
          <div className="brand-logo-icon">
            <CloudSun size={28} color="#EB6E4B" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Vathavarn</span>
            <span className="brand-tagline">Atmospheric Intelligence</span>
          </div>
        </div>

        {/* Global Search & Location Controls */}
        <div className="search-wrapper" ref={containerRef}>
          <form className="search-bar" onSubmit={handleSubmit}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search city, district, or place (e.g. Medchal)..."
              value={query}
              onChange={handleInputChange}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
            />
            {searching && <Loader2 size={16} className="spinner-icon" />}
            <button type="submit" disabled={loading}>
              Search
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((item, idx) => (
                <li
                  key={`${item.lat}-${item.lon}-${idx}`}
                  onClick={() => handleSelectSuggestion(item)}
                >
                  <MapPin size={14} className="sugg-pin" />
                  <span className="sugg-name">{item.name}</span>
                  {item.state && <span className="sugg-state">{item.state},</span>}
                  <span className="sugg-country">{item.country}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Controls: GPS Location & Unit Switcher */}
        <div className="header-actions">
          <button
            type="button"
            className="action-btn location-action"
            onClick={onUseCurrentLocation}
            title="Detect My Location"
            disabled={loading}
          >
            <MapPin size={16} />
            <span className="btn-label">My Location</span>
          </button>

          {/* Unit Toggle */}
          <div className="unit-toggle" role="group" aria-label="Temperature Unit">
            <button
              type="button"
              className={unit === "metric" ? "active" : ""}
              onClick={() => setUnit("metric")}
            >
              °C
            </button>
            <button
              type="button"
              className={unit === "imperial" ? "active" : ""}
              onClick={() => setUnit("imperial")}
            >
              °F
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="header-nav">
        <button
          className={`nav-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <BarChart3 size={16} />
          <span>Dashboard Overview</span>
        </button>
        <button
          className={`nav-tab ${activeTab === "forecast" ? "active" : ""}`}
          onClick={() => setActiveTab("forecast")}
        >
          <CloudSun size={16} />
          <span>24h & 5-Day Forecast</span>
        </button>
        <button
          className={`nav-tab ${activeTab === "maps" ? "active" : ""}`}
          onClick={() => setActiveTab("maps")}
        >
          <Map size={16} />
          <span>Interactive Weather Radar</span>
        </button>
        <button
          className={`nav-tab ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <Compass size={16} />
          <span>Deep Analytics</span>
        </button>
      </nav>
    </header>
  );
}

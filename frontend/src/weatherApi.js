/**
 * weatherApi.js — Unified API helper
 *
 * In development: routes through the Node.js backend (http://localhost:5000)
 * In production (GitHub Pages): calls OpenWeatherMap directly using
 * the bundled public OpenWeatherMap API key.
 */

const IS_PRODUCTION =
  import.meta.env.PROD &&
  !window.location.hostname.includes("localhost");

const BACKEND_URL = "http://localhost:5000";

// Public OpenWeatherMap API key bundled for the GitHub Pages deployment
const DEFAULT_API_KEY = "a9bdd20fbcd1bf4cc9c74f72067d82e9";
const STORAGE_KEY = "vathavarn_owm_key";

export function getApiKey() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_KEY;
}

export function isProduction() {
  return IS_PRODUCTION;
}

// ── Fetch weather data ──────────────────────────────────────────────
export async function fetchWeather({ city, lat, lon, units = "metric" }) {
  if (!IS_PRODUCTION) {
    // Development — use backend proxy
    let url = `${BACKEND_URL}/api/weather?`;
    if (lat !== undefined && lon !== undefined) {
      url += `lat=${lat}&lon=${lon}&units=${units}`;
    } else {
      url += `city=${encodeURIComponent(city)}&units=${units}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load weather data.");
    return data;
  }

  // Production — call OpenWeatherMap directly with the public key
  const apiKey = getApiKey();
  const params = new URLSearchParams({ appid: apiKey, units });
  if (lat !== undefined && lon !== undefined) {
    params.set("lat", lat);
    params.set("lon", lon);
  } else {
    params.set("q", city);
  }

  const [currentRes, forecastRes] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}`),
  ]);

  const currentData = await currentRes.json();
  const forecastData = await forecastRes.json();

  if (!currentRes.ok) {
    throw new Error(currentData.message || "Unable to fetch current weather.");
  }

  // Format to match the backend response shape
  const current = {
    city: currentData.name || "Unknown Location",
    country: currentData.sys?.country || "",
    coord: currentData.coord || { lat: 0, lon: 0 },
    temperature: currentData.main?.temp ?? 0,
    feelsLike: currentData.main?.feels_like ?? 0,
    tempMin: currentData.main?.temp_min ?? 0,
    tempMax: currentData.main?.temp_max ?? 0,
    humidity: currentData.main?.humidity ?? 0,
    pressure: currentData.main?.pressure ?? 1013,
    visibility: currentData.visibility ?? 10000,
    windSpeed: currentData.wind?.speed ?? 0,
    windDeg: currentData.wind?.deg ?? 0,
    windGust: currentData.wind?.gust ?? null,
    description: currentData.weather?.[0]?.description || "Clear",
    main: currentData.weather?.[0]?.main || "Clear",
    icon: currentData.weather?.[0]?.icon || "01d",
    clouds: currentData.clouds?.all ?? 0,
    sunrise: currentData.sys?.sunrise || Math.floor(Date.now() / 1000),
    sunset: currentData.sys?.sunset || Math.floor(Date.now() / 1000),
    updatedAt: currentData.dt || Math.floor(Date.now() / 1000),
    timezone: currentData.timezone || 0,
  };

  const forecast = (forecastData.list || []).map((item) => ({
    dt: item.dt,
    dtTxt: item.dt_txt,
    temp: item.main?.temp ?? 0,
    feelsLike: item.main?.feels_like ?? 0,
    tempMin: item.main?.temp_min ?? 0,
    tempMax: item.main?.temp_max ?? 0,
    humidity: item.main?.humidity ?? 0,
    pressure: item.main?.pressure ?? 1013,
    description: item.weather?.[0]?.description || "Clear",
    main: item.weather?.[0]?.main || "Clear",
    icon: item.weather?.[0]?.icon || "01d",
    pop: item.pop || 0,
    windSpeed: item.wind?.speed ?? 0,
    windDeg: item.wind?.deg ?? 0,
  }));

  return { current, forecast, units };
}

// ── Search cities ───────────────────────────────────────────────────
export async function searchCities(query) {
  if (!IS_PRODUCTION) {
    const res = await fetch(
      `${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}`
    );
    if (res.ok) return await res.json();
    return [];
  }

  const apiKey = getApiKey();
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    query
  )}&limit=5&appid=${apiKey}`;
  const res = await fetch(url);
  if (res.ok) return await res.json();
  return [];
}

// ── Map tile URL ────────────────────────────────────────────────────
export function getMapTileUrl(layer) {
  if (!IS_PRODUCTION) {
    return `${BACKEND_URL}/api/map/tiles/${layer}/{z}/{x}/{y}.png`;
  }
  const apiKey = getApiKey();
  return `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${apiKey}`;
}

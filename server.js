const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Vathavarn Weather API backend is running!");
});

// Autocomplete city search
app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "API key is not configured." });
    }

    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      q.trim()
    )}&limit=5&appid=${apiKey}`;

    const response = await fetch(geoUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data.message || "Failed to search cities.",
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ message: "Server error searching cities." });
  }
});

// Weather endpoint: fetches Current Weather + 5-Day / 3-Hour Forecast
app.get("/api/weather", async (req, res) => {
  try {
    const { city, lat, lon, units = "metric" } = req.query;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        message: "Please provide a city name or coordinates.",
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: "OpenWeatherMap API key is not configured.",
      });
    }

    // Prepare URL params for current weather
    const currentWeatherUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
    const forecastUrl = new URL("https://api.openweathermap.org/data/2.5/forecast");

    if (lat && lon) {
      currentWeatherUrl.searchParams.set("lat", lat);
      currentWeatherUrl.searchParams.set("lon", lon);
      forecastUrl.searchParams.set("lat", lat);
      forecastUrl.searchParams.set("lon", lon);
    } else {
      currentWeatherUrl.searchParams.set("q", city);
      forecastUrl.searchParams.set("q", city);
    }

    currentWeatherUrl.searchParams.set("appid", apiKey);
    currentWeatherUrl.searchParams.set("units", units);
    forecastUrl.searchParams.set("appid", apiKey);
    forecastUrl.searchParams.set("units", units);

    // Fetch both in parallel
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    if (!currentRes.ok) {
      return res.status(currentRes.status).json({
        message: currentData.message || "Unable to fetch current weather.",
      });
    }

    // Format current data safely
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

    // Format forecast list (3-hour intervals)
    const forecastList = (forecastData.list || []).map((item) => ({
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
      pop: item.pop || 0, // probability of precipitation (0 to 1)
      windSpeed: item.wind?.speed ?? 0,
      windDeg: item.wind?.deg ?? 0,
    }));

    res.json({
      current,
      forecast: forecastList,
      units,
    });
  } catch (error) {
    console.error("Weather error:", error.message);
    res.status(500).json({
      message: "Server error while fetching weather data.",
    });
  }
});

// Proxy OpenWeatherMap Tile Layers for Interactive Weather Maps
app.get("/api/map/tiles/:layer/:z/:x/:y.png", async (req, res) => {
  try {
    const { layer, z, x, y } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).send("API key not configured.");
    }

    const tileUrl = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;
    const response = await fetch(tileUrl);

    if (!response.ok) {
      return res.status(response.status).send("Failed to retrieve map tile.");
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Map tile proxy error:", error.message);
    res.status(500).send("Server error proxying map tile.");
  }
});

app.listen(PORT, () => {
  console.log(`Vathavarn backend running at http://localhost:${PORT}`);
});

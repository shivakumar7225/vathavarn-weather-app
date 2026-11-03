# 🌤️ Vathavarn — Atmospheric & Meteorological Dashboard

> **Real-time weather intelligence powered by OpenWeatherMap API**  
> Built with React 19 + Vite (frontend) and Node.js + Express (backend)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?style=for-the-badge&logo=github)](https://shivakumar7225.github.io/vathavarn-weather-app/)
[![Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/shivakumar7225/vathavarn-weather-app)

🌐 **Live Website:** [https://shivakumar7225.github.io/vathavarn-weather-app/](https://shivakumar7225.github.io/vathavarn-weather-app/)

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🌡️ **Current Weather** | Live temperature, feels-like, humidity, pressure, wind, visibility |
| 📅 **5-Day / 3-Hour Forecast** | Detailed forecast with precipitation probability |
| 🗺️ **Interactive Weather Radar** | Live tile-layer maps (clouds, rain, wind, temperature, pressure) via Leaflet |
| 📊 **Deep Analytics** | Wind compass, UV index, air quality insights, and atmospheric breakdowns |
| 🔍 **City Autocomplete Search** | Debounced real-time city suggestions from OpenWeatherMap Geocoding API |
| 📍 **GPS Location Detection** | One-click "My Location" using browser Geolocation API |
| 🌡️ **Unit Toggle** | Switch between °C (metric) and °F (imperial) on the fly |
| 🔒 **Secure API Proxy** | Backend proxies all API calls — your API key is never exposed to the browser |

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express 5** — REST API server
- **dotenv** — Environment variable management
- **cors** — Cross-origin resource sharing

### Frontend
- **React 19** + **Vite 8** — Modern, lightning-fast UI
- **Lucide React** — Icon library
- **Leaflet** — Interactive weather map tiles
- Custom **CSS** with responsive layout

---

## 📁 Project Structure

```
vathavarn/
├── server.js               # Express backend (API proxy)
├── package.json            # Backend dependencies
├── .env.example            # Environment variable template
├── .gitignore
├── LICENSE
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json        # Frontend dependencies
    └── src/
        ├── App.jsx                   # Main app with routing logic
        ├── App.css                   # Global styles
        ├── main.jsx
        └── components/
            ├── Navbar.jsx            # Search, GPS, unit toggle, nav tabs
            ├── DashboardOverview.jsx # Current weather overview
            ├── ForecastView.jsx      # 5-day forecast cards
            ├── WeatherMapView.jsx    # Interactive Leaflet map
            └── AnalyticsView.jsx     # Wind compass + analytics
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js v18+
- A free [OpenWeatherMap API Key](https://openweathermap.org/api)

### 1. Clone the Repository

```bash
git clone https://github.com/shivakumar7225/vathavarn-weather-app.git
cd vathavarn-weather-app
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and add your API key:

```env
PORT=5000
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
```

### 3. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm install --prefix frontend
```

### 4. Run the App

**Development mode (run both servers):**

```bash
# Terminal 1 — Backend
npm run dev

# Terminal 2 — Frontend
npm run dev:frontend
```

- Backend API: http://localhost:5000
- Frontend App: http://localhost:5173

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/weather?city={name}&units={metric\|imperial}` | Current weather + 5-day forecast |
| `GET` | `/api/weather?lat={lat}&lon={lon}&units={metric\|imperial}` | Weather by GPS coordinates |
| `GET` | `/api/search?q={query}` | City autocomplete suggestions |
| `GET` | `/api/map/tiles/:layer/:z/:x/:y.png` | Proxied OWM weather map tiles |

---

## 🔐 Security

- API keys are stored server-side in `.env` and **never exposed** to the browser
- The Express backend acts as a secure proxy for all OpenWeatherMap requests
- `.env` is listed in `.gitignore` — your secrets are safe

---

## 📸 Views

| Dashboard Overview | 5-Day Forecast | Weather Radar | Analytics |
|---|---|---|---|
| Live weather cards with wind, humidity & pressure | 3-hour interval forecast over 5 days | Interactive Leaflet map with layer toggles | Wind compass, pressure gauge & more |

---

## 📦 Build for Production

```bash
# Build the frontend
npm run build --prefix frontend

# Start the backend (serves the built frontend)
npm start
```

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgements

- [OpenWeatherMap API](https://openweathermap.org/api) — Weather data provider
- [Leaflet.js](https://leafletjs.com/) — Interactive maps
- [Lucide React](https://lucide.dev/) — Beautiful icons
- [Vite](https://vitejs.dev/) + [React](https://react.dev/) — Frontend stack

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/shivakumar7225">shivakumar7225</a>
</p>


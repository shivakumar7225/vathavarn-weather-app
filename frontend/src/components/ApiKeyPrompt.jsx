import { useState } from "react";
import { KeyRound, ExternalLink } from "lucide-react";

export default function ApiKeyPrompt({ onSubmit }) {
  const [key, setKey] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (key.trim()) onSubmit(key.trim());
  }

  return (
    <div className="api-key-overlay">
      <div className="api-key-card">
        <div className="api-key-icon">
          <KeyRound size={40} color="#EB6E4B" />
        </div>
        <h2>Welcome to Vathavarn</h2>
        <p>
          To fetch live weather data, please enter your free{" "}
          <strong>OpenWeatherMap API key</strong>.
        </p>
        <a
          href="https://home.openweathermap.org/api_keys"
          target="_blank"
          rel="noopener noreferrer"
          className="api-key-link"
        >
          Get a free API key here <ExternalLink size={14} />
        </a>
        <form onSubmit={handleSubmit} className="api-key-form">
          <input
            type="text"
            placeholder="Paste your API key here..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={!key.trim()}>
            Start Exploring Weather →
          </button>
        </form>
        <p className="api-key-note">
          Your key is stored only in your browser's localStorage and is never
          sent to any third-party server.
        </p>
      </div>
    </div>
  );
}


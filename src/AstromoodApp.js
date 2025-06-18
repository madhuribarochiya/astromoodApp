import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css"; 


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const LocationSelector = ({ setCoordinates }) => {
  useMapEvents({
    click(e) {
      setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
};

const AstroMoodApp = () => {
  const [mood, setMood] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [birthtime, setBirthtime] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

//   const generatePrompt = () => {
//     if (!mood.trim()) return null;

//     let prompt = `You're a wise cosmic oracle.\n\n`;
//     prompt += `User's mood: "${mood}"\n`;

//     if (birthdate || birthtime || coordinates) {
//       if (birthdate) prompt += `Birthdate: ${birthdate}\n`;
//       if (birthtime) prompt += `Birth time: ${birthtime}\n`;
//       if (coordinates) prompt += `Birth coordinates: Latitude ${coordinates.lat}, Longitude ${coordinates.lng}\n`;

//       prompt += `\nGive a personalized astrology reading with:\n`;
//     } else {
//       prompt += `\nGive a mood-based imaginative astrology reading with:\n`;
//     }

//     prompt += `1. 🪐 Planetary Alignment\n`;
//     prompt += `2. ♈ Zodiac Energy\n`;
//     prompt += `3. 🌱 2 Practical Actions they should take today\n\nBe poetic yet useful.`;

//     return prompt;
//   };
const generatePrompt = () => {
    let prompt = `You are an expert AI astrologer named AstroGPT — a wise, poetic oracle of the stars, blending ancient celestial knowledge with modern insights.I am provinding you the mood of the user. Do consider that mood and justify as per the planetory positions. why is it so\n\n`;
  
    prompt += `MOOD:\n"${mood}"\n\n`;
  
    if (birthdate || birthtime || coordinates) {
      prompt += `BIRTH INFO:\n`;
      if (birthdate) prompt += `- Date: ${birthdate}\n`;
      if (birthtime) prompt += `- Time: ${birthtime}\n`;
      if (coordinates) prompt += `- Coordinates: Latitude ${coordinates.lat}, Longitude ${coordinates.lng}\n`;
    }
  
    prompt += `\nRespond using this format:\n`;
    prompt += `🪐 1. Planetary Snapshot\n♈ 2. Emotional Translation\n🌟 3. Personalized Insight\n🔧 4. Actionable Cosmic Advice\n✨ 5. Closing Affirmation\n\n`;
    prompt += `Be poetic, insightful, and slightly mystical. Avoid technical astrology jargon.\n`;
  
    return prompt;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prompt = generatePrompt();
    if (!prompt) return alert("Please describe your mood.");

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AstroMoodApp",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      const output = data.choices?.[0]?.message?.content || "No response from the stars.";
      setResponse(output);
    } catch (err) {
      setResponse("⚠️ Error contacting the cosmos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h2>🔮 AstroMood App</h2>
      <p>Share your current mood — and optionally your birth details — to receive a personalized cosmic insight.</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>Mood *</label>
        <textarea
          placeholder="Describe your feelings today..."
          rows="3"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          required
        />

        <label>Birthdate</label>
        <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />

        <label>Birth Time</label>
        <input type="time" value={birthtime} onChange={(e) => setBirthtime(e.target.value)} />

        <label>Birthplace (Click on the map to select)</label>
        <MapContainer
          center={[20.5937, 78.9629]} // Center of India by default
          zoom={4}
          className="leaflet-container"
          style={{ height: 300, width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationSelector setCoordinates={setCoordinates} />
          {coordinates && <Marker position={[coordinates.lat, coordinates.lng]} />}
        </MapContainer>

        {coordinates && (
          <p className="coordinates">
            📍 Selected: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Reading your stars..." : "Get My Cosmic Reading"}
        </button>
      </form>

      {response && (
        <div className="response-box">
          <h3>🌌 Your Reading</h3>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
};

export default AstroMoodApp;

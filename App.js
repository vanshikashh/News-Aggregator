import "../src/App.css";
import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Circle,
  Tooltip,
} from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix broken icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Handles clicks for fetching news
function ClickHandler({ onCitySelected }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

      try {
        const response = await axios.get(nominatimUrl);
        const city =
          response.data.address.city ||
          response.data.address.town ||
          response.data.address.village ||
          response.data.address.state ||
          "Unknown";

        onCitySelected(city, [lat, lng]);
      } catch (err) {
        console.error("Reverse geocoding failed", err);
      }
    },
  });

  return null;
}

// Handles hover over any location
function HoverHandler({ setHoverCity, setHoverPosition }) {
  useMapEvents({
    mousemove: async (e) => {
      const { lat, lng } = e.latlng;

      // Throttle API calls
      if (
        !window._lastHoverFetch ||
        Date.now() - window._lastHoverFetch > 700
      ) {
        window._lastHoverFetch = Date.now();

        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const city =
            res.data.address.city ||
            res.data.address.town ||
            res.data.address.village ||
            res.data.address.hamlet ||
            res.data.address.state ||
            "Unknown";

          setHoverCity(city);
          setHoverPosition([lat, lng]);
        } catch (err) {
          setHoverCity("");
          setHoverPosition(null);
        }
      }
    },
    mouseout: () => {
      setHoverCity("");
      setHoverPosition(null);
    },
  });

  return null;
}

// Main component
function App() {
  const [news, setNews] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [clickedPosition, setClickedPosition] = useState(null);
  const [hoverCity, setHoverCity] = useState("");
  const [hoverPosition, setHoverPosition] = useState(null);

  const fetchNews = async (city, position) => {
    setSelectedCity(city);
    setClickedPosition(position);

    try {
      const res = await axios.get(`http://127.0.0.1:5000/news/${city}`);
      console.log(res.data.articles);
      setNews(res.data.articles);
    } catch (error) {
      console.error("News fetch error", error);
      setNews([]);
    }
  };

  return (
    
    <div style={{ display: "flex" }}>
    <MapContainer
    center={[23.5, 80]}
    zoom={5}
    style={{ height: "100vh", width: "70%", cursor: "crosshair" }}
  >

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <ClickHandler onCitySelected={fetchNews} />
        <HoverHandler setHoverCity={setHoverCity} setHoverPosition={setHoverPosition} />

        {/* Hover Tooltip at all times */}
        {hoverPosition && hoverCity && (
          <Circle
            center={hoverPosition}
            radius={0.01}
            pathOptions={{ color: "transparent", fillOpacity: 0 }}
            interactive={false}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
              {hoverCity}
            </Tooltip>
          </Circle>
        )}

        {/* Clicked city indicator */}
        {clickedPosition && (
          <Circle
            center={clickedPosition}
            radius={50000}
            pathOptions={{
              color: "blue",
              fillColor: "lightblue",
              fillOpacity: 0.5,
            }}
            eventHandlers={{
              mouseover: (e) =>
                e.target.setStyle({
                  color: "red",
                  fillColor: "pink",
                  fillOpacity: 0.7,
                }),
              mouseout: (e) =>
                e.target.setStyle({
                  color: "blue",
                  fillColor: "lightblue",
                  fillOpacity: 0.5,
                }),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              {selectedCity}
            </Tooltip>
          </Circle>
        )}
      </MapContainer>

      {/* News Sidebar */}
    <div
    style={{
      padding: "1rem",
      width: "30%",
      overflowY: "auto",
      height: "100vh",
      borderLeft: "1px solid #ddd",
      backgroundColor: "#f9f9f9",
    }}
    >

        <h2>Top News {selectedCity && `for ${selectedCity}`}</h2>
        {news.length === 0 && <p>Click on a region to load news.</p>}
        {news.map((article, index) => (
  <div
    key={index}
    style={{
      display: "flex",
      gap: "1rem",
      marginBottom: "1.5rem",
      padding: "1rem",
      borderRadius: "12px",
      backgroundColor: "#ffffff",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.02)";
      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.06)";
    }}
    
  >
    {/* Thumbnail section (shown only if image exists) */}
    {article.urlToImage && (
      <img
        src={article.urlToImage}
        alt="Thumbnail"
        style={{
          width: "100px",
          height: "100px",
          objectFit: "cover",
          borderRadius: "8px",
          flexShrink: 0,
        }}
      />
    )}

    {/* Text section */}
    <div style={{ flex: 1 }}>
      <h4
        style={{
          marginBottom: "0.5rem",
          color: "#222",
          fontSize: "1.05rem",
        }}
      >
        {article.title}
      </h4>
      <a
        href={article.url}
        target="_blank"
        rel="noreferrer"
        style={{
          color: "#2a64f6",
          textDecoration: "none",
          fontWeight: "500",
        }}
      >
        Read more →
      </a>
    </div>
  </div>
  
))}
      </div>
    </div>
  );
  
}
export default App;

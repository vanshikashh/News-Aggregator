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
import "./App.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function timeAgo(dateStr) {
  const now = new Date();
  const published = new Date(dateStr);
  const diffMs = now - published;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

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

function HoverHandler({ setHoverCity, setHoverPosition }) {
  useMapEvents({
    mousemove: async (e) => {
      const { lat, lng } = e.latlng;
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

function App() {
  const [news, setNews] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [clickedPosition, setClickedPosition] = useState(null);
  const [hoverCity, setHoverCity] = useState("");
  const [hoverPosition, setHoverPosition] = useState(null);
  const [searchCity, setSearchCity] = useState("");
  const [showIndiaNews, setShowIndiaNews] = useState(false);
  const [indiaNews, setIndiaNews] = useState([]);

  const fetchNews = async (city, position) => {
    setSelectedCity(city);
    setClickedPosition(position);
    try {
      const res = await axios.get(`http://127.0.0.1:5000/news/${city}`);
      setNews(res.data.articles);
    } catch (error) {
      console.error("News fetch error", error);
      setNews([]);
    }
  };

  const handleSearch = async () => {
    if (!searchCity.trim()) return;
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?city=${searchCity}&format=json&limit=1`
      );
      if (res.data.length > 0) {
        const { lat, lon } = res.data[0];
        fetchNews(searchCity, [parseFloat(lat), parseFloat(lon)]);
      } else {
        alert("City not found. Please try a different name.");
      }
    } catch (error) {
      console.error("City search failed:", error);
      alert("Something went wrong while searching.");
    }
  };

  const toggleIndiaNews = async () => {
    if (!showIndiaNews && indiaNews.length === 0) {
      try {
        const res = await axios.get("http://127.0.0.1:5000/news/india");
        setIndiaNews(res.data.articles);
      } catch (err) {
        console.error("Failed to fetch India news", err);
      }
    }
    setShowIndiaNews((prev) => !prev);
  };

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <button onClick={toggleIndiaNews} className="show-news-btn">
        {showIndiaNews ? "Show Map View" : "Show Top India News"}
      </button>

      {!showIndiaNews ? (
        <div style={{ display: "flex", height: "100%" }}>
          <MapContainer
            center={[23.5, 80]}
            zoom={5}
            style={{ width: "70%", cursor: "crosshair" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickHandler onCitySelected={fetchNews} />
            <HoverHandler
              setHoverCity={setHoverCity}
              setHoverPosition={setHoverPosition}
            />

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

            {clickedPosition && (
              <Circle
                center={clickedPosition}
                radius={50000}
                pathOptions={{
                  color: "blue",
                  fillColor: "lightblue",
                  fillOpacity: 0.5,
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  {selectedCity}
                </Tooltip>
              </Circle>
            )}
          </MapContainer>

          <div className="sidebar">
            <div>
              <input
                type="text"
                placeholder="Search city..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <button onClick={handleSearch} className="search-btn">
                Search
              </button>
            </div>

            <h2>Top News {selectedCity && `for ${selectedCity}`}</h2>
            {news.length === 0 && <p>Click on a region to load news.</p>}
            {news.map((article, index) => (
              <div className="news-card" key={index}>
                {article.urlToImage && (
                  <img src={article.urlToImage} alt="Thumbnail" />
                )}
                <div className="news-content">
                  <h4>{article.title}</h4>
                  <p>{timeAgo(article.publishedAt)}</p>
                  <a href={article.url} target="_blank" rel="noreferrer">
                    Read more →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="india-view">
  <h2>Top News in India</h2>
  <div className="news-grid">
    {indiaNews.map((article, index) => (
      <div className="news-card" key={index}>
        {article.urlToImage && (
          <img src={article.urlToImage} alt="Thumbnail" />
        )}
        <div className="news-content">
          <h4>{article.title}</h4>
          <p>{timeAgo(article.publishedAt)}</p>
          <a href={article.url} target="_blank" rel="noreferrer">
            Read more →
          </a>
        </div>
      </div>
    ))}
  </div>
</div>

      )}
    </div>
  );
}

export default App;

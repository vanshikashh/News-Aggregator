import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Circle,
  Popup,
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

function App() {
  const [news, setNews] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [clickedPosition, setClickedPosition] = useState(null);

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

  return (
    <div style={{ display: "flex" }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100vh", width: "70%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler onCitySelected={fetchNews} />

        {clickedPosition && (
          <Circle
            center={clickedPosition}
            radius={50000}
            pathOptions={{ color: "blue" }}
          >
            <Popup>{selectedCity}</Popup>
          </Circle>
        )}
      </MapContainer>

      <div
        style={{
          padding: "1rem",
          width: "30%",
          overflowY: "scroll",
          height: "100vh",
        }}
      >
        <h2>Top News {selectedCity && `for ${selectedCity}`}</h2>
        {news.length === 0 && <p>Click on a region to load news.</p>}
        {news.map((article, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <h4>{article.title}</h4>
            <a href={article.url} target="_blank" rel="noreferrer">
              Read more
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

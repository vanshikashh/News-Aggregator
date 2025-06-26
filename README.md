# News Aggregator App

An interactive web application that displays top news headlines from various cities and regions around the world using a dynamic map interface. Built with **React** (frontend) and **Flask** (backend), this app allows users to click on a region and view real-time news fetched via the NewsAPI.

---

## Features

* Interactive map (OpenStreetMap with Leaflet)
* Click anywhere to highlight a region and fetch its news
* Real-time top headlines using NewsAPI
* Region/city detection via reverse geocoding (Nominatim)
* Responsive layout with React and Leaflet
* Click feedback with highlighted region and popup name

---

## Folder Structure

```
News Aggregator App/
├── backend/
│   └── app.py              # Flask backend with NewsAPI integration
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React map + news logic
│   │   └── index.css       # Styling and custom cursor
│   └── package.json        # React dependencies
```

---

## Tech Stack

* **Frontend:** React, Leaflet, Axios
* **Backend:** Flask, Flask-CORS, Requests
* **APIs:** [NewsAPI](https://newsapi.org), [Nominatim OpenStreetMap](https://nominatim.org)

---

## Setup Instructions

### Prerequisites

* Node.js & npm
* Python 3.x
* Git (optional but recommended)

---

### Backend Setup (Flask)

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # or source venv/bin/activate (Mac/Linux)
pip install flask flask-cors requests
```

1. Create a `.env` or set your NewsAPI key directly in `app.py`:

   ```python
   NEWS_API_KEY = 'your_newsapi_key_here'
   ```

2. Start the server:

```bash
python app.py
```

Server runs at `http://127.0.0.1:5000`

---

### Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

App will run at `http://localhost:3000`

---

## Usage

1. Open the frontend in your browser (`http://localhost:3000`)
2. Click on any region on the map
3. The app will:

   * Highlight the region
   * Show a popup with the city name
   * Fetch and display top news headlines in a side panel

---

## Known Issues

* NewsAPI free tier has rate limits
* Nominatim may return generic region names (e.g., state instead of city)

---

## Contributions

Pull requests and issues are welcome!
Feel free to improve the UI, add new features, or suggest optimizations.

---

## License

MIT License

---

## Acknowledgements

* [NewsAPI](https://newsapi.org)
* [OpenStreetMap](https://www.openstreetmap.org)
* [Leaflet.js](https://leafletjs.com)

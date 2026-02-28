# Weather Explorer

Weather Explorer is a responsive, API-key-free weather app built with plain HTML, CSS, and JavaScript.

## Highlights

- No API key required (powered by Open-Meteo)
- Search by city or supported Indian state names
- Current weather with 4-day forecast
- 12-hour timeline (temperature, rain chance, condition code)
- Air quality insights (US AQI, PM2.5, PM10)
- Extra details: feels like, humidity, wind, pressure, UV, sunrise/sunset
- Dynamic backgrounds and weather aura effects
- Favorites with localStorage persistence
- Celsius/Fahrenheit unit toggle
- Current location support (browser geolocation)

## Tech Stack

- `index.html` for structure
- `styles.css` for layout, theme, and animations
- `script.js` for API calls, state, rendering, and interactions

## Quick Start

1. Clone or download this project.
2. Open `index.html` in a browser.
3. Search for a city and view live weather data.

No build tools, package install, or API key setup is needed.

## Recommended Local Run

For best browser behavior (especially geolocation), run via a local server instead of opening files directly:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

This is a static site and can be hosted on:

- GitHub Pages
- Netlify
- Vercel

Upload/push these files as-is:

- `index.html`
- `styles.css`
- `script.js`

## Notes

- Favorites and last searched city are stored in browser localStorage.
- Geolocation requires browser permission and works best over HTTPS.

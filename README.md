# Weather Explorer

Weather Explorer is a responsive weather app that now works without any API key setup.

## What Changed

- Removed API key prompt/input flow completely
- Migrated weather data to Open-Meteo (no key required)
- Added extra weather details:
  - Pressure
  - UV Index
  - Sunrise/Sunset times
- Added air quality insights (US AQI, PM2.5, PM10)
- Added next 12-hour timeline
- Added favorite city chips for one-click weather lookup
- Kept weather effects, mood text, forecast cards, unit toggle, and location support

## Features

- Search by city or mapped Indian state capital
- Current weather + 4-day forecast
- Daily high/low and rain probability
- Dynamic visual effects by weather type
- Air quality card with AQI band
- Hourly strip (temperature, rain chance, condition marker)
- Favorite cities (saved in localStorage)
- Celsius/Fahrenheit toggle
- Current location weather
- Loading skeleton and disabled controls while fetching

## Project Structure

- `index.html` - app structure
- `styles.css` - styles and animations
- `script.js` - fetch + render logic
- `README.md` - documentation

## Run

1. Open `index.html` in browser.
2. Enter city/state and click `Get Weather`.
3. No API key is needed.

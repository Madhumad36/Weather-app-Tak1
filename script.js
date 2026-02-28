/* =======================
   ELEMENT REFERENCES
======================= */
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const locateBtn = document.getElementById("locateBtn");
const unitToggle = document.getElementById("unitToggle");
const weatherApp = document.querySelector(".weather-app");
const saveFavoriteBtn = document.getElementById("saveFavoriteBtn");
const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");
const favoriteCitiesEl = document.getElementById("favoriteCities");

const cityLabel = document.getElementById("cityLabel");
const tempLabel = document.getElementById("tempLabel");
const descLabel = document.getElementById("descLabel");
const weatherMood = document.getElementById("weatherMood");

const weatherAura = document.getElementById("weatherAura");

const feelsLikeEl = document.getElementById("feelsLike");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const pressureEl = document.getElementById("pressure");
const uvEl = document.getElementById("uvIndex");
const sunEl = document.getElementById("sunInfo");
const aqiValueEl = document.getElementById("aqiValue");
const pm25ValueEl = document.getElementById("pm25Value");
const pm10ValueEl = document.getElementById("pm10Value");
const aqiBandEl = document.getElementById("aqiBand");
const hourlyStripEl = document.getElementById("hourlyStrip");

const forecastCards = document.querySelectorAll(".forecast-card");

const loadingEl = document.getElementById("loading");
const alertBanner = document.getElementById("alertBanner");

/* =======================
   STATE
======================= */
let isCelsius = true;
let lastTempC = null;
let lastFeelsC = null;
let lastForecastDays = [];
let lastHourlyData = null;
let lastHourlyCurrentTime = null;
let currentCityName = "";
let favoriteCities = loadFavorites();

const BODY_BG_CLASSES = [
    "default-bg",
    "sunny",
    "cloudy",
    "rainy",
    "snowy",
    "misty",
    "thunderstorm",
    "windy",
    "sandstorm",
    "smoky",
    "severe"
];

const AURA_CLASSES = [
    "aura-clear",
    "aura-clouds",
    "aura-rain",
    "aura-drizzle",
    "aura-thunderstorm",
    "aura-snow",
    "aura-mist",
    "aura-smoke",
    "aura-haze",
    "aura-dust",
    "aura-fog",
    "aura-sand",
    "aura-ash",
    "aura-squall",
    "aura-tornado"
];

const WEATHER_PROFILES = {
    clear: { label: "Clear", mood: "Clear skies. Great time to step outside.", aura: "aura-clear", bg: "sunny" },
    clouds: { label: "Cloudy", mood: "Cloud cover today. Light and calm atmosphere.", aura: "aura-clouds", bg: "cloudy" },
    rain: { label: "Rain", mood: "Rain around you. Keep an umbrella nearby.", aura: "aura-rain", bg: "rainy" },
    drizzle: { label: "Drizzle", mood: "Light drizzle in the area.", aura: "aura-drizzle", bg: "rainy" },
    thunderstorm: { label: "Storm", mood: "Thunderstorm detected. Outdoor caution advised.", aura: "aura-thunderstorm", bg: "thunderstorm" },
    snow: { label: "Snow", mood: "Snowfall conditions. Dress warmly.", aura: "aura-snow", bg: "snowy" },
    mist: { label: "Mist", mood: "Low visibility due to mist.", aura: "aura-mist", bg: "misty" },
    smoke: { label: "Smoke", mood: "Smoky air conditions. Limit prolonged exposure.", aura: "aura-smoke", bg: "smoky" },
    haze: { label: "Haze", mood: "Hazy atmosphere. Visibility may be reduced.", aura: "aura-haze", bg: "misty" },
    dust: { label: "Dust", mood: "Dust in the air. Eye and mask protection helps.", aura: "aura-dust", bg: "sandstorm" },
    fog: { label: "Fog", mood: "Fog detected. Drive slowly and carefully.", aura: "aura-fog", bg: "misty" },
    sand: { label: "Sand", mood: "Sandy conditions are active.", aura: "aura-sand", bg: "sandstorm" },
    ash: { label: "Ash", mood: "Volcanic ash in the area. Stay indoors if possible.", aura: "aura-ash", bg: "smoky" },
    squall: { label: "Wind", mood: "Strong squall winds. Secure loose items.", aura: "aura-squall", bg: "windy" },
    tornado: { label: "Tornado", mood: "Severe tornado alert conditions.", aura: "aura-tornado", bg: "severe" }
};

const stateToCity = {
    "andhra pradesh": "amaravati",
    telangana: "hyderabad",
    "tamil nadu": "chennai",
    karnataka: "bengaluru",
    kerala: "thiruvananthapuram",
    maharashtra: "mumbai",
    gujarat: "gandhinagar",
    rajasthan: "jaipur",
    "uttar pradesh": "lucknow",
    "madhya pradesh": "bhopal",
    "west bengal": "kolkata",
    bihar: "patna",
    odisha: "bhubaneswar",
    assam: "guwahati",
    punjab: "chandigarh",
    haryana: "chandigarh",
    jharkhand: "ranchi",
    chhattisgarh: "raipur",
    uttarakhand: "dehradun",
    "himachal pradesh": "shimla",
    "jammu and kashmir": "srinagar",
    goa: "panaji"
};

/* =======================
   EVENT LISTENERS
======================= */
searchBtn.addEventListener("click", () => fetchWeather());
cityInput.addEventListener("keydown", event => {
    if (event.key === "Enter") fetchWeather();
});
unitToggle.addEventListener("click", toggleUnit);
locateBtn.addEventListener("click", getLocationWeather);
saveFavoriteBtn.addEventListener("click", saveCurrentCityToFavorites);
clearFavoritesBtn.addEventListener("click", clearFavorites);

/* =======================
   FETCH FLOW (NO API KEY)
======================= */
async function fetchWeather(cityOverride = null) {
    const rawCity = (cityOverride || cityInput.value).trim();
    if (!rawCity) {
        showAlert("Enter a city or Indian state name.");
        return;
    }

    const candidates = buildSearchCandidates(rawCity);
    setLoadingState(true);
    showAlert("");

    try {
        let place = null;
        for (const candidate of candidates) {
            place = await geocodeCity(candidate);
            if (place) break;
        }

        if (!place) {
            showAlert("Location not found.");
            return;
        }

        localStorage.setItem("lastCity", place.name);
        cityInput.value = place.name;
        await fetchByCoords(place.latitude, place.longitude, place.name, place.timezone);
    } catch (error) {
        console.error(error);
        showAlert("Network error. Please try again.");
    } finally {
        setLoadingState(false);
    }
}

async function fetchByCoords(lat, lon, placeName = "Current Location", timezone = "auto") {
    const currentParams = [
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "wind_speed_10m",
        "surface_pressure",
        "weather_code",
        "is_day"
    ].join(",");

    const dailyParams = [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_probability_max",
        "sunrise",
        "sunset"
    ].join(",");

    const hourlyParams = [
        "uv_index",
        "temperature_2m",
        "precipitation_probability",
        "weather_code"
    ].join(",");

    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=${currentParams}&daily=${dailyParams}&hourly=${hourlyParams}&timezone=${encodeURIComponent(timezone || "auto")}`;
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10,us_aqi&timezone=${encodeURIComponent(timezone || "auto")}`;

    const [forecastData, airData] = await Promise.all([
        fetchJson(forecastUrl),
        fetchJson(airQualityUrl)
    ]);

    if (!forecastData?.current || !forecastData?.daily) {
        showAlert("Weather data unavailable for this location.");
        return;
    }

    renderCurrentWeather(forecastData, placeName);
    renderForecast(forecastData.daily);
    renderAirQuality(airData, forecastData.current.time);
    renderHourlyForecast(forecastData.hourly, forecastData.current.time);
    applyAlertFromCurrent(forecastData.current);
}

async function geocodeCity(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const data = await fetchJson(url);
    if (!Array.isArray(data?.results) || data.results.length === 0) return null;

    const result = data.results[0];
    return {
        name: [result.name, result.admin1, result.country].filter(Boolean).join(", "),
        latitude: result.latitude,
        longitude: result.longitude,
        timezone: result.timezone || "auto"
    };
}

function buildSearchCandidates(input) {
    const normalized = input.trim().replace(/\s+/g, " ");
    const lowered = normalized.toLowerCase();
    const mapped = stateToCity[lowered] || lowered;
    const parts = normalized.split(",").map(part => part.trim()).filter(Boolean);
    const primary = parts[0]?.toLowerCase() || "";
    const firstTwo = parts.slice(0, 2).join(" ").toLowerCase();
    const noCountry = parts.filter(part => part.toLowerCase() !== "india").join(" ").toLowerCase();

    const candidates = [mapped, lowered, noCountry, firstTwo, primary].filter(Boolean);
    return [...new Set(candidates)];
}

/* =======================
   RENDERERS
======================= */
function renderCurrentWeather(data, placeName) {
    const current = data.current;
    const condition = normalizeCondition(mapCodeToCondition(current.weather_code));
    const profile = WEATHER_PROFILES[condition] || WEATHER_PROFILES.clouds;

    currentCityName = placeName;
    cityLabel.textContent = placeName;
    descLabel.textContent = codeDescription(current.weather_code);
    weatherMood.textContent = profile.mood;

    lastTempC = current.temperature_2m;
    lastFeelsC = current.apparent_temperature;

    humidityEl.textContent = `Humidity: ${Math.round(current.relative_humidity_2m)}%`;
    windEl.textContent = `Wind: ${Math.round(current.wind_speed_10m)} km/h`;
    pressureEl.textContent = `Pressure: ${Math.round(current.surface_pressure)} hPa`;

    const uvNow = findUvForTimestamp(data.hourly, current.time);
    uvEl.textContent = `UV Index: ${uvNow !== null ? uvNow.toFixed(1) : "--"}`;

    const sunrise = data.daily.sunrise?.[0];
    const sunset = data.daily.sunset?.[0];
    sunEl.textContent = `Sun: ${formatTime(sunrise)} / ${formatTime(sunset)}`;

    updateBackground(profile.bg);
    updateAura(profile.aura);
    renderTemperature();
}

function renderAirQuality(airData, currentTime) {
    if (!airData?.hourly?.time) {
        aqiValueEl.textContent = "US AQI: --";
        pm25ValueEl.textContent = "PM2.5: -- ug/m3";
        pm10ValueEl.textContent = "PM10: -- ug/m3";
        aqiBandEl.textContent = "Band: --";
        return;
    }

    const aqi = findHourlyValueAtOrNearest(airData.hourly.time, airData.hourly.us_aqi, currentTime);
    const pm25 = findHourlyValueAtOrNearest(airData.hourly.time, airData.hourly.pm2_5, currentTime);
    const pm10 = findHourlyValueAtOrNearest(airData.hourly.time, airData.hourly.pm10, currentTime);

    aqiValueEl.textContent = `US AQI: ${aqi !== null ? Math.round(aqi) : "--"}`;
    pm25ValueEl.textContent = `PM2.5: ${pm25 !== null ? pm25.toFixed(1) : "--"} ug/m3`;
    pm10ValueEl.textContent = `PM10: ${pm10 !== null ? pm10.toFixed(1) : "--"} ug/m3`;
    aqiBandEl.textContent = `Band: ${aqiBand(aqi)}`;
}

function renderHourlyForecast(hourly, currentTime) {
    lastHourlyData = hourly;
    lastHourlyCurrentTime = currentTime;
    hourlyStripEl.innerHTML = "";
    if (!hourly?.time || !hourly?.temperature_2m) return;

    const start = hourly.time.indexOf(currentTime);
    const startIndex = start >= 0 ? start : 0;
    const endIndex = Math.min(startIndex + 12, hourly.time.length);

    for (let i = startIndex; i < endIndex; i += 1) {
        const hour = document.createElement("div");
        hour.className = "hour-item";

        const time = document.createElement("span");
        time.className = "hour-time";
        time.textContent = formatHour(hourly.time[i]);

        const icon = document.createElement("span");
        icon.className = "hour-icon";
        icon.textContent = codeSymbol(hourly.weather_code?.[i]);

        const temp = document.createElement("span");
        temp.className = "hour-temp";
        temp.textContent = `${Math.round(toUserTemp(hourly.temperature_2m[i]))}${tempUnitLabel()}`;

        const pop = document.createElement("span");
        pop.className = "hour-pop";
        pop.textContent = `Rain ${Math.round(hourly.precipitation_probability?.[i] || 0)}%`;

        hour.append(time, icon, temp, pop);
        hourlyStripEl.appendChild(hour);
    }
}

function renderForecast(daily) {
    lastForecastDays = [];
    const days = Math.min(forecastCards.length, daily.time?.length || 0);

    for (let i = 0; i < days; i += 1) {
        lastForecastDays.push({
            dayName: new Date(daily.time[i]).toLocaleDateString("en-US", { weekday: "short" }),
            maxTempC: daily.temperature_2m_max[i],
            minTempC: daily.temperature_2m_min[i],
            popMax: (daily.precipitation_probability_max?.[i] || 0) / 100,
            weatherCode: daily.weather_code[i]
        });
    }

    forecastCards.forEach((card, index) => {
        const dayData = lastForecastDays[index];
        if (!dayData) return;
        card.querySelector(".day-name").textContent = dayData.dayName;
        card.querySelector(".icon").textContent = codeSymbol(dayData.weatherCode);
    });

    renderForecastDetails();
}

function renderTemperature() {
    if (lastTempC === null || lastFeelsC === null) return;
    tempLabel.textContent = `${Math.round(toUserTemp(lastTempC))} ${tempUnitLabel()}`;
    feelsLikeEl.textContent = `Feels like: ${Math.round(toUserTemp(lastFeelsC))} ${tempUnitLabel()}`;
}

function renderForecastDetails() {
    forecastCards.forEach((card, index) => {
        const dayData = lastForecastDays[index];
        if (!dayData) return;

        const high = Math.round(toUserTemp(dayData.maxTempC));
        const low = Math.round(toUserTemp(dayData.minTempC));
        card.querySelector(".day-range").textContent = `H: ${high}${tempUnitLabel()} / L: ${low}${tempUnitLabel()}`;
        card.querySelector(".day-rain").textContent = `Rain: ${Math.round(dayData.popMax * 100)}%`;
    });
}

/* =======================
   HELPERS
======================= */
async function fetchJson(url) {
    const response = await fetch(url);
    return response.json();
}

function mapCodeToCondition(code) {
    if (code === 0) return "clear";
    if ([1, 2, 3].includes(code)) return "clouds";
    if ([45, 48].includes(code)) return "fog";
    if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
    if ([95, 96, 99].includes(code)) return "thunderstorm";
    return "clouds";
}

function codeDescription(code) {
    const descriptions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Rime fog",
        51: "Light drizzle",
        53: "Drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Snow",
        75: "Heavy snow",
        80: "Rain showers",
        81: "Rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Strong thunderstorm with hail"
    };
    return descriptions[code] || "Weather update";
}

function codeSymbol(code) {
    const symbols = {
        0: "SUN",
        1: "SUN",
        2: "CLD",
        3: "CLD",
        45: "FOG",
        48: "FOG",
        51: "DRZ",
        53: "DRZ",
        55: "DRZ",
        56: "DRZ",
        57: "DRZ",
        61: "RAN",
        63: "RAN",
        65: "RAN",
        66: "RAN",
        67: "RAN",
        71: "SNW",
        73: "SNW",
        75: "SNW",
        77: "SNW",
        80: "SHR",
        81: "SHR",
        82: "SHR",
        85: "SNW",
        86: "SNW",
        95: "STR",
        96: "STR",
        99: "STR"
    };
    return symbols[code] || "WTH";
}

function findUvForTimestamp(hourly, currentTime) {
    if (!hourly?.time || !hourly?.uv_index) return null;
    const index = hourly.time.indexOf(currentTime);
    if (index < 0) return null;
    const value = hourly.uv_index[index];
    return typeof value === "number" ? value : null;
}

function findHourlyValueAtOrNearest(times, values, currentTime) {
    if (!Array.isArray(times) || !Array.isArray(values) || times.length === 0) return null;
    const exact = times.indexOf(currentTime);
    if (exact >= 0 && typeof values[exact] === "number") return values[exact];

    const current = new Date(currentTime).getTime();
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < times.length; i += 1) {
        const distance = Math.abs(new Date(times[i]).getTime() - current);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = i;
        }
    }

    return typeof values[bestIndex] === "number" ? values[bestIndex] : null;
}

function aqiBand(aqi) {
    if (aqi === null) return "--";
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
}

function formatTime(dateTime) {
    if (!dateTime) return "--";
    return new Date(dateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatHour(dateTime) {
    return new Date(dateTime).toLocaleTimeString("en-US", { hour: "numeric" });
}

function normalizeCondition(condition) {
    return (condition || "").trim().toLowerCase();
}

function toUserTemp(tempC) {
    return isCelsius ? tempC : tempC * 9 / 5 + 32;
}

function tempUnitLabel() {
    return isCelsius ? "C" : "F";
}

function setLoadingState(isLoading) {
    loadingEl.classList.toggle("hidden", !isLoading);
    weatherApp.classList.toggle("is-loading", isLoading);
    searchBtn.disabled = isLoading;
    locateBtn.disabled = isLoading;
    unitToggle.disabled = isLoading;
    cityInput.disabled = isLoading;
    saveFavoriteBtn.disabled = isLoading;
    clearFavoritesBtn.disabled = isLoading;
}

function showAlert(message) {
    alertBanner.textContent = message;
    alertBanner.classList.toggle("hidden", !message);
}

function toggleUnit() {
    if (lastTempC === null) return;
    isCelsius = !isCelsius;
    unitToggle.classList.toggle("unit-active", !isCelsius);
    renderTemperature();
    renderForecastDetails();
    if (lastHourlyData && lastHourlyCurrentTime) {
        renderHourlyForecast(lastHourlyData, lastHourlyCurrentTime);
    }
}

function loadFavorites() {
    try {
        const data = JSON.parse(localStorage.getItem("favoriteCities") || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveFavorites() {
    localStorage.setItem("favoriteCities", JSON.stringify(favoriteCities));
}

function renderFavoriteCities() {
    favoriteCitiesEl.innerHTML = "";
    if (favoriteCities.length === 0) {
        const empty = document.createElement("span");
        empty.className = "favorite-empty";
        empty.textContent = "No favorites yet";
        favoriteCitiesEl.appendChild(empty);
        return;
    }

    favoriteCities.forEach(city => {
        const chipWrap = document.createElement("div");
        chipWrap.className = "favorite-chip-wrap";

        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "favorite-chip";
        chip.textContent = city;
        chip.addEventListener("click", () => fetchWeather(city));

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "favorite-remove";
        removeBtn.setAttribute("aria-label", `Remove ${city} from favorites`);
        removeBtn.textContent = "x";
        removeBtn.addEventListener("click", () => removeFavoriteCity(city));

        chipWrap.append(chip, removeBtn);
        favoriteCitiesEl.appendChild(chipWrap);
    });
}

function saveCurrentCityToFavorites() {
    const city = currentCityName || cityInput.value.trim();
    if (!city) {
        showAlert("Search a city first, then save it as favorite.");
        return;
    }

    if (!favoriteCities.includes(city)) {
        favoriteCities = [city, ...favoriteCities].slice(0, 8);
        saveFavorites();
        renderFavoriteCities();
        showAlert("");
    }
}

function removeFavoriteCity(city) {
    favoriteCities = favoriteCities.filter(item => item !== city);
    saveFavorites();
    renderFavoriteCities();
}

function clearFavorites() {
    favoriteCities = [];
    saveFavorites();
    renderFavoriteCities();
    showAlert("Favorites cleared.");
}

/* ---------- LOCATION ---------- */
function getLocationWeather() {
    if (!navigator.geolocation) {
        showAlert("Geolocation is not supported in this browser.");
        return;
    }

    setLoadingState(true);
    showAlert("");

    navigator.geolocation.getCurrentPosition(
        async pos => {
            try {
                await fetchByCoords(pos.coords.latitude, pos.coords.longitude, "Current Location", "auto");
            } catch (error) {
                console.error(error);
                showAlert("Unable to fetch location weather.");
            } finally {
                setLoadingState(false);
            }
        },
        () => {
            setLoadingState(false);
            showAlert("Location permission denied.");
        }
    );
}

/* ---------- VISUALS ---------- */
function updateBackground(backgroundClass) {
    document.body.classList.remove(...BODY_BG_CLASSES);
    document.body.classList.add(backgroundClass || "default-bg");
}

function updateAura(auraClass) {
    weatherAura.classList.remove(...AURA_CLASSES);
    if (auraClass) weatherAura.classList.add(auraClass);
}

/* ---------- ALERTS ---------- */
function applyAlertFromCurrent(current) {
    const condition = mapCodeToCondition(current.weather_code);
    if (current.temperature_2m >= 40) {
        showAlert("Heat alert: stay hydrated and avoid prolonged sun exposure.");
    } else if (condition === "thunderstorm") {
        showAlert("Severe weather alert: avoid open areas and stay indoors.");
    } else if (condition === "rain" || condition === "drizzle") {
        showAlert("Rain alert: roads may be slippery.");
    }
}

/* =======================
   LOAD LAST CITY
======================= */
const lastCity = localStorage.getItem("lastCity");
renderFavoriteCities();
if (lastCity) {
    cityInput.value = lastCity;
    fetchWeather(lastCity);
}

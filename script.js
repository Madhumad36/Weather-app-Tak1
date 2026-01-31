const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

const cityLabel = document.getElementById("cityLabel");
const tempLabel = document.getElementById("tempLabel");
const descLabel = document.getElementById("descLabel");
const weatherIcon = document.querySelector(".weather-icon");

const forecastCards = document.querySelectorAll(".forecast-card");

const API_KEY = "da5cc509bc967933cf9f957a7a06eb9b";

searchBtn.addEventListener("click", fetchWeather);

async function fetchWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        alert("Please enter a city name");
        return;
    }

    try {
        const currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
        const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;

        const currentRes = await fetch(currentURL);
        const currentData = await currentRes.json();

        cityLabel.textContent = currentData.name;
        tempLabel.textContent = `${Math.round(currentData.main.temp)} °C`;
        descLabel.textContent = currentData.weather[0].description;
        updateBackground(currentData.weather[0].main);


        weatherIcon.innerHTML = `
            <img src="https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png">
        `;

        const forecastRes = await fetch(forecastURL);
        const forecastData = await forecastRes.json();

        forecastCards.forEach((card, i) => {
            const data = forecastData.list[i * 8];
            const day = new Date(data.dt_txt).toLocaleDateString("en-US", { weekday: "short" });

            card.querySelector(".day-name").textContent = day;
            card.querySelector(".icon").innerHTML = `
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
            `;
            card.querySelector(".day-temp").textContent = `${Math.round(data.main.temp)} °C`;
        });

    } catch (err) {
        console.error("Weather fetch failed:", err);
        alert("Unable to fetch weather data.");
    }
}
function updateBackground(condition) {
    document.body.className = ""; // reset

    switch (condition.toLowerCase()) {
        case "clear":
            document.body.classList.add("sunny");
            break;
        case "clouds":
            document.body.classList.add("cloudy");
            break;
        case "rain":
        case "drizzle":
        case "thunderstorm":
            document.body.classList.add("rainy");
            break;
        case "snow":
            document.body.classList.add("snowy");
            break;
        case "mist":
        case "haze":
        case "fog":
            document.body.classList.add("misty");
            break;
        default:
            document.body.classList.add("default-bg");
    }
}

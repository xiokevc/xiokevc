const fs = require("fs");
const fetch = require("node-fetch");

const README_PATH = "./README.md";
const LAT = 44.9778;
const LON = -93.2650;

async function getWeather() {
  try {
    console.log("Fetching weather data...");
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&temperature_unit=fahrenheit`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data || !data.current_weather) {
      console.warn("No current_weather data found");
      return "Weather unavailable";
    }

    const temp = data.current_weather.temperature;
    const code = data.current_weather.weathercode;
    const wind = data.current_weather.windspeed;

    const descriptions = {
      0: "Clear sky ☀️",
      1: "Mainly clear 🌤️",
      2: "Partly cloudy ⛅",
      3: "Overcast ☁️",
      45: "Foggy 🌫️",
      48: "Rime fog 🌫️",
      51: "Light drizzle 🌦️",
      53: "Moderate drizzle 🌦️",
      55: "Dense drizzle 🌧️",
      61: "Slight rain 🌧️",
      63: "Moderate rain 🌧️",
      65: "Heavy rain ⛈️",
      71: "Slight snow ❄️",
      73: "Moderate snow ❄️",
      75: "Heavy snow ❄️",
      80: "Rain showers 🌧️",
      81: "Mod. rain showers 🌧️",
      82: "Violent showers ⛈️",
      95: "Thunderstorm ⛈️",
      99: "Hailstorm 🌨️",
    };

    const text = descriptions[code] || "Unknown weather";

    const weatherText = `${text} ${temp.toFixed(1)}°F | Wind: ${wind.toFixed(1)} mph`;

    console.log(`Weather data received: ${weatherText}`);
    return weatherText;
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return "Weather unavailable";
  }
}

function makeSVG(weather) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="180" role="img" aria-label="Animated introduction with weather information">
  <style>
    .fade-in {
      animation: fadeIn 1.5s ease forwards;
      opacity: 0;
      fill: #333;
    }
    .fade-in.delay-1 { animation-delay: 0s; }
    .fade-in.delay-2 { animation-delay: 1.5s; }
    .fade-in.delay-3 { animation-delay: 3s; }

    @keyframes fadeIn {
      to {
        opacity: 1;
        fill: #4A90E2;
      }
    }
  </style>

  <text x="20" y="40" font-size="18" class="fade-in delay-1">
    👋 Hi, I'm Kevin
  </text>
  <text x="20" y="80" font-size="18" class="fade-in delay-2">
    🌤️ Weather: ${weather}
  </text>
  <text x="20" y="120" font-size="18" class="fade-in delay-3">
    🚀 Full-Stack Engineer (MERN + Django)
  </text>
</svg>
  `.trim();
}

async function updateReadme() {
  const weather = await getWeather();
  const svg = makeSVG(weather);

  const readme = fs.readFileSync(README_PATH, "utf-8");

  const updatedReadme = readme.replace(/<!-- WEATHER_SVG -->/, svg);

  fs.writeFileSync(README_PATH, updatedReadme);

  console.log("README.md updated successfully.");
}

updateReadme();

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
require("dotenv").config();

const README_PATH = "./README.md";
const TEMPLATE_PATH = "./template.md";
const SVG_PATH = "./weather.svg";

const LAT = 44.9778;
const LON = -93.2650;
const LOCATION_NAME = "Minneapolis, MN";
const API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=imperial&appid=${API_KEY}`;

// Folder where your weather SVG icons are stored
const ICONS_DIR = path.join(__dirname, "assets", "weather-icons");

// OpenWeather condition to local icon filename map
const ICON_MAP = {
  "Clear": {
    day: "clear-day.svg",
    night: "clear-night.svg",
  },
  "Clouds": {
    day: "partly-cloudy-day.svg",
    night: "partly-cloudy-night.svg",
  },
  "Rain": "rain.svg",
  "Drizzle": "drizzle.svg",
  "Thunderstorm": "thunderstorms.svg",
  "Snow": "snow.svg",
  "Mist": "mist.svg",
  "Fog": "fog.svg",
  "Haze": "haze.svg",
  "Dust": "dust.svg",
  "Smoke": "smoke.svg",
  "Tornado": "tornado.svg",
  "Squall": "wind.svg",
};

// Select appropriate icon based on condition and time of day
function pickIcon(weather) {
  const condition = weather.weather[0].main;
  const iconCode = weather.weather[0].icon; // e.g., '01d', '01n'
  const isDay = iconCode.endsWith("d");

  let iconFile = ICON_MAP[condition];
  if (!iconFile) {
    iconFile = "not-available.svg";
  }

  if (typeof iconFile === "object") {
    iconFile = isDay ? iconFile.day : iconFile.night;
  }

  return iconFile;
}

// Read icon SVG content and strip outer <svg> wrapper
function readLocalSVG(filename) {
  const fullPath = path.join(ICONS_DIR, filename);
  try {
    const content = fs.readFileSync(fullPath, "utf8");

    // Remove outer <svg ...> and </svg>
    const stripped = content
      .replace(/<svg[^>]*>/i, "")
      .replace(/<\/svg>/i, "")
      .trim();

    return stripped;
  } catch (err) {
    console.error("Failed to read SVG file:", fullPath, err);
    return null;
  }
}

// Convert °F to °C
function fahrenheitToCelsius(f) {
  return Math.round((f - 32) * (5 / 9));
}

// Compose final inline weather SVG with icon + text
function generateSVG(weather, iconSVG) {
  const tempF = Math.round(weather.main.temp);
  const tempC = fahrenheitToCelsius(tempF);
  const condition = weather.weather[0].main;

  return `
<svg width="320" height="120" viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Current weather">
  <g id="weather-container" transform="translate(10,10)">
    <g transform="scale(0.8)">
      ${iconSVG}
    </g>
    <text x="120" y="45" font-family="Arial, sans-serif" font-weight="bold" font-size="40px" fill="#333">${tempF}°F / ${tempC}°C</text>
    <text x="120" y="75" font-family="Arial, sans-serif" font-size="20px" fill="#333">${condition}</text>
    <text x="120" y="105" font-family="Arial, sans-serif" font-size="18px" fill="#666">${LOCATION_NAME}</text>
  </g>
</svg>`;
}

// Inject updated SVG into README.md based on template.md
function updateReadme(svgContent) {
  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  const svgTag = `<p align="center">\n${svgContent.trim()}\n</p>`;

  const newReadme = template.replace(
    /<!-- WEATHER_SVG_START -->[\s\S]*?<!-- WEATHER_SVG_END -->/,
    `<!-- WEATHER_SVG_START -->\n${svgTag}\n<!-- WEATHER_SVG_END -->`
  );

  fs.writeFileSync(README_PATH, newReadme);
  fs.writeFileSync(SVG_PATH, svgContent);
  console.log("✅ README.md and weather.svg updated!");
}

// Fetch weather from OpenWeatherMap API
async function fetchWeather() {
  const res = await fetch(WEATHER_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch weather: ${res.statusText}`);
  }
  return await res.json();
}

// Main execution flow
async function main() {
  try {
    console.log("🌤️ Fetching weather data...");
    const weather = await fetchWeather();

    const iconFilename = pickIcon(weather);
    console.log("🎨 Using icon:", iconFilename);

    const iconSVG = readLocalSVG(iconFilename);
    if (!iconSVG) {
      throw new Error("Could not load icon SVG");
    }

    console.log("🛠️ Generating inline SVG...");
    const svg = generateSVG(weather, iconSVG);

    console.log("📄 Updating README and SVG...");
    updateReadme(svg);

    console.log("🚀 Done!");
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

main();

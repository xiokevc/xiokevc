const fs = require("fs").promises;
const path = require("path");
const fetch = require("node-fetch");

const README_PATH = "./README.md";
const ICONS_PATH = path.join(__dirname, "assets/weather-icons");
const LAT = 44.9778;
const LON = -93.2650;

// --- Weather Code → Icon ---
const iconMap = {
  0: "clear-day.svg",
  1: "partly-cloudy-day.svg",
  2: "partly-cloudy-day.svg",
  3: "cloudy.svg",
  45: "fog.svg",
  48: "fog.svg",
  51: "drizzle.svg",
  53: "drizzle.svg",
  55: "drizzle.svg",
  61: "rain.svg",
  63: "rain.svg",
  65: "rain.svg",
  71: "snow.svg",
  73: "snow.svg",
  75: "snow.svg",
  80: "rain.svg",
  81: "rain.svg",
  82: "rain.svg",
  95: "thunderstorms.svg",
  99: "hail.svg"
};

// --- UV Index → Icon ---
function uvIcon(uv) {
  if (uv === null || uv === undefined) return "not-available.svg";
  if (uv <= 1) return "uv-index-1.svg";
  if (uv <= 2) return "uv-index-2.svg";
  if (uv <= 3) return "uv-index-3.svg";
  if (uv <= 4) return "uv-index-4.svg";
  if (uv <= 5) return "uv-index-5.svg";
  if (uv <= 6) return "uv-index-6.svg";
  if (uv <= 7) return "uv-index-7.svg";
  if (uv <= 8) return "uv-index-8.svg";
  if (uv <= 9) return "uv-index-9.svg";
  if (uv <= 10) return "uv-index-10.svg";
  if (uv <= 11) return "uv-index-11.svg";
  return "uv-index-12.svg";
}

// --- Wind Speed → Beaufort Icon ---
function beaufortIcon(speedMph) {
  if (speedMph === null || speedMph === undefined) return "not-available.svg";

  // Beaufort thresholds in mph
  const thresholds = [
    { max: 1, file: "wind-beaufort-0.svg" },
    { max: 3, file: "wind-beaufort-1.svg" },
    { max: 7, file: "wind-beaufort-2.svg" },
    { max: 12, file: "wind-beaufort-3.svg" },
    { max: 18, file: "wind-beaufort-4.svg" },
    { max: 24, file: "wind-beaufort-5.svg" },
    { max: 31, file: "wind-beaufort-6.svg" },
    { max: 38, file: "wind-beaufort-7.svg" },
    { max: 46, file: "wind-beaufort-8.svg" },
    { max: 54, file: "wind-beaufort-9.svg" },
    { max: 63, file: "wind-beaufort-10.svg" },
    { max: 72, file: "wind-beaufort-11.svg" },
    { max: Infinity, file: "wind-beaufort-12.svg" }
  ];

  return thresholds.find(t => speedMph <= t.max).file;
}

async function getWeather() {
  try {
    console.log("Fetching weather data...");
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&temperature_unit=fahrenheit&daily=uv_index_max&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data || !data.current_weather) {
      console.warn("No current_weather data found");
      return { weatherText: "Weather unavailable", weatherCode: null, uv: null, wind: null };
    }

    const { temperature, weathercode, windspeed } = data.current_weather;
    const uv = data.daily?.uv_index_max?.[0] ?? null;

    const descriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      80: "Rain showers",
      81: "Mod. rain showers",
      82: "Violent showers",
      95: "Thunderstorm",
      99: "Hailstorm"
    };

    const text = descriptions[weathercode] || "Unknown weather";
    const weatherText = `${text} ${temperature.toFixed(1)}°F`;

    console.log(`Weather: ${weatherText} | Wind: ${windspeed.toFixed(1)} mph | UV: ${uv ?? "N/A"}`);
    return { weatherText, weatherCode: weathercode, uv, wind: windspeed };
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return { weatherText: "Weather unavailable", weatherCode: null, uv: null, wind: null };
  }
}

async function getIcon(file) {
  try {
    const filePath = path.join(ICONS_PATH, file);
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    console.warn("Icon missing, using fallback:", error.message);
    return `<svg><text x="0" y="15">N/A</text></svg>`;
  }
}

function makeSVG(weather, weatherIcon, uv, uvIconSVG, wind, windIcon) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="240" role="img" aria-label="Animated introduction with weather, UV, and wind information">
  <style>
    .fade-in {
      animation: fadeIn 1.5s ease forwards;
      opacity: 0;
      fill: #333;
    }
    .fade-in.delay-1 { animation-delay: 0s; }
    .fade-in.delay-2 { animation-delay: 1.5s; }
    .fade-in.delay-3 { animation-delay: 3s; }
    .fade-in.delay-4 { animation-delay: 4.5s; }
    .fade-in.delay-5 { animation-delay: 6s; }

    @keyframes fadeIn {
      to {
        opacity: 1;
        fill: #4A90E2;
      }
    }
    svg.icon {
      width: 32px;
      height: 32px;
    }
  </style>

  <text x="20" y="40" font-size="18" class="fade-in delay-1">
    👋 Hi, I'm Kevin
  </text>
  <g transform="translate(20, 80)" class="fade-in delay-2">
    <g class="icon">${weatherIcon}</g>
    <text x="50" y="20" font-size="18">Weather: ${weather}</text>
  </g>
  <g transform="translate(20, 120)" class="fade-in delay-3">
    <g class="icon">${uvIconSVG}</g>
    <text x="50" y="20" font-size="18">UV Index: ${uv ?? "N/A"}</text>
  </g>
  <g transform="translate(20, 160)" class="fade-in delay-4">
    <g class="icon">${windIcon}</g>
    <text x="50" y="20" font-size="18">Wind: ${wind?.toFixed(1) ?? "N/A"} mph</text>
  </g>
  <text x="20" y="210" font-size="18" class="fade-in delay-5">
    🚀 Full-Stack Engineer (MERN + Django)
  </text>
</svg>
  `.trim();
}

async function updateReadme() {
  const { weatherText, weatherCode, uv, wind } = await getWeather();

  const weatherIcon = await getIcon(iconMap[weatherCode] || "not-available.svg");
  const uvIconSVG = await getIcon(uvIcon(uv));
  const windIcon = await getIcon(beaufortIcon(wind));

  const svg = makeSVG(weatherText, weatherIcon, uv, uvIconSVG, wind, windIcon);

  let readme = await fs.readFile(README_PATH, "utf-8");

  if (!readme.includes("<!-- WEATHER_SVG_START -->")) {
    console.error("Placeholder not found in README.md");
    return;
  }

  const updatedReadme = readme.replace(
    /<!-- WEATHER_SVG_START -->([\s\S]*?)<!-- WEATHER_SVG_END -->/,
    `<!-- WEATHER_SVG_START -->\n${svg}\n<!-- WEATHER_SVG_END -->`
  );

  await fs.writeFile(README_PATH, updatedReadme);
  console.log("README.md updated successfully.");
}

updateReadme();

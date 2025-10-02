const fs = require("fs").promises;
const path = require("path");
const fetch = require("node-fetch");

const TEMPLATE_PATH = "./template.md";
const README_PATH = "./README.md";
const OUTPUT_SVG = "./weather.svg";
const ICONS_PATH = path.join(__dirname, "assets", "weather-icons");

const LAT = 44.9778;
const LON = -93.2650;

function resolveWeatherIcon(code, isDaytime) {
  const mapping = {
    0: isDaytime ? "clear-day.svg" : "clear-night.svg",
    1: isDaytime ? "partly-cloudy-day.svg" : "partly-cloudy-night.svg",
    2: isDaytime ? "partly-cloudy-day.svg" : "partly-cloudy-night.svg",
    3: "cloudy.svg",
    45: isDaytime ? "fog-day.svg" : "fog-night.svg",
    48: isDaytime ? "fog-day.svg" : "fog-night.svg",
    51: "drizzle.svg",
    53: "drizzle.svg",
    55: "drizzle.svg",
    61: "rain.svg",
    63: isDaytime ? "partly-cloudy-day-rain.svg" : "partly-cloudy-night-rain.svg",
    65: "rain.svg",
    71: "snow.svg",
    73: isDaytime ? "partly-cloudy-day-snow.svg" : "partly-cloudy-night-snow.svg",
    75: "snow.svg",
    80: "rain.svg",
    81: isDaytime ? "thunderstorms-day-rain.svg" : "thunderstorms-night-rain.svg",
    82: "thunderstorms-rain.svg",
    95: isDaytime ? "thunderstorms-day.svg" : "thunderstorms-night.svg",
    99: "hail.svg",
  };
  return mapping[code] || "not-available.svg";
}

function uvIcon(uv) {
  if (uv === null || uv === undefined) return "not-available.svg";
  const idx = Math.min(Math.floor(uv), 12);
  return `uv-index-${idx}.svg`;
}

function beaufortIcon(speedMph) {
  if (speedMph === null || speedMph === undefined) return "not-available.svg";
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
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&daily=uv_index_max,sunrise,sunset&timezone=auto&temperature_unit=fahrenheit`;
    const res = await fetch(url);
    const data = await res.json();

    const { temperature, weathercode, windspeed, time } = data.current_weather;
    const uv = data.daily?.uv_index_max?.[0] ?? null;

    const sunrise = new Date(data.daily.sunrise[0]);
    const sunset = new Date(data.daily.sunset[0]);
    const now = new Date(time);

    const isDaytime = now >= sunrise && now < sunset;

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

    const desc = descriptions[weathercode] || "Unknown weather";
    const weatherText = `${desc} ${temperature.toFixed(1)}°F`;

    return {
      weatherText,
      weatherCode: weathercode,
      uv,
      wind: windspeed,
      isDaytime
    };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return {
      weatherText: "Weather unavailable",
      weatherCode: null,
      uv: null,
      wind: null,
      isDaytime: true
    };
  }
}

async function getIcon(filename) {
  const filePath = path.join(ICONS_PATH, filename);
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    const fallback = path.join(ICONS_PATH, "not-available.svg");
    return await fs.readFile(fallback, "utf-8");
  }
}

function makeBubble(x, y, id, finalText, iconSVG, delay = "0s") {
  return `
<g transform="translate(${x}, ${y})">
  <rect class="bubble" x="0" y="0" width="460" height="40" />
  <g transform="translate(10,4)" class="icon">${iconSVG}</g>
  <text id="${id}-dots" x="50" y="26" class="bubble-text">
    <tspan>.</tspan><tspan>.</tspan><tspan>.</tspan>
    <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin="${delay}" />
  </text>
  <text id="${id}-text" x="50" y="26" class="bubble-text" opacity="0">
    ${finalText}
    <set attributeName="opacity" to="1" begin="${delay} + 2s" />
  </text>
  <set attributeName="visibility" to="hidden" begin="${delay} + 2s" xlink:href="#${id}-dots"/>
</g>
`;
}

function makeSVG(weather, weatherIconSVG, uv, uvIconSVG, wind, windIconSVG) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="280" role="img" aria-label="Weather info">
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .bubble { fill: #e0f7fa; stroke: #26c6da; rx: 12; ry: 12; }
    .bubble-text { font-size: 16px; fill: #004d40; }
    .icon svg { width: 24px; height: 24px; }
  </style>
  <text x="20" y="30" font-size="20">👋 Hi, I'm Kevin</text>
  ${makeBubble(20, 50, "weather", `Weather: ${weather}`, weatherIconSVG, "0s")}
  ${makeBubble(20, 110, "uv", `UV Index: ${uv ?? "N/A"}`, uvIconSVG, "0.5s")}
  ${makeBubble(20, 170, "wind", `Wind: ${wind?.toFixed(1) ?? "N/A"} mph`, windIconSVG, "1s")}
  <text x="20" y="250" font-size="18">🚀 Full‑Stack Engineer (MERN + Django)</text>
</svg>
`.trim();
}

async function updateReadme() {
  const { weatherText, weatherCode, uv, wind, isDaytime } = await getWeather();

  const weatherIconSVG = await getIcon(resolveWeatherIcon(weatherCode, isDaytime));
  const uvIconSVG = await getIcon(uvIcon(uv));
  const windIconSVG = await getIcon(beaufortIcon(wind));

  const svg = makeSVG(weatherText, weatherIconSVG, uv, uvIconSVG, wind, windIconSVG);
  await fs.writeFile(OUTPUT_SVG, svg, "utf-8");
  console.log("✅ Generated weather.svg");

  const template = await fs.readFile(TEMPLATE_PATH, "utf-8");
  const injected = template.replace(
    /<!-- WEATHER_SVG_START -->[\s\S]*?<!-- WEATHER_SVG_END -->/g,
    `<!-- WEATHER_SVG_START -->\n<p align="center">\n  <img src="./weather.svg" alt="Live Weather Info" />\n</p>\n<!-- WEATHER_SVG_END -->`
  );

  await fs.writeFile(README_PATH, injected, "utf-8");
  console.log("✅ README.md generated from template.md");
}

updateReadme();

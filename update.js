const fs = require("fs");
const fetch = require("node-fetch");
require("dotenv").config();

const README_PATH = "./README.md";
const TEMPLATE_PATH = "./template.md";
// Remove this if you don't need a separate SVG file anymore
const SVG_PATH = "./weather.svg";

const LAT = 44.9778; // Your latitude
const LON = -93.2650; // Your longitude
const API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=imperial&appid=${API_KEY}`;

async function fetchWeather() {
  const res = await fetch(WEATHER_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch weather: ${res.statusText}`);
  }
  const data = await res.json();
  return data;
}

function generateSVG(weather) {
  const temp = Math.round(weather.main.temp);
  const condition = weather.weather[0].main;
  const icon = weather.weather[0].icon;

  // Inline SVG with no external styles, so GitHub renders it properly
  return `<svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Current weather">
  <image href="https://openweathermap.org/img/wn/${icon}@2x.png" x="10" y="20" width="60" height="60" />
  <text x="80" y="55" font-family="Arial, sans-serif" font-weight="bold" font-size="48px" fill="#333">${temp}°F</text>
  <text x="80" y="80" font-family="Arial, sans-serif" font-size="20px" fill="#333">${condition}</text>
</svg>`;
}

function updateReadme(svgContent) {
  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  // Insert SVG directly inside the <p align="center"> block in template.md
  // so no extra <p> wrapper here
  const newReadme = template.replace(
    /<!-- WEATHER_SVG_START -->[\s\S]*?<!-- WEATHER_SVG_END -->/,
    `<!-- WEATHER_SVG_START -->\n<p align="center">\n${svgContent.trim()}\n</p>\n<!-- WEATHER_SVG_END -->`
  );

  fs.writeFileSync(README_PATH, newReadme);

  // Optional: save separate SVG file
  fs.writeFileSync(SVG_PATH, svgContent);

  console.log("README.md and weather.svg updated!");
}

async function main() {
  try {
    console.log("Fetching weather data...");
    const weather = await fetchWeather();

    console.log("Generating SVG...");
    const svg = generateSVG(weather);

    console.log("Updating README...");
    updateReadme(svg);

    console.log("Done!");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

main();

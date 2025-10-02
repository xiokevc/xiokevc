const fs = require("fs");
const fetch = require("node-fetch");

// Detroit coords for Open-Meteo
const LAT = 42.3314;
const LON = -83.0458;

async function getWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weathercode&temperature_unit=fahrenheit`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Weather API error: ${res.status} ${res.statusText}`);
      return "Weather unavailable";
    }
    const data = await res.json();

    // Improved validation for current weather data
    if (!data || !data.current || typeof data.current.temperature_2m !== "number" || typeof data.current.weathercode !== "number") {
      console.warn("Weather data incomplete or malformed.");
      return "N/A";
    }

    const temp = data.current.temperature_2m;
    const code = data.current.weathercode;

    // Weather descriptions with emojis
    const descriptions = {
      0: "☀️ Clear sky",
      1: "🌤️ Mainly clear",
      2: "⛅ Partly cloudy",
      3: "☁️ Overcast",
      45: "🌫️ Foggy",
      48: "🌫️ Rime fog",
      51: "🌦️ Light drizzle",
      53: "🌧️ Moderate drizzle",
      55: "🌧️ Dense drizzle",
      61: "🌦️ Slight rain",
      63: "🌧️ Moderate rain",
      65: "🌧️ Heavy rain",
      71: "🌨️ Slight snow",
      73: "❄️ Moderate snow",
      75: "❄️ Heavy snow",
      80: "🌧️ Rain showers",
      81: "🌧️ Mod. rain showers",
      82: "⛈️ Violent showers",
      95: "⛈️ Thunderstorm",
      99: "🌨️ Hailstorm",
    };

    const text = descriptions[code] || "Unknown";
    return `${text} ${temp}°F`;
  } catch (err) {
    console.error("Failed to fetch weather data:", err);
    return "Weather unavailable";
  }
}

function makeSVG(weather) {
  return `
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  width="500" height="180" 
  role="img" 
  aria-label="Personal introduction with current weather information"
  viewBox="0 0 500 180"
  >
  <title>Kevin's introduction and current weather</title>
  <text x="20" y="40" font-size="18" opacity="0" role="presentation">
    👋 Hi, I'm Kevin
    <animate attributeName="opacity" from="0" to="1" dur="1s" fill="freeze" begin="0s"/>
  </text>
  <text x="20" y="80" font-size="18" opacity="0" role="presentation">
    🌡️ Weather: ${weather}
    <animate attributeName="opacity" from="0" to="1" dur="1s" fill="freeze" begin="1s"/>
  </text>
  <text x="20" y="120" font-size="18" opacity="0" role="presentation">
    🚀 Full-Stack Engineer (MERN + Django)
    <animate attributeName="opacity" from="0" to="1" dur="1s" fill="freeze" begin="2s"/>
  </text>
</svg>
  `.trim();
}

async function main() {
  console.log("Fetching weather data...");
  const weather = await getWeather();
  console.log(`Weather data received: ${weather}`);

  const svg = makeSVG(weather);

  // Read from template.md
  let template;
  try {
    template = fs.readFileSync("template.md", "utf8");
  } catch (err) {
    console.error("Failed to read template.md:", err);
    process.exit(1);
  }

  // Replace placeholder with generated SVG
  const readme = template.replace("<!-- WEATHER_SVG -->", svg);

  fs.writeFileSync("README.md", readme.trim());
  console.log("README.md updated successfully.");
}

main();

const fs = require("fs");
const fetch = require("node-fetch");

// Detroit coordinates
const LAT = 42.3314;
const LON = -83.0458;

async function getWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();

    if (!data.current_weather) return "N/A";

    const tempC = data.current_weather.temperature;
    const tempF = (tempC * 9) / 5 + 32;
    const windKmh = data.current_weather.windspeed;
    const windMph = windKmh * 0.621371; // convert km/h → mph
    const code = data.current_weather.weathercode;

    // Map weather codes → readable text
    const codes = {
      0: "☀️ Clear sky",
      1: "🌤️ Mainly clear",
      2: "⛅ Partly cloudy",
      3: "☁️ Overcast",
      45: "🌫️ Fog",
      48: "🌫️ Rime fog",
      51: "🌦️ Light drizzle",
      53: "🌦️ Drizzle",
      55: "🌦️ Heavy drizzle",
      61: "🌧️ Rain",
      63: "🌧️ Moderate rain",
      65: "🌧️ Heavy rain",
      71: "❄️ Snowfall",
      73: "❄️ Moderate snow",
      75: "❄️ Heavy snow",
      80: "🌦️ Rain showers",
      81: "🌦️ Showers",
      82: "🌧️ Heavy showers",
      95: "⛈️ Thunderstorm",
      96: "⛈️ Thunderstorm + hail",
      99: "⛈️ Severe thunderstorm"
    };

    const desc = codes[code] || "🌍 Weather unknown";
    return `${desc} · ${tempC.toFixed(1)}°C / ${tempF.toFixed(1)}°F · 💨 ${windKmh.toFixed(
      1
    )} km/h / ${windMph.toFixed(1)} mph`;
  } catch (err) {
    console.error("Weather fetch failed:", err);
    return "Weather unavailable";
  }
}

function makeSVG(weather) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 180" width="100%">
  <style>
    .blob { font: 18px sans-serif; opacity: 0; }
    .b1 { animation: fadein 1s ease 0s forwards; }
    .b2 { animation: fadein 1s ease 1s forwards; }
    .b3 { animation: fadein 1s ease 2s forwards; }
    @keyframes fadein { to { opacity: 1; } }
  </style>
  <text x="20" y="40" class="blob b1" fill="black">👋 Hi, I'm Kevin</text>
  <text x="20" y="80" class="blob b2" fill="black">🌤️ Weather: ${weather}</text>
  <text x="20" y="120" class="blob b3" fill="black">🚀 Full-Stack Engineer (MERN + Django)</text>
</svg>
`;
}

async function main() {
  const weather = await getWeather();
  const svg = makeSVG(weather);

  const readme = `
<h1 align="center">Hi there, I'm Kevin 👋</h1>

<p align="center">
  🚀 Architectural Designer turned Software Engineer <br>
  🎨 Crafting full-stack apps with an eye for design and performance <br>
  🌍 Based in the US
</p>

<p align="center">
${svg}
</p>

---

## 💻 Tech Stack & Skills

### 🧠 Core Languages & Web Tech
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-4479A1?style=flat&logo=sqlite&logoColor=white)
![JSX](https://img.shields.io/badge/JSX-61DAFB?style=flat&logo=react&logoColor=white)

---

### ⚛️ Frontend
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=react-router&logoColor=white)
![DOM](https://img.shields.io/badge/DOM-Manipulation-blue?style=flat)  
- Component-based UI design  
- State management & routing  

---

### 🖥️ Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=flat&logo=django&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white)  
- RESTful APIs & MVC architecture  
- Middleware, routing, and templating

---

### 🔐 Auth & Security
![Auth](https://img.shields.io/badge/Auth-User_Login-green?style=flat)
![Hashing](https://img.shields.io/badge/Hashing-SHA256-important?style=flat)  
- JWT & session-based authentication  
- Protected routes & secure hashing  

---

### 🗃️ Databases
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat&logo=mongoose&logoColor=white)  
- Schema design & data modeling  
- Relational & NoSQL queries  

---

### 🧪 APIs & Tools
![REST](https://img.shields.io/badge/REST-API-blue?style=flat)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat&logo=postman&logoColor=white)  
- API testing & route debugging  
- External service integration  

---

### 🛠️ Dev Tools
![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)
![CLI](https://img.shields.io/badge/CLI-Terminal-333?style=flat&logo=gnubash&logoColor=white)
![VSCode](https://img.shields.io/badge/VSCode-007ACC?style=flat&logo=visual-studio-code&logoColor=white)

---

## 📈 GitHub Analytics
<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=xiokevc&show_icons=true&theme=radical" alt="GitHub Stats" />
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=xiokevc&layout=compact&theme=radical" alt="Top Languages" />
</p>

---

## 🧠 About Me
- 🏗️ Former Architectural Designer with 8+ years of experience in design & technical documentation  
- 🔁 Transitioned into software development to merge **creative thinking** with **problem-solving**  
- 🌱 Currently exploring backend architecture & cloud deployment  
- 🤝 Skilled at collaborating with cross-functional teams — from engineers to designers  
- 🧩 Passionate about building elegant, user-centered web applications  

---

## 🛠️ Featured Projects

### 🚘 [Redline Tracker](https://github.com/xiokevc/redline-tracker) | [🌐 Live App](https://redline-tracker-8dde54ed8f81.herokuapp.com/)  
**Python · Django · PostgreSQL · Bootstrap**  
A full-stack vehicle maintenance tracker that helps users log service history and repairs—replacing paper records with a modern, intuitive interface.

---

### 📦 [FeatherBOXD – Frontend](https://github.com/xiokevc/featherboxd-front-end) | [Backend](https://github.com/xiokevc/featherboxd-backend) | [🌐 Live App](https://featherboxd.netlify.app/)  
**React · Node.js · Express · MongoDB · JWT**  
Birdwatching app that lets users log, identify, and share bird sightings using GPS and secure JWT authentication. Features AI-powered bird ID and interactive maps to explore migration trends.

---

### 🍴 [Fork It](https://github.com/xiokevc/recipe-book-app) | [🌐 Live App](https://restaurant-rating-de6c8b0d53f5.herokuapp.com/)  
**Node.js · Express · MongoDB · EJS**  
A restaurant review platform featuring full CRUD, session-based authentication, and a responsive design for mobile-first browsing.

---

## 🎓 Education
🎓 **General Assembly** – Software Engineering Immersive  
*June 2025 – September 2025*  
- 500+ hours of hands-on full-stack training  
- Focused on JavaScript, Python, React, Django, REST APIs, Agile workflows  

🎓 **Dunwoody College of Technology** – AAS in Architectural Drafting & Design  
*Jan 2014 – Aug 2016*

---

## 📜 Certifications
[![General Assembly Badge](https://api.badgr.io/public/assertions/yTlUQrR3Qj-hHa9zwVZkTw/image)](https://api.badgr.io/public/assertions/yTlUQrR3Qj-hHa9zwVZkTw)  
**Software Engineering Immersive Certificate**  
*Issued by General Assembly on September 26, 2025*  
[![Verify Badge](https://img.shields.io/badge/Verify_on_Badgr-blue?style=flat-square&logo=OpenBadges)](https://generalassembly.badgr.com/public/assertions/yTlUQrR3Qj-hHa9zwVZkTw)

---

## 📫 Connect With Me
[![Email](https://img.shields.io/badge/email-%23D14836.svg?style=for-the-badge&logo=gmail&logoColor=white)](mailto:xiokevc@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/xiokevc)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/kevin-xiong-816826282/)

---

## ⚡ Fun Fact
> 🧠 I used to turn buildings into blueprints — now I turn ideas into full-stack applications.  

---

<sub>⚡ Auto-updated daily with live weather (via Open-Meteo) & SVG animation</sub>
`;

  fs.writeFileSync("README.md", readme.trim());
}

main();

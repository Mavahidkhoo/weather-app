"use strict"; // Enforce strict mode to avoid common JavaScript pitfalls

// ====== API Key & Units ======
const apiKey = "f3400204c3c3a1e08ac423cb3a2d3801"; // OpenWeatherMap API key
let isCelsius = true; // Flag to track current temperature unit (Celsius or Fahrenheit)

// ====== DOM Elements ======
const searchInput = document.getElementById("searchInput"); // Input field for entering city
const searchBtn = document.getElementById("searchBtn"); // Button to trigger search
const unitToggle = document.getElementById("unitToggle"); // Toggle button for °C / °F

// Current weather details
const cityNameEl = document.getElementById("cityName"); // City + country name
const dateEl = document.getElementById("date"); // Current date
const currentTempEl = document.getElementById("currentTemp"); // Current temperature
const currentConditionEl = document.getElementById("currentCondition"); // Weather condition + icon

// Extra weather details
const feelsLikeEl = document.getElementById("feelsLike"); // Feels like temperature
const humidityEl = document.getElementById("humidity"); // Humidity percentage
const windEl = document.getElementById("wind"); // Wind speed
const precipitationEl = document.getElementById("precipitation"); // Rain probability (POP)

// Forecast containers
const hourlyContainer = document.getElementById("hourlyForecast"); // Hourly forecast section
const dailyContainer = document.getElementById("dailyForecast"); // Daily forecast section

// Message element (for errors or notifications)
let messageEl = document.getElementById("msg");

// ====== Messages ======
function showMessage(text) {
  // Show error or info message
  if (messageEl) {
    messageEl.textContent = text;
    messageEl.classList.remove("hidden");
  } else console.warn(text);
}
function clearMessage() {
  // Clear the message area
  if (messageEl) {
    messageEl.textContent = "";
    messageEl.classList.add("hidden");
  }
}

// ====== Unit Toggle ======
unitToggle.addEventListener("click", () => {
  // Switch between Celsius and Fahrenheit
  isCelsius = !isCelsius;
  unitToggle.innerText = isCelsius ? "°C / °F" : "°F / °C";

  // Refresh current city weather with new unit
  const currentCity = cityNameEl.textContent.split(",")[0];
  if (currentCity && currentCity !== "City") fetchWeather(currentCity);
});

// ====== Seasons Images ======
// Background images for different seasons
const seasonImages = {
  spring: "assets/images/seasons/spring.jfif",
  summer: "assets/images/seasons/summer.jfif",
  autumn: "assets/images/seasons/autumn.jfif",
  winter: "assets/images/seasons/winter.jfif",
};

// ====== Weather Images ======
// Background images for weather types
const weatherImages = {
  thunderstorm: "assets/images/weathers/thunderstorm.jfif",
  drizzle: "assets/images/weathers/drizzle.jfif",
  rain: "assets/images/weathers/rain.jfif",
  snow: "assets/images/weathers/snow.jfif",
  fog: "assets/images/weathers/fog.jfif",
  clear: "assets/images/weathers/clear.jfif",
  cloudy: "assets/images/weathers/cloudy.jfif",
  na: "assets/images/weathers/default.jfif",
};

// ====== Get Season ======
// Determine season based on month and hemisphere
function getSeason(date, countryCode) {
  const month = date.getMonth() + 1;
  const south = ["AU", "BR", "ZA", "NZ", "AR", "CL"].includes(countryCode); // Southern Hemisphere countries
  if (south) {
    if (month >= 3 && month <= 5) return "autumn";
    if (month >= 6 && month <= 8) return "winter";
    if (month >= 9 && month <= 11) return "spring";
    return "summer";
  } else {
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "autumn";
    return "winter";
  }
}

// ====== Weather Type ======
// Map weather condition ID to weather type
function getWeatherType(id) {
  if (id >= 200 && id < 300) return "thunderstorm";
  if (id >= 300 && id < 500) return "drizzle";
  if (id >= 500 && id < 600) return "rain";
  if (id >= 600 && id < 700) return "snow";
  if (id >= 700 && id < 800) return "fog";
  if (id === 800) return "clear";
  if (id > 800 && id < 900) return "cloudy";
  return "na";
}

// ====== Weather Icon ======
// Map weather condition ID to icon class (Weather Icons library)
function getWeatherIcon(id) {
  if (id >= 200 && id < 300) return "wi-thunderstorm";
  if (id >= 300 && id < 500) return "wi-sprinkle";
  if (id >= 500 && id < 600) return "wi-rain";
  if (id >= 600 && id < 700) return "wi-snow";
  if (id >= 700 && id < 800) return "wi-fog";
  if (id === 800) return "wi-day-sunny";
  if (id > 800 && id < 900) return "wi-cloudy";
  return "wi-na";
}

// ====== Fetch Weather ======
async function fetchWeather(city) {
  try {
    // Reset UI placeholders before loading
    cityNameEl.textContent = "Loading…";
    currentTempEl.textContent = "--°";
    currentConditionEl.innerHTML = `<i class="wi wi-na text-4xl mr-2"></i> --`;
    hourlyContainer.innerHTML = `<p class="opacity-70 text-center">Loading hourly…</p>`;
    dailyContainer.innerHTML = `<p class="opacity-70 text-center">Loading daily…</p>`;
    clearMessage();

    // API request with selected units
    const units = isCelsius ? "metric" : "imperial";
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}`;
    const res = await fetch(url);
    const data = await res.json();

    // Handle errors (invalid city, API error, etc.)
    if (parseInt(data.cod, 10) !== 200) {
      showMessage(data.message || "City not found");
      return;
    }

    // ====== Current Weather ======
    const current = data.list[0];
    cityNameEl.textContent = `${data.city.name}, ${data.city.country}`;
    dateEl.textContent = new Date().toDateString();
    currentTempEl.textContent = `${Math.round(current.main.temp)}°`;
    currentConditionEl.innerHTML = `<i class="wi ${getWeatherIcon(current.weather[0].id)} text-4xl mr-2"></i> ${current.weather[0].description}`;

    // Extra details
    feelsLikeEl.textContent = `${Math.round(current.main.feels_like)}°`;
    humidityEl.textContent = `${current.main.humidity}%`;
    windEl.textContent = isCelsius ? `${Math.round(current.wind.speed * 3.6)} km/h` : `${current.wind.speed} mph`;
    precipitationEl.textContent = current.pop ? Math.round(current.pop * 100) + "%" : "0%";

    // ====== Apply Season Background ======
    const season = getSeason(new Date(), data.city.country);
    document.body.style.background = `url(${seasonImages[season]})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundBlendMode = "overlay";

    // ====== Apply Weather Card Background ======
    const type = getWeatherType(current.weather[0].id);
    const mainCard = document.getElementById("mainCard");
    mainCard.style.background = `url(${weatherImages[type]})`;
    mainCard.style.backgroundSize = "cover";
    mainCard.style.backgroundPosition = "center";
    mainCard.style.backgroundBlendMode = "overlay";

    // Fallback if images fail to load
    mainCard.onerror = () => {
      mainCard.style.background = "#1e1e2f";
    };
    document.body.onerror = () => {
      document.body.style.background = "#4a7a8c";
    };

    // ====== Hourly Forecast ======
    hourlyContainer.innerHTML = "";
    data.list.slice(0, 6).forEach((h) => {
      const hour = new Date(h.dt * 1000).getHours();
      hourlyContainer.innerHTML += `<div class="flex justify-between items-center"><p class="opacity-80">${hour}:00</p><p><i class="wi ${getWeatherIcon(h.weather[0].id)} mr-2"></i>${Math.round(h.main.temp)}°</p></div>`;
    });

    // ====== Daily Forecast ======
    const daysMap = {};
    data.list.forEach((entry) => {
      const d = new Date(entry.dt * 1000);
      const key = d.toISOString().split("T")[0];
      if (!daysMap[key]) daysMap[key] = { min: entry.main.temp, max: entry.main.temp, icon: entry.weather[0].id };
      else {
        if (entry.main.temp < daysMap[key].min) daysMap[key].min = entry.main.temp;
        if (entry.main.temp > daysMap[key].max) daysMap[key].max = entry.main.temp;
      }
    });

    const daysArray = Object.keys(daysMap)
      .slice(0, 7)
      .map((key) => {
        const dObj = new Date(key);
        const weekday = dObj.toLocaleDateString("en-US", { weekday: "short" });
        return { day: weekday, min: Math.round(daysMap[key].min), max: Math.round(daysMap[key].max), icon: getWeatherIcon(daysMap[key].icon) };
      });

    dailyContainer.innerHTML = "";
    daysArray.forEach((d) => {
      dailyContainer.innerHTML += `<div class="bg-[#1e1e2f] rounded-xl p-4 text-center hover:bg-[#2c2c40] transition"><p>${d.day}</p><i class="wi ${d.icon} text-3xl my-2"></i><p class="text-xl font-bold">${d.max}°</p><p class="opacity-70">${d.min}°</p></div>`;
    });
  } catch (err) {
    console.error(err);
    showMessage("Network or bad response");
  }
}

// ====== Search & Suggestions ======
// List of all countries for autocomplete suggestions
const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

let suggestionsBox = document.createElement("div"); // Suggestions dropdown container
suggestionsBox.className = "absolute bg-white text-black w-full rounded-lg max-h-60 overflow-auto z-50 hidden mt-14";
searchInput.parentNode.appendChild(suggestionsBox);

let selectedIndex = -1; // Track which suggestion is selected

// Update suggestions based on user input
function updateSuggestions() {
  const val = searchInput.value.trim().toLowerCase();
  suggestionsBox.innerHTML = "";
  selectedIndex = -1;
  if (!val) return suggestionsBox.classList.add("hidden");

  const matches = countries.filter((c) => c.toLowerCase().includes(val)).slice(0, 10);
  if (matches.length) {
    suggestionsBox.innerHTML = matches.map((c) => `<p class="p-2 hover:bg-gray-200 cursor-pointer">${c}</p>`).join("");
    suggestionsBox.classList.remove("hidden");
  } else suggestionsBox.classList.add("hidden");
}

searchInput.addEventListener("input", updateSuggestions);

// Handle keyboard navigation in suggestions
searchInput.addEventListener("keydown", (e) => {
  const items = Array.from(suggestionsBox.children);
  if (!items.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex = (selectedIndex + 1) % items.length;
    updateHighlight(items);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex = (selectedIndex - 1 + items.length) % items.length;
    updateHighlight(items);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (selectedIndex >= 0) searchInput.value = items[selectedIndex].textContent;
    suggestionsBox.classList.add("hidden");
    fetchWeather(searchInput.value.trim());
  }
});

// Highlight the selected suggestion
function updateHighlight(items) {
  items.forEach((item, i) => (i === selectedIndex ? item.classList.add("bg-gray-300") : item.classList.remove("bg-gray-300")));
}

// Hide suggestions when clicking outside
document.addEventListener("click", (e) => {
  if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) suggestionsBox.classList.add("hidden");
});

// Click on suggestion → fill input + fetch weather
suggestionsBox.addEventListener("click", (e) => {
  if (e.target.tagName === "P") {
    searchInput.value = e.target.textContent;
    suggestionsBox.classList.add("hidden");
    fetchWeather(searchInput.value.trim());
  }
});

// ====== Init ======
// Default city when page loads
fetchWeather("iran");

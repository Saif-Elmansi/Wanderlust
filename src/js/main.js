const countryOptionsContainer = document.getElementById(
  "country-options-container",
);
const searchInput = document.getElementById("country-search-input");
const trigger = document.querySelector(".custom-select-trigger");
const dropdown = document.querySelector(".custom-select-dropdown");

let selectedCountryCode = "";
let countryCapital = "";
let lat = "";
let lng = "";

const updateDateTime = () => {
  const now = new Date();
  const newDate = now.toLocaleDateString("en-GB");
  const newTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const element = document.querySelector("#current-datetime");
  if (element) {
    element.textContent = `${newDate} | ${newTime}`;
  }
};

updateDateTime();

setInterval(updateDateTime, 60000);

async function getCountrySelector() {
  try {
    let data = await fetch("https://date.nager.at/api/v3/AvailableCountries");
    let countries = await data.json();
    console.log(countries);

    renderOptions(countries);

    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = countries.filter((c) =>
        c.name.toLowerCase().includes(term),
      );
      renderOptions(filtered);
    });
  } catch (error) {
    console.error("Error loading countries:", error);
  }
}

function renderOptions(data) {
  countryOptionsContainer.innerHTML = "";
  data.forEach((country) => {
    const div = document.createElement("div");
    div.className = "custom-option";
    div.innerHTML = `
            <div class="option-info">
                <img src="https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png" class="flag-img">
                <span>${country.name}</span>
            </div>
            <span class="country-code-text">${country.countryCode}</span>
        `;

    div.addEventListener("click", async () => {
      selectedCountryCode = country.countryCode.toLowerCase();

      document.getElementById("current-country-name").textContent =
        country.name;
      document.getElementById("current-flag").src =
        `https://flagcdn.com/w40/${selectedCountryCode}.png`;

      try {
        let response = await fetch(
          `https://restcountries.com/v3.1/alpha/${selectedCountryCode}`,
        );
        let countryData = await response.json();

        countryCapital = countryData[0].capital;
        lat = countryData[0].latlng[0];
        lng = countryData[0].latlng[1];

        const capital = countryData[0].capital
          ? countryData[0].capital[0]
          : "N/A";

        const citySelectedText = document.getElementById("current-city");
        const cityContainer = document.getElementById("city-options-container");

        citySelectedText.textContent = capital;
        cityContainer.innerHTML = `<div class="simple-select-option selected" data-value="${capital}">${capital}</div>`;

        document.getElementById("selected-country-name").textContent =
          country.name;
        document.getElementById("selected-country-flag").src =
          `https://flagcdn.com/w40/${selectedCountryCode}.png`;
        document.getElementById("selected-city-name").textContent =
          `• ${capital}`;
        await renderCityOptions();
      } catch (error) {
        console.error("Error fetching capital:", error);
      }

      dropdown.classList.remove("open");
    });

    countryOptionsContainer.appendChild(div);
  });
}

async function fetchCountryCode() {
  if (!selectedCountryCode) {
    Swal.fire("برجاء اختيار دولة أولاً");
    return;
  }

  let data = await fetch(
    `https://restcountries.com/v3.1/alpha/${selectedCountryCode}`,
  );
  let res = await data?.json();
  updateDataUI(res[0]);
}

let btnExplore = document.getElementById("global-search-btn");
btnExplore.addEventListener("click", async function () {
  const country = document.getElementById("current-country-name").textContent;
  const city = document.getElementById("current-city").textContent.trim();
  const year = document.getElementById("current-year-select")?.value || "2026";
  if (!selectedCountryCode || city === "Select City") {
    Swal.fire("Please select a country and city first!");
    return;
  }

  document.getElementById("selected-city-name").textContent = `• ${city}`;
  const placeholder = document.getElementById("country-info-placeholder");
  const dataContainer = document.getElementById("dashboard-country-data");
  const selectedBadge = document.getElementById("selected-destination");

  if (placeholder) placeholder.classList.add("hidden");
  if (dataContainer) dataContainer.classList.remove("hidden");
  if (selectedBadge) selectedBadge.classList.remove("hidden");

  const Toast = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 3000,
    background: "#059669",
    color: "#ffffff",
    showCloseButton: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: "success",
    iconColor: "#ffffff",
    title: `Exploring ${country}, ${city}!`,
  });

  fetchCountryCode();
  getHoliday();
  getEvents();
  getWeatherData(lat, lng);
  getSunData(lat, lng);
  getLongWeekend(year, selectedCountryCode);
});
function parseUTCOffset(utcString) {
  const match = utcString.match(/UTC([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;

  const sign = match[1] === "+" ? 1 : -1;
  const hours = parseInt(match[2]);
  const minutes = parseInt(match[3]);

  return sign * (hours * 60 + minutes);
}

function getTimeFromUTCOffset(utcOffsetString) {
  const offsetMinutes = parseUTCOffset(utcOffsetString);

  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

  return new Date(utcTime + offsetMinutes * 60000);
}

let clockInterval = null;
function updateDataUI(res) {
  document.getElementById("country-info-placeholder").classList.add("hidden");
  document.getElementById("dashboard-country-data").classList.remove("hidden");

  let imgInfo = document.querySelector(".dashboard-country-flag");
  imgInfo.src = res.flags.png;
  let nameInfo = document.getElementById("dashboard-country-name");
  nameInfo.textContent = res.name.common;

  document.getElementById("selected-city-name").textContent =
    `• ${res.capital[0]}`;

  let region = document.querySelector(".region");
  region.textContent = res.region;

  if (clockInterval) {
    clearInterval(clockInterval);
  }

  clockInterval = setInterval(() => {
    const localTime = getTimeFromUTCOffset(res.timezones[0]);
    document.getElementById("country-local-time").textContent =
      localTime.toLocaleTimeString();
  }, 1000);
  document.querySelector(".local-time-zone").textContent = res.timezones[0];

  document.getElementById("capital-detail").textContent = res.capital[0];

  document.getElementById("population-detail").textContent =
    res.population.toLocaleString();
  document.getElementById("area-detail").textContent =
    res.area.toLocaleString() + " km²";
  document.getElementById("continent-detail").textContent = res.continents[0];
  document.getElementById("callingCode").textContent =
    res.idd.root + (res.idd.suffixes ? res.idd.suffixes[0] : "");

  document.getElementById("driving-detail").textContent =
    res.car.side.charAt(0).toUpperCase() + res.car.side.slice(1);
  document.getElementById("week-detail").textContent =
    res.startOfWeek.charAt(0).toUpperCase() + res.startOfWeek.slice(1);

  document.getElementById("lang-detail").textContent = Object.values(
    res.languages,
  ).join(", ");

  let currencyKeys = Object.keys(res.currencies);
  let currencyInfo = res.currencies[currencyKeys[0]];
  document.getElementById("currency-det").textContent =
    `${currencyInfo.name} (${currencyKeys[0]} ${currencyInfo.symbol})`;

  let neighborsDetail = document.getElementById("neighbors-detail");
  neighborsDetail.innerHTML = "";
  if (res?.borders) {
    res.borders.forEach((border) => {
      let span = document.createElement("span");
      span.className = "extra-tag border-tag";
      span.textContent = border;
      neighborsDetail.appendChild(span);
    });
  }

  document.querySelector(".official-name").textContent = res.name.official;
  document.querySelector(".btn-map-link").href = res.maps.googleMaps;
}

async function renderCityOptions() {
  let response = await fetch(
    `https://restcountries.com/v3.1/alpha/${selectedCountryCode}`,
  );
  let countryData = await response.json();
  const capitalCity = countryData[0].capital;

  const cityContainer = document.getElementById("city-options-container");
  cityContainer.innerHTML = "";

  capitalCity.forEach((city) => {
    const div = document.createElement("div");
    div.className = "simple-select-option";
    div.textContent = city;

    div.addEventListener("click", () => {
      const citySpan = document.getElementById("current-city");
      citySpan.textContent = city;

      document
        .getElementById("city-options-container")
        .classList.remove("open");
    });

    cityContainer.appendChild(div);
  });
}

trigger.addEventListener("click", () => dropdown.classList.toggle("open"));
getCountrySelector();

function initializeDashboard() {
  document.getElementById("selected-destination").classList.add("hidden");
  document.getElementById("dashboard-country-data").classList.add("hidden");
  document
    .getElementById("country-info-placeholder")
    .classList.remove("hidden");
}
initializeDashboard();
// ======================== NAVIGATION LOGIC =========================
const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");

navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    const targetViewId = item.getAttribute("data-view");

    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");

    views.forEach((view) => {
      view.classList.remove("active");

      if (view.id === `${targetViewId}-view`) {
        view.classList.add("active");
        // جوه switchView(viewId)
        if (targetViewId === "my-plans") {
          renderMyPlans();
        }
      }
    });

    const titleText = item.querySelector("span").textContent;
    document.getElementById("page-title").textContent = titleText;
  });
});

// ======================== END NAVIGATION LOGIC =========================

// ======================== HOLIDAYS FETCHING LOGIC =========================

async function getHoliday() {
  const yearSelect = document.getElementById("current-year-select");
  const selectedYear = yearSelect ? yearSelect.value : "2026";

  if (!selectedCountryCode || !selectedYear) {
    return;
  }

  try {
    let data = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${selectedYear}/${selectedCountryCode}`,
    );

    if (data.ok) {
      let res = await data.json();
      renderHolidays(res);
    }
  } catch (error) {
    console.error("Error loading holidays:", error);
  }
}

let holContent = document.getElementById("holidays-content");
function renderHolidays(holidays) {
  let holHidden = document.getElementById("holidays-placeholder");
  if (holidays.length === 0) {
    holHidden.classList.remove("hidden");
  } else {
    holHidden.classList.add("hidden");
    let container = "";
    holidays.forEach((holiday) => {
      let time = holiday.date;
      let [year, month, day] = time.split("-");

      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const getMonthName = (month) => months[Number(month) - 1];
      function getDayName(time) {
        const date = new Date(time);

        return date.toLocaleString("en-US", { weekday: "long" });
      }

      const cleanName = holiday.name.replace(/'/g, "\\'");

      container += `
                  <div class="holiday-card">
                <div class="holiday-card-header">
                  <div class="holiday-date-box">
                    <span class="day">${day}</span><span class="month">${getMonthName(month)}</span>
                  </div>
                  <button
                    class="holiday-action-btn"
                    aria-label="Open navigation menu"
                    onclick="savePlan('holiday', '${cleanName}', '${holiday.date}')"
                  >
                    <i class="fa-regular fa-heart"></i>
                  </button>
                </div>
                <h3>${holiday.localName}</h3>
                <p class="holiday-name">${holiday.name}</p>
                <div class="holiday-card-footer">
                  <span class="holiday-day-badge"
                    ><i class="fa-regular fa-calendar"></i> ${getDayName(time)}</span
                  >
                  <span class="holiday-type-badge">${holiday.types[0]}</span>
                </div>
              </div>
    `;
    });
    holContent.innerHTML = container;
  }
}

// ======================= END HOLIDAYS FETCHING LOGIC =========================

// ======================== EVENTS FETCHING LOGIC =========================
let myKey = "elPLSLMTn4KXCiPnCpjoxz0Mkpy5YqEW";

async function getEvents() {
  let data = await fetch(
    `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${myKey}&city=${countryCapital[0]}&countryCode=${selectedCountryCode}&size=20`,
  );
  let res = await data?.json();

  console.log(res);

  renderEvents(res);
}
let eventsContent = document.getElementById("events-content");
function renderEvents(events) {
  let eventsHidden = document.getElementById("events-placeholder");
  if (!events._embedded || events._embedded.events.length === 0) {
    eventsHidden.classList.remove("hidden");
  } else {
    eventsHidden.classList.add("hidden");
    let container = "";
    events._embedded.events.forEach((event) => {
      container += `
        <div class="event-card">
          <div class="event-card-image">
            <img
              src="${event.images?.[0]?.url || ""}"
              alt="${event.name || "Event"}"
            />
            <span class="event-card-category">${event.classifications?.[0]?.segment?.name || "Event"}</span>
            <button
              class="event-card-save"
              aria-label="Save event"
              onclick="savePlan('event', '${event.name}', '${event.dates.start.localDate}')"
            >
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>
          <div class="event-card-body">
            <h3>${event.name || "No Title"}</h3>
            <div class="event-card-info">
              <div>
                <i class="fa-regular fa-calendar"></i>
                ${event.dates?.start?.localDate || "TBD"} at ${event.dates?.start?.localTime?.substring(0, 5) || "00:00"}
              </div>
              <div>
                <i class="fa-solid fa-location-dot"></i>
                ${event._embedded?.venues?.[0]?.name || "Venue TBD"}, ${event._embedded?.venues?.[0]?.city?.name || ""}
              </div>
            </div>
            <div class="event-card-footer">
              <button class="btn-event">
                <i class="fa-regular fa-heart"></i> Save
              </button>
              <a href="${event.url || "#"}" target="_blank" class="btn-buy-ticket">
                <i class="fa-solid fa-ticket"></i> Buy Tickets
              </a>
            </div>
          </div>
        </div>
      `;
    });

    eventsContent.innerHTML = container;
  }
}

// ====================== END EVENTS FETCHING LOGIC =========================
// ======================== WEATHER FETCHING LOGIC =========================
async function getWeatherData(lat, lng) {
  if (!lat || !lng) {
    return;
  }
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&timezone=auto`,
  );
  const data = await response.json();

  console.log(data);

  renderWeatherUI(data);
}

function getWeatherDetails(code) {
  const weatherMap = {
    0: { desc: "Clear Sky", icon: "fa-sun", class: "weather-sunny" },
    1: { desc: "Mainly Clear", icon: "fa-cloud-sun", class: "weather-sunny" },
    2: { desc: "Partly Cloudy", icon: "fa-cloud-sun", class: "weather-cloudy" },
    3: { desc: "Overcast", icon: "fa-cloud", class: "weather-cloudy" },
    45: { desc: "Foggy", icon: "fa-smog", class: "weather-foggy" },
    61: { desc: "Slight Rain", icon: "fa-cloud-rain", class: "weather-rainy" },
    63: {
      desc: "Moderate Rain",
      icon: "fa-cloud-showers-heavy",
      class: "weather-rainy",
    },
    71: { desc: "Snow Fall", icon: "fa-snowflake", class: "weather-snowy" },
    80: {
      desc: "Rain Showers",
      icon: "fa-cloud-showers-water",
      class: "weather-rainy",
    },
    95: {
      desc: "Thunderstorm",
      icon: "fa-cloud-bolt",
      class: "weather-stormy",
    },
  };

  return (
    weatherMap[code] || {
      desc: "Cloudy",
      icon: "fa-cloud",
      class: "weather-default",
    }
  );
}
function renderWeatherUI(data) {
  let weatherPlaceholder = document.getElementById("weather-placeholder");
  let weatherContent = document.getElementById("weather-content");

  if (!data) {
    weatherContent.classList.add("hidden");
    weatherPlaceholder.classList.remove("hidden");
  } else {
    weatherPlaceholder.classList.add("hidden");
    weatherContent.classList.remove("hidden");

    const weatherInfo = getWeatherDetails(data.current.weather_code);
    const heroCard = document.querySelector(".weather-hero-card");
    heroCard.className = `weather-hero-card ${weatherInfo.class}`;

    document.querySelector(".weather-condition").textContent = weatherInfo.desc;
    document.querySelector(".weather-hero-icon i").className =
      `fa-solid ${weatherInfo.icon}`;

    console.log(countryCapital[0]);

    let weatherHeroCard = document.getElementById("weather-hero-card");
    weatherHeroCard.innerHTML = `
                    <div class="weather-location">
                  <i class="fa-solid fa-location-dot"></i>
                  <span>${countryCapital[0]}</span>
                  <span class="weather-time"> ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <div class="weather-hero-main">
                  <div class="weather-hero-left">
                    <div class="weather-hero-icon">
                      <i class="fa-solid fa-sun"></i>
                    </div>
                    <div class="weather-hero-temp">
                      <span class="temp-value">${Math.round(data.current.temperature_2m)}</span>
                      <span class="temp-unit">°C</span>
                    </div>
                  </div>
                  <div class="weather-hero-right">
                    <div class="weather-condition">${getWeatherDetails(data.current.weather_code).desc}</div>
                    <div class="weather-condition"><i class="fa-solid ${getWeatherDetails(data.current.weather_code).icon}"></i></div>
                    <div class="weather-feels">Feels like ${Math.round(data.current.apparent_temperature)}°C</div>
                    <div class="weather-high-low">
                      <span class="high"
                        ><i class="fa-solid fa-arrow-up"></i> ${data.daily.temperature_2m_max[0]}°</span
                      >
                      <span class="low"
                        ><i class="fa-solid fa-arrow-down"></i> ${data.daily.temperature_2m_min[0]}°</span
                      >
                    </div>
                  </div>
                </div>
    
    
    
    `;

    let weatherCardDet = document.getElementById("weather-card-det");
    weatherCardDet.innerHTML = `
                    <div class="weather-detail-card">
                  <div class="detail-icon humidity">
                    <i class="fa-solid fa-droplet"></i>
                  </div>
                  <div class="detail-info">
                    <span class="detail-label">Humidity</span>
                    <span class="detail-value">${data.current.relative_humidity_2m}%</span>
                  </div>
                </div>
                <div class="weather-detail-card">
                  <div class="detail-icon wind">
                    <i class="fa-solid fa-wind"></i>
                  </div>
                  <div class="detail-info">
                    <span class="detail-label">Wind</span>
                    <span class="detail-value">${data.current.wind_speed_10m} km/h</span>
                  </div>
                </div>
                <div class="weather-detail-card">
                  <div class="detail-icon uv">
                    <i class="fa-solid fa-sun"></i>
                  </div>
                  <div class="detail-info">
                    <span class="detail-label">UV Index</span>
                    <span class="detail-value">${data.current.uv_index}</span>
                  </div>
                </div>
                <div class="weather-detail-card">
                  <div class="detail-icon precip">
                    <i class="fa-solid fa-cloud-rain"></i>
                  </div>
                  <div class="detail-info">
                    <span class="detail-label">Precipitation</span>
                    <span class="detail-value">${data.hourly.precipitation_probability[0] || 0}%</span>
                  </div>
                </div>
    
    
    
    `;

    // --- الجزء بتاعك (Hourly Forecast) ---
    const deviceHour = new Date().getHours();
    let weatherSec = document.getElementById("weather-sec-horly");
    let containerHourly = "";
    let hourlyData = data.hourly;

    for (let i = 0; i < 16; i++) {
      let targetHour = deviceHour + i;

      let displayHour = targetHour % 24;

      let hourTemp = Math.round(hourlyData.temperature_2m[targetHour]);
      let hourIcon = getWeatherDetails(
        hourlyData.weather_code[targetHour],
      ).icon;

      containerHourly += `
        <div class="hourly-item ${i === 0 ? "now" : ""}">
            <span class="hourly-time">${i === 0 ? "Now" : (displayHour > 12 ? displayHour - 12 : displayHour === 0 ? 12 : displayHour) + ":00"}</span>
            <div class="hourly-icon">
                <i class="fa-solid ${hourIcon}"></i>
            </div>
            <span class="hourly-temp">${hourTemp}°</span>
        </div>
    `;
    }

    weatherSec.innerHTML = `              
              
                <h3 class="weather-section-title">
                  <i class="fa-solid fa-clock"></i> Hourly Forecast
                </h3>
                <div id="weather-hourly" class="hourly-scroll">
                  ${containerHourly}

                </div>
              `;

    // --- الجزء بتاعك (7-Day Forecast) ---
    let weatherSeven = document.getElementById("weather-sec-seven");
    let containerHero = ``;
    let dailyWeather = data.daily;

    for (let i = 0; i < 7; i++) {
      let date = new Date(dailyWeather.time[i]);
      let dayLabel =
        i === 0
          ? "Today"
          : date.toLocaleDateString("en-US", { weekday: "short" });
      let dayDate = date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
      let maxTemp = Math.round(dailyWeather.temperature_2m_max[i]);
      let minTemp = Math.round(dailyWeather.temperature_2m_min[i]);
      let icon = getWeatherDetails(dailyWeather.weather_code[i]).icon;
      let precipProb = dailyWeather.precipitation_sum[i];

      containerHero += `
        <div class="forecast-day ${i === 0 ? "today" : ""}">
            <div class="forecast-day-name">
                <span class="day-label">${dayLabel}</span>
                <span class="day-date">${dayDate}</span>
            </div>
            <div class="forecast-icon">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="forecast-temps">
                <span class="temp-max">${maxTemp}°</span>
                <span class="temp-min">${minTemp}°</span>
            </div>
            <div class="forecast-precip">
                ${precipProb > 0 ? `<i class="fa-solid fa-droplet"></i><span>${precipProb * 10 > 100 ? "95%" : `${Math.round(precipProb * 10)}%`}</span>` : ""}
            </div>
        </div>`;
    }

    weatherSeven.innerHTML = `  
                <h3 class="weather-section-title">
                  <i class="fa-solid fa-calendar-week"></i> 7-Day Forecast
                </h3>
                <div id="weatherSeven" class="forecast-list">

                  ${containerHero}

                </div>
              
    `;
  }
}
// ====================== END WEATHER FETCHING LOGIC =========================

// ======================== SUNRISE/SUNSET FETCHING LOGIC =========================
function formatSunTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

let sunCard = document.getElementById("sun-card-1");
let sunContent = document.getElementById("sun-times-content");
async function getSunData(lat, lng) {
  const response = await fetch(
    `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`,
  );
  const data = await response.json();

  const dataResults = data.results;
  updateSunUI(dataResults);
}

function updateSunUI(dataResults) {
  if (!sunContent) return;

  sunContent.classList.remove("hidden");
  document.getElementById("sunset-placeholder").classList.add("hidden");

  const totalSecondsInDay = 86400;
  const daylightSeconds = dataResults.day_length;
  const darknessSeconds = totalSecondsInDay - daylightSeconds;

  const dayPercent = ((daylightSeconds / totalSecondsInDay) * 100).toFixed(1);

  const daylightText = formatDuration(daylightSeconds);
  const darknessText = formatDuration(darknessSeconds);

  sunContent.innerHTML = `
    <div class="sun-main-card">
      <div class="sun-main-header">
        <div class="sun-location">
          <h2><i class="fa-solid fa-location-dot"></i> ${countryCapital[0] || "Cairo"}</h2>
          <p>Sun times for your selected location</p>
        </div>
        <div class="sun-date-display">
          <div class="date">${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
          <div class="day">${new Date().toLocaleDateString("en-US", { weekday: "long" })}</div>
        </div>
      </div>

      <div class="sun-times-grid">
        <div class="sun-time-card dawn">
          <div class="icon"><i class="fa-solid fa-moon"></i></div>
          <div class="label">Dawn</div>
          <div class="time">${formatSunTime(dataResults.civil_twilight_begin)}</div>
          <div class="sub-label">Civil Twilight</div>
        </div>
        <div class="sun-time-card sunrise">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Sunrise</div>
          <div class="time">${formatSunTime(dataResults.sunrise)}</div>
          <div class="sub-label">Golden Hour Start</div>
        </div>
        <div class="sun-time-card noon">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Solar Noon</div>
          <div class="time">${formatSunTime(dataResults.solar_noon)}</div>
          <div class="sub-label">Sun at Highest</div>
        </div>
        <div class="sun-time-card sunset">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Sunset</div>
          <div class="time">${formatSunTime(dataResults.sunset)}</div>
          <div class="sub-label">Golden Hour End</div>
        </div>
        <div class="sun-time-card dusk">
          <div class="icon"><i class="fa-solid fa-moon"></i></div>
          <div class="label">Dusk</div>
          <div class="time">${formatSunTime(dataResults.civil_twilight_end)}</div>
          <div class="sub-label">Civil Twilight</div>
        </div>
        <div class="sun-time-card daylight">
          <div class="icon"><i class="fa-solid fa-hourglass-half"></i></div>
          <div class="label">Day Length</div>
          <div class="time">${daylightText}</div>
          <div class="sub-label">Total Daylight</div>
        </div>
      </div>
    </div>

    <div class="day-length-card">
      <h3><i class="fa-solid fa-chart-pie"></i> Daylight Distribution</h3>
      <div class="day-progress">
        <div class="day-progress-bar">
          <div class="day-progress-fill" style="width: ${dayPercent}%"></div>
        </div>
      </div>
      <div class="day-length-stats">
        <div class="day-stat">
          <div class="value">${daylightText}</div>
          <div class="label">Daylight</div>
        </div>
        <div class="day-stat">
          <div class="value">${dayPercent}%</div>
          <div class="label">of 24 Hours</div>
        </div>
        <div class="day-stat">
          <div class="value">${darknessText}</div>
          <div class="label">Darkness</div>
        </div>
      </div>
    </div>
  `;
}
// ====================== END SUNRISE/SUNSET FETCHING LOGIC =========================

let btnConvert = document.getElementById("convert-btn");
btnConvert.addEventListener("click", () => {
  getCurrency();
});
async function getCurrency() {
  let selectedCurrencyFrom = document.getElementById("currency-from").value;
  let selectedCurrencyTo = document.getElementById("currency-to").value;

  let data = await fetch(
    `https://open.er-api.com/v6/latest/${selectedCurrencyFrom}`,
  );
  let res = await data.json();
  console.log(res.rates);

  let rate = res.rates[selectedCurrencyTo];
  let amountFrom = document.getElementById("currency-amount").value;
  let amountTo = (amountFrom * rate).toFixed(2);
  document.getElementById("resultAmount").textContent = parseFloat(
    amountTo,
  ).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  document.getElementById("fromCurrencyCode").textContent =
    selectedCurrencyFrom;
  document.getElementById("toCurrencyCode").textContent = selectedCurrencyTo;
  document.getElementById("currency-result").classList.remove("hidden");
  document.getElementById("exchange-rate-display").textContent =
    `1 ${selectedCurrencyFrom} = ${rate.toFixed(4)} ${selectedCurrencyTo}`;
  document.getElementById("dateCurrency").textContent =
    `Last updated: ${new Date(res.time_last_update_utc).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    )}`;

  let currencyDetailsBox = document.getElementById("popular-currencies");
  let quick = document.getElementById("Quick-sec");

  let box = "";
  box += `
 <div class="popular-currency-card">
        <img src="https://flagcdn.com/w40/eu.png" alt="EUR" class="flag" />
        <div class="info">
            <div class="code">EUR</div>
            <div class="name">Euro</div>
        </div>
        <div class="rate">${res.rates["EUR"].toFixed(2)}</div>
    </div>
    <div class="popular-currency-card">
        <img src="https://flagcdn.com/w40/gb.png" alt="GBP" class="flag" />
        <div class="info">
            <div class="code">GBP</div>
            <div class="name">British Pound</div>
        </div>
        <div class="rate">${res.rates["GBP"].toFixed(2)}</div>
    </div>
    <div class="popular-currency-card">
        <img src="https://flagcdn.com/w40/eg.png" alt="EGP" class="flag" />
        <div class="info">
            <div class="code">EGP</div>
            <div class="name">Egyptian Pound</div>
        </div>
        <div class="rate">${res.rates["EGP"].toFixed(2)}</div>
    </div>
    <div class="popular-currency-card">
        <img src="https://flagcdn.com/w40/ae.png" alt="AED" class="flag" />
        <div class="info">
            <div class="code">AED</div>
            <div class="name">UAE Dirham</div>
        </div>
        <div class="rate">${res.rates["AED"].toFixed(2)}</div>
    </div>
    <div class="popular-currency-card">
        <img src="https://flagcdn.com/w40/sa.png" alt="SAR" class="flag" />
        <div class="info">
            <div class="code">SAR</div>
            <div class="name">Saudi Riyal</div>
        </div>
        <div class="rate">${res.rates["SAR"].toFixed(2)}</div>
    </div>
    <div class="popular-currency-card">
        <img src="https://flagcdn.com/w40/jp.png" alt="JPY" class="flag" />
        <div class="info">
            <div class="code">JPY</div>
            <div class="name">Japanese Yen</div>
        </div>
        <div class="rate">${res.rates["JPY"].toFixed(2)}</div>
    </div>
    <div class="popular-currency-card">
        <img src="https://flagcdn.com/w40/ca.png" alt="CAD" class="flag" />
        <div class="info">
            <div class="code">CAD</div>
            <div class="name">Canadian Dollar</div>
        </div>
        <div class="rate">${res.rates["CAD"].toFixed(2)}</div>
    </div>
    <div class="popular-currency-card">
        <img src="https://flagcdn.com/w40/in.png" alt="INR" class="flag" />
        <div class="info">
            <div class="code">INR</div>
            <div class="name">Indian Rupee</div>
        </div>
        <div class="rate">${res.rates["INR"].toFixed(2)}</div>
    </div>
  
  `;
  currencyDetailsBox.innerHTML = box;
  quick.classList.remove("hidden");
  currencyDetailsBox.classList.remove("hidden");
}

let swapBtn = document.getElementById("swap-currencies-btn");
swapBtn.addEventListener("click", () => {
  let selectedCurrencyFrom = document.getElementById("currency-from").value;
  let selectedCurrencyTo = document.getElementById("currency-to").value;
  document.getElementById("currency-from").value = selectedCurrencyTo;
  document.getElementById("currency-to").value = selectedCurrencyFrom;
  getCurrency();
});
// ======================= END CURRENCY CONVERTER LOGIC =========================

// ======================== YEAR SELECTOR LOGIC =========================
const yearSelect = document.getElementById("current-year-select");
if (yearSelect) {
  yearSelect.style.height = "48px";
  yearSelect.style.width = "100%";

  yearSelect.addEventListener("change", (e) => {
    getHoliday();
  });
}

// ======================= END YEAR SELECTOR LOGIC =========================

// ======================== LONG WEEKENDS FETCHING LOGIC =========================
async function getLongWeekend(year, countryCode) {
  let data = await fetch(
    `https://date.nager.at/api/v3/LongWeekend/${year}/${countryCode}`,
  );
  let res = await data.json();
  console.log("Long Weekend Data:", res);
  renderLongWeekends(res);
}
function renderLongWeekends(weekends) {
  const lwPlaceholder = document.getElementById("lw-placeholder");
  lwPlaceholder.classList.add("hidden");
  const lwContainer = document.getElementById("lw-content");
  let box = "";

  weekends.forEach((weekend, index) => {
    const start = new Date(weekend.startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const end = new Date(weekend.endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const statusClass = weekend.needBridgeDay ? "warning" : "success";
    const statusIcon = weekend.needBridgeDay
      ? "fa-info-circle"
      : "fa-check-circle";
    const statusText = weekend.needBridgeDay
      ? "Requires taking a bridge day off"
      : "No extra days off needed!";

    let daysHtml = "";
    const tempDate = new Date(weekend.startDate);
    for (let i = 0; i < weekend.dayCount; i++) {
      const currentDay = new Date(tempDate);
      currentDay.setDate(tempDate.getDate() + i);

      const dayName = currentDay.toLocaleDateString("en-US", {
        weekday: "short",
      });
      const dayNum = currentDay.getDate();
      const isWeekend = [0, 5, 6].includes(currentDay.getDay());

      daysHtml += `
                <div class="lw-day ${isWeekend ? "weekend" : ""}">
                    <span class="name">${dayName}</span>
                    <span class="num">${dayNum}</span>
                </div>
            `;
    }

    box += `
            <div class="lw-card">
                <div class="lw-card-header">
                    <span class="lw-badge">
                        <i class="fa-solid fa-calendar-days"></i> ${weekend.dayCount} Days
                    </span>
                    <button class="holiday-action-btn" onclick="savePlan('longweekend', 'Long Weekend', '${weekend.startDate}')">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                </div>
                <h3>Long Weekend #${index + 1}</h3>
                <div class="lw-dates">
                    <i class="fa-regular fa-calendar"></i> ${start} - ${end}
                </div>
                <div class="lw-info-box ${statusClass}">
                    <i class="fa-solid ${statusIcon}"></i> ${statusText}
                </div>
                <div class="lw-days-visual">
                    ${daysHtml}
                </div>
            </div>
        `;
  });

  lwContainer.innerHTML = box;
}
// ====================== END LONG WEEKENDS FETCHING LOGIC =========================

// ======================== NAVIGATION TO DASHBOARD LOGIC =========================

function switchView() {
  document
    .querySelectorAll(".view")
    .forEach((view) => view.classList.remove("active"));

  const dashboard = document.getElementById("dashboard-view");
  if (dashboard) {
    dashboard.classList.add("active");
  }

  document
    .querySelectorAll(".nav-item")
    .forEach((item) => item.classList.remove("active"));
  document
    .querySelector('.nav-item[data-view="dashboard"]')
    ?.classList.add("active");

  const title = document.getElementById("page-title");
  if (title) title.textContent = "Dashboard";
}

let btnDashboard = document.querySelectorAll("#btn-dashboard");
console.log(btnDashboard);

btnDashboard.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchView();
  });
});

// ======================= END NAVIGATION TO DASHBOARD LOGIC =========================

function savePlan(type, title, date) {
  let savedPlans = JSON.parse(localStorage.getItem("wanderlust_plans")) || [];

  const isDuplicate = savedPlans.some(
    (plan) => plan.title === title && plan.date === date,
  );

  if (isDuplicate) {
    Swal.fire({
      icon: "info",
      title: "Already Saved",
      text: "This item is already in your plans!",
      confirmButtonColor: "#084887",
    });
    return;
  }

  const newPlan = {
    id: Date.now(),
    type: type,
    title: title,
    date: date,
    city: document.getElementById("current-city")?.textContent || "N/A",
  };

  savedPlans.push(newPlan);
  localStorage.setItem("wanderlust_plans", JSON.stringify(savedPlans));

  updateDashboardStats();

  Swal.fire({
    toast: true,
    position: "bottom-end",
    icon: "success",
    title: "Saved to My Plans!",
    showConfirmButton: false,
    timer: 2000,
    background: "#059669",
    color: "#fff",
  });
}

function updateDashboardStats() {
  const plans = JSON.parse(localStorage.getItem("wanderlust_plans")) || [];

  const statSaved = document.getElementById("stat-saved");
  if (statSaved) statSaved.textContent = plans.length;

  const navBadge = document.getElementById("plans-count");
  if (navBadge) {
    navBadge.textContent = plans.length;
    navBadge.classList.toggle("hidden", plans.length === 0);
  }
}

window.savePlan = savePlan;

updateDashboardStats();

const clearAllBtn = document.getElementById("clear-all-plans-btn");
if (clearAllBtn) {
  clearAllBtn.addEventListener("click", () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will lose all your saved plans!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete all!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("wanderlust_plans");
        updateDashboardStats();
        renderMyPlans();

        Swal.fire("Deleted!", "All plans have been cleared.", "success");
      }
    });
  });
}

function renderMyPlans(filter = "all") {
  const container = document.getElementById("plans-content");
  const savedData = JSON.parse(localStorage.getItem("wanderlust_plans")) || [];

  document.getElementById("filter-all-count").textContent = savedData.length;
  document.getElementById("filter-holiday-count").textContent =
    savedData.filter((p) => p.type === "holiday").length;
  document.getElementById("filter-event-count").textContent = savedData.filter(
    (p) => p.type === "event",
  ).length;
  document.getElementById("filter-lw-count").textContent = savedData.filter(
    (p) => p.type === "longweekend",
  ).length;

  const displayData =
    filter === "all" ? savedData : savedData.filter((p) => p.type === filter);

  if (displayData.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fa-solid fa-heart-crack"></i></div>
                <h3>No Plans Found</h3>
                <p>Start exploring and save your favorite items!</p>
                <button onclick="switchView('dashboard')" class="btn-primary"><i class="fa-solid fa-compass"></i> Start Exploring</button>
            </div>`;
    return;
  }

  let box = "";
  displayData.forEach((plan) => {
    box += `
            <div class="plan-card">
                <div class="plan-card-type ${plan.type}">${plan.type}</div>
                <div class="plan-card-content">
                    <h4>${plan.title}</h4>
                    <div class="plan-card-details">
                        <div><i class="fa-solid fa-location-dot"></i> ${plan.city}</div>
                        <div><i class="fa-regular fa-calendar"></i> ${plan.date}</div>
                    </div>
                    <div class="plan-card-actions">
                        <button class="btn-plan-remove" onclick="deletePlan(${plan.id})">
                            <i class="fa-solid fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>`;
  });
  container.innerHTML = box;
}

window.deletePlan = function (id) {
  let savedPlans = JSON.parse(localStorage.getItem("wanderlust_plans")) || [];
  savedPlans = savedPlans.filter((plan) => plan.id !== id);
  localStorage.setItem("wanderlust_plans", JSON.stringify(savedPlans));

  updateDashboardStats();

  const activeFilter = document
    .querySelector(".plan-filter.active")
    .getAttribute("data-filter");
  renderMyPlans(activeFilter);
};

document.querySelectorAll(".plan-filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".plan-filter")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderMyPlans(btn.getAttribute("data-filter"));
  });
});

window.renderMyPlans = renderMyPlans;

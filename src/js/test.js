let countrySelector = document.getElementById("global-country");

async function getCountrySelector() {
  let data = await fetch("https://date.nager.at/api/v3/AvailableCountries");
  let res = await data.json();

  res.forEach((country) => {
    let option = document.createElement("option");
    option.value = country.countryCode;
    option.textContent = ` ${country.name}`;
    countrySelector.appendChild(option);
  });
}

getCountrySelector();

// ديه جزيه العلم والاسم و المدينه
let flagImage = document.getElementById("selected-country-flag");
let countryName = document.getElementById("selected-country-name");
let cityName = document.getElementById("selected-city-name");
countrySelector.addEventListener("change", function () {
  const selectedValueCode = countrySelector.value.toLowerCase();

  const selectedText =
    countrySelector.options[countrySelector.selectedIndex].text;

  flagImage.src = `https://flagcdn.com/w40/${selectedValueCode}.png`;
  countryName.textContent = selectedText;
  cityName.textContent = "Capital City";
});
async function fetchCountryCode() {
  const countryCode = countrySelector.value.toLowerCase();
  if (!countryCode) return;
  console.log(countryCode);

  let data = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
  let res = await data.json();
  res = res[0];
  console.log(res);

  updateDataUI(res);
}

let btnExplore = document.getElementById("global-search-btn");
btnExplore.addEventListener("click", function () {
  fetchCountryCode();
});

function updateDataUI(res) {
  let imgInfo = document.querySelector(".dashboard-country-flag");
  imgInfo.src = res.flags.png;
  let nameInfo = document.getElementById("dashboard-country-name");
  nameInfo.textContent = res.name.common;
  let region = document.querySelector(".region");
  region.textContent = res.region;
  let time = document.getElementById("country-local-time");
  let localTime = document.querySelector(".local-time-zone");
  localTime.textContent = res.timezones[0];
  let capitalDetail = document.getElementById("capital-detail");
  capitalDetail.textContent = res.capital[0];
  let population = document.getElementById("population-detail");
  population.textContent = res.population.toLocaleString();
  let areaDetail = document.getElementById("area-detail");
  areaDetail.textContent = res.area.toLocaleString() + " km²";
  let continentDetail = document.getElementById("continent-detail");
  continentDetail.textContent = res.continents[0];
  let callingCode = document.getElementById("callingCode");
  callingCode.textContent = res.idd.root + res.idd.suffixes[0];
  let drivingDetail = document.getElementById("driving-detail");
  drivingDetail.textContent =
    res.car.side.charAt(0).toUpperCase() + res.car.side.slice(1);
  let weekDetail = document.getElementById("week-detail");
  weekDetail.textContent =
    res.startOfWeek.charAt(0).toUpperCase() + res.startOfWeek.slice(1);
  let langDetail = document.getElementById("lang-detail");
  langDetail.textContent = Object.values(res.languages).join(", ");
  let currencyDet = document.getElementById("currency-det");
  let currencyKeys = Object.keys(res.currencies);
  let currencyInfo = res.currencies[currencyKeys[0]];
  currencyDet.textContent =
    currencyInfo.name +
    " (" +
    currencyKeys[0] +
    " " +
    currencyInfo.symbol +
    ")";
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

  let officialName = document.querySelector(".official-name");
  officialName.textContent = res.name.official;

  let mapLink = document.querySelector(".btn-map-link");
  mapLink.href = res.maps.googleMaps;
}

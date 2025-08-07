const API_KEY = "307e2b29887ad37cbbbc745558cc4411";
const BASE_URL = "https://api.openweathermap.org/data/2.5/";
const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";

const searchInput = document.getElementById("searchInput");
const suggestionsList = document.getElementById("suggestionsList");
const searchForm = document.querySelector(".busca");

// Função de debounce, para não fazer diversas requisições nas sugestões de pesquisa
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// Função principal que executa a busca
const performSearch = async (locationData) => {
  let name, lat, lon, country, state;

  if (typeof locationData === "string") {
    // Se a busca veio do submit do formulário
    const query = locationData;
    if (query === "") {
      clearInfo();
      return;
    }
    clearInfo();
    showWarning("Carregando...");
    suggestionsList.classList.add("hidden");

    // Busca as coordenadas e o estado usando a Geocoding API
    let geoUrl = `${GEO_URL}?q=${encodeURI(query)}&limit=1&appid=${API_KEY}`;
    let geoResults = await fetch(geoUrl);
    let geoJson = await geoResults.json();

    if (geoJson.length > 0) {
      ({ name, lat, lon, country, state } = geoJson[0]);
    } else {
      clearInfo();
      showWarning("Não encontramos essa localização");
      return;
    }
  } else {
    // Se a busca veio de um clique na lista de sugestões
    ({ name, lat, lon, country, state } = locationData);
    searchInput.value = name;
    clearInfo();
    showWarning("Carregando...");
    suggestionsList.classList.add("hidden");
  }

  // Usa as coordenadas para buscar o clima atual
  let currentWeatherUrl = `${BASE_URL}weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;
  let currentWeatherResults = await fetch(currentWeatherUrl);
  let currentWeatherJson = await currentWeatherResults.json();

  showInfo({
    name,
    state,
    country,
    temp: currentWeatherJson.main.temp,
    tempIcon: currentWeatherJson.weather[0].icon,
    windSpeed: currentWeatherJson.wind.speed,
    descri: currentWeatherJson.weather[0].description,
  });

  // Usa as coordenadas para buscar a previsão de 5 dias
  let forecastUrl = `${BASE_URL}forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;
  let forecastResults = await fetch(forecastUrl);
  let forecastJson = await forecastResults.json();

  if (forecastJson.cod === "200") {
    const dailyForecast = processForecastData(forecastJson.list);
    showDailyForecast(dailyForecast);
  }
};

// Função para buscar e exibir as sugestões de cidade
const fetchSuggestions = debounce(async (query) => {
  if (query.length < 3) {
    suggestionsList.innerHTML = "";
    suggestionsList.classList.add("hidden");
    return;
  }

  let geoUrl = `${GEO_URL}?q=${encodeURI(query)}&limit=5&appid=${API_KEY}`;
  let geoResults = await fetch(geoUrl);
  let geoJson = await geoResults.json();

  suggestionsList.innerHTML = "";
  if (geoJson.length > 0) {
    suggestionsList.classList.remove("hidden");
    geoJson.forEach((city) => {
      const li = document.createElement("li");
      li.textContent = `${city.name}${city.state ? ", " + city.state : ""}, ${
        city.country
      }`;
      li.addEventListener("click", () => {
        performSearch(city); // Chama a função de busca com o objeto city correto, o que antes recebia city.name (como não recebia um objeto complexo, mesmo clicando na sugestão, a primeira opção era selecionada)
      });
      suggestionsList.appendChild(li);
    });
  } else {
    suggestionsList.classList.add("hidden");
  }
}, 500);

// Adiciona o evento para as sugestões
searchInput.addEventListener("input", (e) => {
  fetchSuggestions(e.target.value);
});

// Adiciona o evento para a busca principal
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  performSearch(searchInput.value);
});

function processForecastData(dataList) {
  const dailyData = {};
  dataList.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const day = date.toISOString().split("T")[0];
    if (!dailyData[day]) {
      dailyData[day] = {
        temp_min: item.main.temp_min,
        temp_max: item.main.temp_max,
        icon: item.weather[0].icon,
      };
    } else {
      dailyData[day].temp_min = Math.min(
        dailyData[day].temp_min,
        item.main.temp_min
      );
      dailyData[day].temp_max = Math.max(
        dailyData[day].temp_max,
        item.main.temp_max
      );
    }
  });
  return Object.values(dailyData);
}

function showInfo(data) {
  showWarning("");
  document.querySelector(".resultado").style.display = "block";
  const locationText = data.state
    ? `${data.name}, ${data.state}, ${data.country}`
    : `${data.name}, ${data.country}`;
  document.querySelector(".titulo").innerHTML = locationText;
  document.querySelector(".temperatura").innerHTML = `${data.temp.toFixed(
    1
  )} <sup>ºC</sup>`;
  document.querySelector(".ventoInfo").innerHTML = `${data.windSpeed.toFixed(
    1
  )} <span>km/h</span>`;
  document.querySelector(".tempInfo").innerHTML = `${data.descri}`;
  document
    .querySelector(".informacoes img")
    .setAttribute(
      "src",
      `http://openweathermap.org/img/wn/${data.tempIcon}@2x.png`
    );
}

function showDailyForecast(forecastList) {
  const forecastContainer = document.getElementById("forecast-container");
  forecastContainer.innerHTML = "";
  document.querySelector(".previsao-7-dias").style.display = "block";
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const today = new Date();
  forecastList.forEach((dayData, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const dayName = index === 0 ? "Hoje" : daysOfWeek[date.getDay()];
    const dayTempMin = dayData.temp_min.toFixed(0);
    const dayTempMax = dayData.temp_max.toFixed(0);
    const dayIcon = dayData.icon;

    const dayDiv = document.createElement("div");
    dayDiv.className = "day-forecast";
    dayDiv.innerHTML = `
                    <div class="font-bold w-1/4">${dayName}</div>
                    <img src="http://openweathermap.org/img/wn/${dayIcon}@2x.png" alt="Ícone do tempo" class="w-1/4">
                    <div class="w-1/4 text-center">
                        <span class="font-bold">${dayTempMax}º</span>
                        <span class="opacity-70">${dayTempMin}º</span>
                    </div>
                `;
    forecastContainer.appendChild(dayDiv);
  });
}

function showWarning(msg) {
  document.querySelector(".aviso").innerHTML = msg;
}

function clearInfo() {
  showWarning("");
  document.querySelector(".resultado").style.display = "none";
  document.querySelector(".previsao-7-dias").style.display = "none";
}

// Esconde a lista de sugestões ao clicar fora dela
document.addEventListener("click", (e) => {
  if (!searchForm.contains(e.target)) {
    suggestionsList.classList.add("hidden");
  }
});

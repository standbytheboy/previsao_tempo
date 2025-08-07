const API_KEY = "307e2b29887ad37cbbbc745558cc4411";
const BASE_URL = "https://api.openweathermap.org/data/2.5/";

document.querySelector(".busca").addEventListener("submit", async (event) => {
  event.preventDefault();

  let input = document.querySelector("#searchInput").value;
  if (input !== "") {
    clearInfo();
    showWarning("Carregando...");

    // Faz uma única chamada para a API de 5 dias / 3 horas
    let url = `${BASE_URL}forecast?q=${encodeURI(
      input
    )}&appid=${API_KEY}&units=metric&lang=pt_br`;
    let results = await fetch(url);
    let json = await results.json();

    if (json.cod === "200") {
      showInfo({
        name: json.city.name,
        country: json.city.country,
        temp: json.list[0].main.temp,
        tempIcon: json.list[0].weather[0].icon,
        windSpeed: json.list[0].wind.speed,
        descri: json.list[0].weather[0].description,
      });

      // Processa os dados de 3 em 3 horas para mostrar um resumo diário
      const dailyForecast = processForecastData(json.list);
      showDailyForecast(dailyForecast);
    } else {
      clearInfo();
      showWarning("Não encontramos essa localização");
    }
  } else {
    clearInfo();
  }
});

// Esta função agrupa os dados de 3 em 3 horas em um resumo diário
function processForecastData(dataList) {
  const dailyData = {};

  dataList.forEach((item) => {
    const date = new Date(item.dt * 1000); // Converte timestamp para data
    const day = date.toISOString().split("T")[0]; // Extrai a data 'YYYY-MM-DD'

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
  document.querySelector(".titulo").innerHTML = `${data.name}, ${data.country}`;
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

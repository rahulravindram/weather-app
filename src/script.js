const temperatureField = document.querySelector(".temp");
const locationField = document.querySelector(".time_location p");
const dateAndTimeField = document.querySelector(".time_location span");
const conditionField = document.querySelector(".condition p");
const conditionFieldImg = document.querySelector(".image");
const humidityField = document.querySelector(".humidity");
const windField = document.querySelector(".wind");

const searchField = document.querySelector(".search_area");
const form = document.querySelector("form");
const locationButton = document.querySelector(".location_button");

const forecastCards = document.querySelectorAll(".forecast_card");

form.addEventListener("submit", searchForLocation);
locationButton.addEventListener("click", getUserLocation);

let target = "Kochi";

const fetchResults = async (targetLocation) => {
    try {
        let url = `https://api.weatherapi.com/v1/forecast.json?key=640d32df65484c249d342052250404&q=${targetLocation}&days=5&aqi=no&alerts=no`;

        const res = await fetch(url);
        const data = await res.json();

        console.log(data)

        if (data.error) {
            alert(`City not found: ${targetLocation}`);
            return;
        }

        let locationName = data.location.name;
        let time = data.location.localtime;
        let temp = data.current.temp_c;
        let condition = data.current.condition.text;
        let image = data.current.condition.icon;
        let humidity = data.current.humidity;
        let wind = data.current.wind_kph;

        updateDetails(temp, locationName, time, condition, image, humidity, wind);
        updateForecast(data.forecast.forecastday);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

function searchForLocation(e) {
    e.preventDefault();
    target = searchField.value;
    fetchResults(target);
}

function updateDetails(temp, locationName, time, condition, image, humidity, wind) {
    let splitDate = time.slice(0, 10);
    let splitTime = time.slice(11, 16);
    let currentDay = getDayName(new Date(splitDate).getDay());

    temperatureField.innerHTML = `${temp}°C`;
    locationField.innerHTML = locationName;
    dateAndTimeField.innerHTML = `${splitTime} ${currentDay} ${splitDate}`;
    conditionField.innerHTML = condition;
    conditionFieldImg.src = "https:" + image;
    humidityField.innerHTML = `Humidity: ${humidity}%`;
    windField.innerHTML = `Wind: ${wind} km/h`;
}

function updateForecast(forecastData) {
    forecastCards.forEach((card, index) => {
        if (forecastData[index]) {
            card.querySelector(".forecast_date").innerHTML = `(${forecastData[index].date})`;
            card.querySelector(".forecast_image").src = "https:" + forecastData[index].day.condition.icon;
            card.querySelector(".forecast_image").alt = forecastData[index].day.condition.text;
            card.querySelector("p:nth-child(3)").innerHTML = `Temp: ${forecastData[index].day.avgtemp_c}°C`;
            card.querySelector("p:nth-child(4)").innerHTML = `Wind: ${forecastData[index].day.maxwind_kph} km/h`;
            card.querySelector("p:nth-child(5)").innerHTML = `Humidity: ${forecastData[index].day.avghumidity}%`;
        }
    });
}



function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                let url = `https://api.weatherapi.com/v1/current.json?key=640d32df65484c249d342052250404&q=${lat},${lon}&aqi=no`;

                try {
                    const res = await fetch(url);
                    const data = await res.json();
                    fetchResults(data.location.name);
                } catch (error) {
                    console.error("Error fetching location:", error);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

function getDayName(number) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[number];
}

fetchResults(target);


const recentCitiesDropdown = document.querySelector(".recent_cities");

// Store a city in local storage
function saveToRecentCities(city) {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

    // Avoid duplicates
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem("recentCities", JSON.stringify(cities));
    }

    renderRecentCities();
}

// Render the dropdown
function renderRecentCities() {
    const cities = JSON.parse(localStorage.getItem("recentCities")) || [];

    if (cities.length > 0) {
        recentCitiesDropdown.style.display = "block";
        recentCitiesDropdown.innerHTML = '<option disabled selected>Choose a city</option>';
        cities.forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            recentCitiesDropdown.appendChild(option);
        });
    } else {
        recentCitiesDropdown.style.display = "none";
    }
}

// On city selection from dropdown
recentCitiesDropdown.addEventListener("change", (e) => {
    const selectedCity = e.target.value;
    fetchResults(selectedCity);
});

// error messages for blank and invalid searchForLocation
function searchForLocation(e) {
    e.preventDefault();
    target = searchField.value.trim();

    if (target === "") {
        alert("Please enter a city name.");
        return;
    }

    if (!isValidCityName(target)) {
        alert("Invalid city name. Use only letters and spaces.");
        return;
    }

    fetchResults(target);
    saveToRecentCities(target);
    searchField.value = "";
}

// Call render on load
renderRecentCities();


function isValidCityName(name) {
    const pattern = /^[a-zA-Z\s]{2,}$/; // Only letters and spaces, at least 2 chars
    return pattern.test(name);
}


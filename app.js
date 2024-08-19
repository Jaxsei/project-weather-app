const apiKey = "bc9c852f44ab4ff98ee235609241308"; // Replace with your actual API key
const locationData = document.querySelector(".search-box").value;
const searchBtn = document.querySelector(".search-icon");

const currentDate = new Date();

//i decided to try the harder way

const monthText = [
    "January",
    "Febraury",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

//Get Date
const day = currentDate.getDate(); // Day of the month (1-31)
const month = currentDate.getMonth(); // Months are zero-indexed (0-11)
const year = currentDate.getFullYear(); // Full year (e.g., 2024)

// Format the date as you like
const formattedDate = `${day}/${month}/${year}`;

document.getElementById("date").innerHTML = `${day}, ${monthText[month]}, ${year}`;
searchBtn.addEventListener("click", () => {
    const locationInput = document.querySelector(".search-box").value.trim();

    // Check if location input is empty
    if (!locationInput) {
        alert("Please enter a location.");
        return;
    }

    // API URLs
    const currentWeatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${locationInput}`;
    const astronomyUrl = `https://api.weatherapi.com/v1/astronomy.json?key=${apiKey}&q=${locationInput}`;
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${locationInput}&days=1`; // Adjusted to 1 day

    async function getWeatherData() {
        try {
            const [currentWeatherResponse, astronomyResponse, forecastResponse] = await Promise.all([
                fetch(currentWeatherUrl),
                fetch(astronomyUrl),
                fetch(forecastUrl)
            ]);

            // Check if all fetch requests were successful
            if (!currentWeatherResponse.ok) throw new Error(`Current weather data fetch failed: ${currentWeatherResponse.statusText}`);
            if (!astronomyResponse.ok) throw new Error(`Astronomy data fetch failed: ${astronomyResponse.statusText}`);
            if (!forecastResponse.ok) throw new Error(`Forecast data fetch failed: ${forecastResponse.statusText}`);

            // Parse the responses as JSON
            const currentWeatherData = await currentWeatherResponse.json();
            const astronomyData = await astronomyResponse.json();
            const forecastData = await forecastResponse.json();

            // Check if the forecast property exists
            if (!forecastData.forecast || !forecastData.forecast.forecastday) {
                throw new Error("Forecast data is not in expected format");
            }

            // Combine the data as needed
            const combinedData = {
                currentWeather: currentWeatherData,
                astronomy: astronomyData,
                dayForecast: forecastData.forecast.forecastday[0], // Today's forecast
                hourlyForecast: forecastData.forecast.forecastday[0].hour.slice(0, 24) // First 5 hours of forecast
            };

            // Log combined data
            console.log(combinedData);

            // Use the combinedData to display in your app

            // box2
            document.getElementById("cityName").innerHTML = currentWeatherData.location.name;
            document.getElementById("temp").innerHTML = Math.round(currentWeatherData.current.temp_c) + "°c";
            document.getElementById("humidity").innerHTML = currentWeatherData.current.humidity + "%";
            document.getElementById("wind").innerHTML = currentWeatherData.current.wind_kph + " km/h";

            // box3
            document.getElementById("feels-like").innerHTML = `${currentWeatherData.current.condition.text}`;
            // document.getElementById("time").innerHTML = astronomyData

        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    }

    getWeatherData();
});
//css animations





const slider = document.querySelector('.hourly-forecast-slider');
let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
});
slider.addEventListener('mouseleave', () => {
    isDown = false;
});
slider.addEventListener('mouseup', () => {
    isDown = false;
});
slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed
    slider.scrollLeft = scrollLeft - walk;
});

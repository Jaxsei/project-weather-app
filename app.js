const apiKey = "bc9c852f44ab4ff98ee235609241308"
const searchBtn = document.getElementById("searchBtn");
const currentDate = new Date();
const weatherImg = document.getElementById("weatherImg");

const monthText = [
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
    "December"
];

const day = currentDate.getDate();
const month = currentDate.getMonth();
const year = currentDate.getFullYear();
const hours = currentDate.getHours();
const minutes = currentDate.getMinutes();
const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
const formattedDate = `${day}/${month + 1}/${year}`;
document.getElementById("date").innerHTML = `${day}, ${monthText[month]}, ${year}`;
document.getElementById("time").innerHTML = formattedTime;

searchBtn.addEventListener("click", () => {
    const locationInput = document.getElementById("searchInput").value.trim();

    if (!locationInput) {
        alert("Please enter a location.");
        return;
    }

    const currentWeatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${locationInput}&aqi=yes`;
    const astronomyUrl = `https://api.weatherapi.com/v1/astronomy.json?key=${apiKey}&q=${locationInput}`;
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${locationInput}&days=1`;

    async function getWeatherData() {
        try {
            const [currentWeatherResponse, astronomyResponse, forecastResponse] = await Promise.all([
                fetch(currentWeatherUrl),
                fetch(astronomyUrl),
                fetch(forecastUrl)
            ]);

            if (!currentWeatherResponse.ok) throw new Error(`Current weather data fetch failed: ${currentWeatherResponse.statusText}`);
            if (!astronomyResponse.ok) throw new Error(`Astronomy data fetch failed: ${astronomyResponse.statusText}`);
            if (!forecastResponse.ok) throw new Error(`Forecast data fetch failed: ${forecastResponse.statusText}`);

            const currentWeatherData = await currentWeatherResponse.json();
            const astronomyData = await astronomyResponse.json();
            const forecastData = await forecastResponse.json();

            if (!forecastData.forecast || !forecastData.forecast.forecastday) {
                throw new Error("Forecast data is not in expected format");
            }

            const combinedData = {
                currentWeather: currentWeatherData,
                astronomy: astronomyData,
                dayForecast: forecastData.forecast.forecastday[0],
                hourlyForecast: forecastData.forecast.forecastday[0].hour.slice(0, 25)
            };

            console.log(combinedData);
            temp = currentWeatherData.current.temp_c;

            // Call functions
            box2(combinedData.currentWeather);
            box3(combinedData.currentWeather);
            dayNight(currentWeatherData);
            weatherMetrics(combinedData.currentWeather);
            moonInfo(combinedData.astronomy);
            hourForecast(combinedData.hourlyForecast);
            sunCycle(astronomyData);
            weatherPos(currentWeatherData);
            updateThermometer(temp);
            changeIcon(currentWeatherData, astronomyData);

        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    }

    getWeatherData();
});

function box2(currentWeatherData) {
    document.getElementById("cityName").innerHTML = currentWeatherData.location.name;
    document.getElementById("temp").innerHTML = `${Math.round(currentWeatherData.current.temp_c)}°C`;
    document.getElementById("humidity").innerHTML = `${currentWeatherData.current.humidity}%`;
    document.getElementById("wind").innerHTML = `${currentWeatherData.current.wind_kph} km/h`;
}

function box3(currentWeatherData) {
    const phrase = currentWeatherData.location.country;
    const words = phrase.split(" ");
    const abbreviation = words.map(word => word.charAt(0)).join("");
    document.getElementById("feels-like").innerHTML = `${currentWeatherData.current.condition.text}, ${abbreviation}`;
}

function dayNight(currentWeatherData) {
    if (currentWeatherData.current.is_day !== 1) {
        document.getElementById("dayTime").innerHTML = "Night";
    } else {
        document.getElementById("dayTime").innerHTML = "Day";
    }
}

function weatherMetrics(currentWeatherData) {
    document.getElementById("rainChances").innerHTML = `Precipitation: ${currentWeatherData.current.precip_in}in`;
    document.getElementById("windDir").innerHTML = `Wind Direction: ${currentWeatherData.current.wind_dir}`;
    document.getElementById("pressure").innerHTML = `Pressure: ${currentWeatherData.current.pressure_mb}mb`;
    document.getElementById("aqi").innerHTML = `AQI: ${Math.round(currentWeatherData.current.air_quality.pm2_5)}`;
    document.getElementById("uv").innerHTML = `UV Index: ${currentWeatherData.current.uv}`;
    document.getElementById("vis").innerHTML = `Visibility: ${currentWeatherData.current.vis_km}km`;
}

function moonInfo(astronomyData) {
    const moonPhase = astronomyData.astronomy.astro.moon_phase;
    const moonIllumination = astronomyData.astronomy.astro.moon_illumination;

    let moonAge;
    switch (moonPhase) {
        case "New Moon":
            moonAge = 0;
            break;
        case "Waxing Crescent":
            moonAge = Math.round(moonIllumination / 12.5);
            break;
        case "First Quarter":
            moonAge = 7;
            break;
        case "Waxing Gibbous":
            moonAge = 7 + Math.round((moonIllumination - 50) / 12.5);
            break;
        case "Full Moon":
            moonAge = 14;
            break;
        case "Waning Gibbous":
            moonAge = 14 + Math.round((100 - moonIllumination) / 12.5);
            break;
        case "Last Quarter":
            moonAge = 21;
            break;
        case "Waning Crescent":
            moonAge = 21 + Math.round((50 - moonIllumination) / 12.5);
            break;
        default:
            moonAge = "Unknown";
    }
    document.getElementById("moonName").innerHTML = astronomyData.astronomy.astro.moon_phase;
    document.getElementById("moonAge").innerHTML = `Moon Age: ${moonAge} Days`;
    document.getElementById("moonR").innerHTML = `Moon Rise: ${astronomyData.astronomy.astro.moonrise}`;
    document.getElementById("moonS").innerHTML = `Moon Set: ${astronomyData.astronomy.astro.moonset}`;
}



function hourForecast(hourlyForecast) {
    hourlyForecast.forEach((item, index) => {
        const timeElement = document.getElementById(`${index + 1}am`);
        const tempElement = document.getElementById(`${index + 1}temp`);
        const windElement = document.getElementById(`${index + 1}wind`);
        const precipitationElement = document.getElementById(`${index + 1}chance`);

        if (timeElement && tempElement && windElement && precipitationElement) {
            tempElement.textContent = `${item.temp_c}°C`; // e.g., "28°C"
            windElement.textContent = `Wind: ${item.wind_kph} km/h`; // e.g., "Wind: 12 km/h"
            precipitationElement.textContent = `Rain: ${item.chance_of_rain}%`; // e.g., "Rain: 0%"
        }
    });
}

function sunCycle(astronomyData) {
    document.getElementById("sunR").innerHTML = `Sunrise: ${astronomyData.astronomy.astro.sunrise}`
    document.getElementById("sunS").innerHTML = `Sunset: ${astronomyData.astronomy.astro.sunset}`
}

function weatherPos(currentWeatherData) {
    if (currentWeatherData.current.condition.text.toLowerCase() !== "clear" && currentWeatherData.current.condition.text.toLowerCase() !== "sunny") {
        weatherImg.classList.remove("glow-animation");
        weatherImg.style.setProperty("filter", "none"); // Optionally remove the shadow effect
    } else {
        weatherImg.classList.add("glow-animation");
        weatherImg.style.setProperty("filter", "drop-shadow(0 0 10px rgba(255, 255, 0, 0.8))");
    }

    switch (currentWeatherData.current.condition.text) {
        case 'Clear':
            weatherImg.src = "images/clear.png";
            break;
        case 'Snow':
            weatherImg.src = "images/snow.png";
            break;
        case 'Partly Cloudy':
            weatherImg.src = "images/cloudy.png";
            break;
        case 'Drizzle':
            weatherImg.src = "images/drizzle.png";
            break;
        case 'Mist':
            weatherImg.src = "images/mist.png";
            break;
        case 'Rain':
            weatherImg.src = "images/rain.png";
            break;
        case 'Overcast':
            weatherImg.src = "images/cloudy.png";
            break;
        case 'Fog':
            weatherImg.src = "images/mist.png";
            break;
        case 'Thunderstorm':
            weatherImg.src = "images/rain.png";
            break;
        case 'Hail':
            weatherImg.src = "images/snow.png";
            break;
        case 'Tornado':
            weatherImg.src = "images/cloudy.png";
            break;
    }
}


//CSS animations


const slider = document.querySelector('.hourly-forecast-slider');

if (slider) {
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
        const walk = (x - startX) * 3;
        slider.scrollLeft = scrollLeft - walk;
    });
}

//thermometer

function updateThermometer(temp) {
    const thermometerContainer = document.querySelector('.thermometer-container');

    // Remove all temperature classes
    thermometerContainer.classList.remove('cold', 'cool', 'warm', 'hot');

    // Add class based on temperature
    if (temp < 10) {
        thermometerContainer.classList.add('cold');
    } else if (temp >= 10 && temp < 20) {
        thermometerContainer.classList.add('cool');
    } else if (temp >= 20 && temp < 30) {
        thermometerContainer.classList.add('warm');
    } else {
        thermometerContainer.classList.add('hot');
    }
}

function changeIcon(currentWeatherData, astronomyData) {
    if (currentWeatherData.current.is_day !== 1) {
        dayIcon.src = "images/night.png";
    } else {
        dayIcon.src = "images/day.png";
    }

    const video = document.getElementById('video');
    
    function changeBackgroundVideo(conditionText, isDay) {
        let videoSource;
    
        if (isDay) {
            switch (conditionText) {
                case "Clear":
                case "Sunny":
                    videoSource = "images/sunny-day.mp4";
                    break;
                case "Partly cloudy":
                case "Cloudy":
                case "Overcast":
                    videoSource = "images/cloudy-day.mp4";
                    break;
                case "Rain":
                case "Patchy rain possible":
                case "Showers":
                    videoSource = "images/rainy-day.mp4";
                    break;
                case "Snow":
                case "Blizzard":
                case "Sleet":
                    videoSource = "images/snowy-day.mp4";
                    break;
                case "Thunderstorm":
                case "Patchy light rain with thunder":
                    videoSource = "images/thunderstorm.mp4";
                    break;
                default:
                    videoSource = "images/nature.mp4";
            }
        } else {
            switch (conditionText) {
                case "Clear":
                case "Sunny":
                    videoSource = "images/sunny-night.mp4";
                    break;
                case "Partly cloudy":
                case "Cloudy":
                case "Overcast":
                    videoSource = "images/cloudy-night.mp4";
                    break;
                case "Rain":
                case "Patchy rain possible":
                case "Showers":
                    videoSource = "images/rainy-night.mp4";
                    break;
                default:
                    videoSource = "images/nature.mp4";
            }
        }
    
        // Fade out current video
        video.style.opacity = 0;
    
        // Change video source and fade in new video
        setTimeout(() => {
            video.src = videoSource;
            video.load();
            video.play();
            video.style.opacity = 1;
        }, 1000); // Adjust timeout for the fade effect
    }
    // Example usage
    const currentWeatherCondition = currentWeatherData.current.condition.text;
    const isDaytime = currentWeatherData.current.is_day === 1;
    changeBackgroundVideo(currentWeatherCondition, isDaytime);
    
    switch (astronomyData.astronomy.astro.moon_phase) {
        case 'New Moon':
            moonImg.src = "images/new-moon.png";
            break;
        case 'Waxing Crescent':
            moonImg.src = "images/waxing-crescent.png";
            break;
        case 'First Quarter':
            moonImg.src = "images/first-quarter.png";
            break;
        case 'Waxing Gibbous':
            moonImg.src = "images/waxing-gibbous.png";
            break;
        case 'Full Moon':
            moonImg.src = "images/full-moon.png";
            break;
        case 'Waning Gibbous':
            moonImg.src = "images/waxing-gibbous.png";
            break;
        case 'Last Quarter':
            moonImg.src = "images/last-quarter.png";
            break;
        case 'Waning Crescent':
            moonImg.src = "images/waning-crescent.png";
            break;
        default:
            moonImg.src = "default-moon.png"; // Fallback in case of an unrecognized phase
    }
}


// Select the button and the content to be faded out and in
const fadeButton = document.getElementById('searchBtn');
const content = document.getElementById('content');

// Add event listener to the button
fadeButton.addEventListener('click', function() {
    // Apply fade-out effect
    content.classList.remove('fade-in');
    content.classList.add('fade-out');

    // After the fade-out effect is complete, start the fade-in effect
    setTimeout(function() {
        content.classList.remove('fade-out');
        content.classList.add('fade-in');
    }, 500); // Match this with the duration of the fade-out
}

const axios = require('axios');

exports.handler = async function(event, context) {
    const API_KEY = process.env.WEATHER_API_KEY; // Ensure your API key is stored in environment variables
    const { city } = event.queryStringParameters;

    try {
        const response = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`);
        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch weather data' }),
        };
    }
};

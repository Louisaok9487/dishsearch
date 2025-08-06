// netlify/functions/pexels-proxy.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Access the API key from Netlify Environment Variables
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

    // Get query parameters from the client-side request
    const { query } = event.queryStringParameters;

    if (!query) {
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Missing 'query' parameter for Pexels search." })
        };
    }

    // Ensure API key is present before making the request
    if (!PEXELS_API_KEY) {
        console.error("PEXELS_API_KEY is not set in Netlify environment variables.");
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Server configuration error: Pexels API key missing." })
        };
    }

    const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': PEXELS_API_KEY // Pexels API requires Authorization header
            }
        });
        const data = await response.json();

        // Pass through the status code from the external API
        return {
            statusCode: response.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // Allow CORS from your frontend
            },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Error in Pexels proxy function:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Failed to fetch data from Pexels API." })
        };
    }
};

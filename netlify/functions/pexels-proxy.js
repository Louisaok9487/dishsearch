// netlify/functions/pexels-proxy.js
const fetch = require('node-fetch'); // You might need to install 'node-fetch'

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

    const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': PEXELS_API_KEY
            }
        });
        const data = await response.json();

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

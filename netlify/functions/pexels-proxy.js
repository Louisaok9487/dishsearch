// netlify/functions/pexels-proxy.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
    const { query } = event.queryStringParameters; // Still just 'query' for Pexels

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
                "Access-Control-Allow-Origin": "*",
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

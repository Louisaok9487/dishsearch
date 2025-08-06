// netlify/functions/spoonacular-proxy.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Access the API key from Netlify Environment Variables
    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

    // Extract relevant parameters from the client-side request
    const { queryStringParameters } = event;
    const action = queryStringParameters.action; // This 'action' parameter is crucial

    let apiUrl = '';
    let method = 'GET';

    // Use a switch statement to handle different actions from the frontend
    switch (action) {
        case 'get-recipe-details':
            const recipeId = queryStringParameters.recipeId;
            const includeNutrition = queryStringParameters.includeNutrition === 'true'; // Convert string to boolean
            apiUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=${includeNutrition}&apiKey=${SPOONACULAR_API_KEY}`;
            break;
        case 'search-recipes':
            const query = queryStringParameters.query;
            const number = queryStringParameters.number || '5'; // Default to 5 results if not provided
            apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=${number}&apiKey=${SPOONACULAR_API_KEY}`;
            break;
        case 'random-recipe':
            apiUrl = `https://api.spoonacular.com/recipes/random?number=1&apiKey=${SPOONACULAR_API_KEY}`;
            break;
        case 'ingredient-substitutes':
            const ingredientId = queryStringParameters.ingredientId;
            apiUrl = `https://api.spoonacular.com/food/ingredients/${ingredientId}/substitutes?apiKey=${SPOONACULAR_API_KEY}`;
            break;
        default:
            // If no valid action is provided, return a 400 error
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Invalid 'action' parameter provided." })
            };
    }

    // Ensure API key is present before making the request
    if (!SPOONACULAR_API_KEY) {
        console.error("SPOONACULAR_API_KEY is not set in Netlify environment variables.");
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Server configuration error: Spoonacular API key missing." })
        };
    }

    try {
        const response = await fetch(apiUrl, { method });
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
        console.error("Error in Spoonacular proxy function:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Failed to fetch data from Spoonacular API." })
        };
    }
};

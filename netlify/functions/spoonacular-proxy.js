// netlify/functions/spoonacular-proxy.js
const fetch = require('node-fetch'); // You might need to install 'node-fetch' if not available in Node.js version

exports.handler = async function(event, context) {
    // Access the API key from Netlify Environment Variables
    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

    // Extract relevant parameters from the client-side request
    const { path, queryStringParameters } = event;

    let apiUrl = '';
    let method = 'GET'; // Most Spoonacular calls are GET

    // Determine which Spoonacular endpoint to call based on the Netlify Function path or query params
    if (path.includes('get-recipe-details')) {
        const recipeId = queryStringParameters.recipeId;
        const includeNutrition = queryStringParameters.includeNutrition === 'true';
        apiUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=${includeNutrition}&apiKey=${SPOONACULAR_API_KEY}`;
    } else if (path.includes('search-recipes')) {
        const query = queryStringParameters.query;
        const number = queryStringParameters.number || '5'; // Default to 5 results
        apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=${number}&apiKey=${SPOONACULAR_API_KEY}`;
    } else if (path.includes('random-recipe')) {
        apiUrl = `https://api.spoonacular.com/recipes/random?number=1&apiKey=${SPOONACULAR_API_KEY}`;
    } else if (path.includes('ingredient-substitutes')) {
        const ingredientId = queryStringParameters.ingredientId;
        apiUrl = `https://api.spoonacular.com/food/ingredients/${ingredientId}/substitutes?apiKey=${SPOONACULAR_API_KEY}`;
    } else {
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Invalid Spoonacular API endpoint requested." })
        };
    }

    try {
        const response = await fetch(apiUrl, { method });
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
        console.error("Error in Spoonacular proxy function:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Failed to fetch data from Spoonacular API." })
        };
    }
};

// netlify/functions/spoonacular-proxy.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
    const { queryStringParameters } = event;
    const action = queryStringParameters.action; // Get the 'action' parameter

    let apiUrl = '';
    let method = 'GET';

    switch (action) {
        case 'get-recipe-details':
            const recipeId = queryStringParameters.recipeId;
            const includeNutrition = queryStringParameters.includeNutrition === 'true';
            apiUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=${includeNutrition}&apiKey=${SPOONACULAR_API_KEY}`;
            break;
        case 'search-recipes':
            const query = queryStringParameters.query;
            const number = queryStringParameters.number || '5';
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
            return {
                statusCode: 400,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Invalid 'action' parameter provided." })
            };
    }

    try {
        const response = await fetch(apiUrl, { method });
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
        console.error("Error in Spoonacular proxy function:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Failed to fetch data from Spoonacular API." })
        };
    }
};

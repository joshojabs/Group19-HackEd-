from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

API_KEY = os.getenv("SPOONACULAR_API_KEY")

if not API_KEY:
    raise ValueError("SPOONACULAR_API_KEY not found in .env file")

BASE_URL = "https://api.spoonacular.com/recipes"


@app.route("/")
def home():
    return "Flask is running! Use /spoon/<query>?type=breakfast&number=5 to search recipes."


# 🔍 Search recipes (with nutrition included)
@app.route("/spoon/<string:query>", methods=["GET"])
def get_spoon(query):
    meal_type = request.args.get("type")
    number = int(request.args.get("number", 5))

    url = f"{BASE_URL}/complexSearch"

    params = {
        "query": query,
        "number": number,
        "addRecipeNutrition": "true",  # Important: avoids multiple API calls
        "apiKey": API_KEY
    }

    if meal_type:
        params["type"] = meal_type

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return jsonify(response.json())

    except requests.exceptions.RequestException as e:
        return jsonify({
            "error": "Failed to fetch recipes",
            "details": str(e)
        }), 500


# 📊 Get full recipe information by ID
@app.route("/recipe/<int:recipe_id>", methods=["GET"])
def get_recipe_info(recipe_id):
    url = f"{BASE_URL}/{recipe_id}/information"

    params = {
        "includeNutrition": "true",
        "apiKey": API_KEY
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return jsonify(response.json())

    except requests.exceptions.RequestException as e:
        return jsonify({
            "error": "Failed to fetch recipe information",
            "details": str(e)
        }), 500


# 🍳 Search recipes by name (clean + optimized)
@app.route("/byname/<string:query>", methods=["GET"])
def recipe_by_name(query):
    url = f"{BASE_URL}/complexSearch"

    params = {
        "query": query,
        "number": 5,
        "addRecipeNutrition": "true",
        "apiKey": API_KEY
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()

        data = response.json()

        if not data.get("results"):
            return jsonify({"error": "No recipe found for that name"}), 404

        return jsonify(data["results"])

    except requests.exceptions.RequestException as e:
        return jsonify({
            "error": "Search failed",
            "details": str(e)
        }), 500


if __name__ == "__main__":
    print("Flask app starting...")
    app.run(debug=True)

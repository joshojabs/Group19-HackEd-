from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import dotenv
import os

app = Flask(__name__)
CORS(app)

load_dotenv()
app.config["Secret_Key"] = os.getenv("Secret_Key")


@app.route("/")
def home():
    return "Flask is running! Use /spoon/<query>?type=breakfast&number=5 to search recipes."


@app.route("/spoon/<string:query>", methods=["GET"])
def get_spoon(query):
    meal_type = request.args.get("type")
    number = int(request.args.get("number", 5))

    url = "https://api.spoonacular.com/recipes/complexSearch"
    params = {
        "query": query,
        "number": number,
        "apiKey": API_KEY
    }

    if meal_type:
        params["type"] = meal_type

    response = requests.get(url, params=params)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({
            "error": "Request failed",
            "details": response.text
        }), response.status_code


@app.route("/recipe/<int:recipe_id>", methods=["GET"])
def get_recipe_info(recipe_id):
    url = f"https://api.spoonacular.com/recipes/{recipe_id}/information"
    params = {
        "includeNutrition": "true",
        "apiKey": API_KEY
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({
            "error": "Request failed",
            "details": response.text
        }), response.status_code


@app.route("/byname/<string:query>", methods=["GET"])
def recipe_by_name(query):
    search_url = "https://api.spoonacular.com/recipes/complexSearch"
    search_params = {
        "query": query,
        "number": 5,
        "apiKey": API_KEY
    }

    response = requests.get(search_url, params=search_params)

    if response.status_code != 200:
        return jsonify({"error": "Search failed"}), response.status_code

    search_data = response.json()

    if not search_data.get("results"):
        return jsonify({"error": "No recipe found for that name"}), 404

    recipes_full_info = []

    for recipe in search_data["results"]:
        recipe_id = recipe["id"]

        info_url = f"https://api.spoonacular.com/recipes/{recipe_id}/information"
        info_params = {
            "includeNutrition": "true",
            "apiKey": API_KEY
        }

        info_response = requests.get(info_url, params=info_params)

        if info_response.status_code == 200:
            recipes_full_info.append(info_response.json())
        else:
            print(f"Failed to fetch info for recipe ID {recipe_id}")

    return jsonify(recipes_full_info)


if __name__ == "__main__":
    print("Flask app starting...")
    app.run(debug=True)

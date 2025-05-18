import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import requests
import json

app = Flask(__name__)
CORS(app)

OLLAMA_API_URL = "http://192.168.0.109:11434/api/generate"

@app.route('/')
def index():
    return "APP IS RUNNING"

@app.route('/start', methods=['POST'])
def start_game():
    data = request.get_json()
    difficulty = data.get("difficulty", "easy")
    category = data.get("category", "")

    # Prompt to generate word and description
    start_prompt = f"""
You are a professional word game master. Your task is to set up a guessing challenge based on the difficulty level: {difficulty.upper()} and also based on the chosen category: {category}.

First, select one English noun according to this difficulty {difficulty.upper()} in the selected '{category}':
- Easy: A very common, everyday object or concept.
- Medium: A less common, slightly abstract, or specialized noun.
- Hard: A rare, complex, or abstract noun.
- choose the word based on the category: For example, if the category is "animals", choose a word related to animals. If the category is "Cities", choose a city name. If the category is "Food", choose a food item.
Do not explain your choice. Simply remember the word internally. 

Next, describe the word without saying the word itself::
- Start with this sentence: "I have a word in my mind. Let me explain it to you!"
-You are not allowed to use the word itself, parts of the word, or obvious synonyms.
- Write a short, clear description without using the word itself, parts of the word, or obvious synonyms.
- Focus on what the word is, what it does, or where you find it.
- No emotions,roleplay, questions, or direct hints. With a little bit of fun. 
- Minimum 2 sentences, Maximum 3 to 4 sentences. Around 50 words.

Finally, output your result exactly in this JSON format:
{{"word": "[the word]", "description": "[the description]"}}
"""

    response = requests.post(OLLAMA_API_URL, json={
        "model": "llama2",
        "prompt": start_prompt,
        "stream": False
    })

    raw_response = response.json().get("response", "")

    # Try to parse the LLM response safely
    try:
        # Clean possible unwanted text
        raw_response = raw_response.strip()
        if not raw_response.startswith('{'):
            raw_response = raw_response[raw_response.find('{'):]
        game_data = json.loads(raw_response)
        word = game_data.get("word", "").strip().lower()
        description = game_data.get("description", "").strip()
    except Exception as e:
        word = ""
        description = "Sorry, something went wrong when generating the word."

    return jsonify({"description": description, "answer": word})

@app.route('/guess', methods=['POST'])
def ask_llama_to_guess():
    data = request.get_json()
    user_description = data.get("description", "")

    guess_prompt = f"""
You are a highly intelligent language model playing a guessing game. Based on the following description, guess the English noun that fits best.

Description: {user_description}

Respond with only one word. Do not explain your reasoning. Do not add extra words or phrases.
"""

    response = requests.post(OLLAMA_API_URL, json={
    "model": "llama2",
    "prompt": guess_prompt,
    "stream": False,
    "temperature": 0.8,  # ToDo: this is added but I'm not sure if it works
    "top_p": 0.9 # ToDo: this is added but I'm not sure if it works
})

    guess = response.json().get("response", "").strip()

    return jsonify({"guess": guess})

@app.route('/hint', methods=['POST'])
def get_hint():
    data = request.get_json()
    word = data.get("word", "")

    hint_prompt = f"""
You are a professional word game master. Provide a subtle, short hint for the word '{word}' without using the word itself, parts of the word, or direct synonyms.
The hint should be slightly cryptic but still understandable. Maximum one short sentence.
"""

    response = requests.post(OLLAMA_API_URL, json={
    "model": "llama2",
    "prompt": hint_prompt,
    "stream": False,
    #"temperature": 0.8,  # ToDo: this is added but I'm not sure if it works
    #"top_p": 0.9 # ToDo: this is added but I'm not sure if it works
})

    hint = response.json().get("response", "").strip()

    return jsonify({"hint": hint})

db_password = os.getenv("DB_PASSWORD")
base_uri = "mongodb+srv://llm-game-db-user:{}@cluster0.mvqxy54.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
full_uri = base_uri.format(db_password)

client = MongoClient(full_uri, tlsAllowInvalidCertificates=True)
db = client["word_game"]
logs_collection = db["logs"]

@app.route("/api/log", methods=["POST"])
def log_event():
    log_entry = request.get_json()
    logs_collection.insert_one(log_entry)
    return {"status": "success"}, 201


if __name__ == '__main__':
    app.run(debug=True, port=5001)
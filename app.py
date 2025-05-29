import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import requests
import json
import random

app = Flask(__name__)
CORS(app)

OLLAMA_API_URL = "http://192.168.0.109:11434/api/generate"
with open('all_words.json', 'r') as f:
    word_data = json.load(f)
@app.route('/')
def index():
    return "APP IS RUNNING"

@app.route('/start', methods=['POST'])
def start_game():
    data = request.get_json()
    difficulty = data.get("difficulty", "easy")
    category = data.get("category", "animal")
    words = [
        item["word"] for item in word_data
        if item["difficulty"].lower() == difficulty.lower() and item["category"].lower() == category.lower()
    ]

    if not words:
        return jsonify({"error": "No words found for this combination"}), 400

    selected_word = random.choice(words)

    # Prompt to generate word and description
    start_prompt = f"""
You are a professional word game master. Your task is to describe a secret word so that a human can guess it—but without using the word itself, parts of the word, or direct synonyms.

The word is: {selected_word}
Its category is: {category}

Write a short and clear description that matches the following rules:
- Start with: "I have a word in my mind. Let me explain it to you!"
- Use very simple vocabulary (English B1 level).
- Write 3 to 4 sentences. Around 50 words.
- Do not use the secret word, any part of it, or its direct synonyms.
- Do not ask questions or use sound effects.
- Be informative but also slightly playful.

Here are some examples:

### Example 1 (word: elephant, category: animal, difficulty: medium)
I have a word in my mind. Let me explain it to you!  
This is a very large animal that lives in warm places. It has big ears and a long nose that it uses to grab things or spray water. You can often see it in zoos or in nature documentaries.

### Example 2 (word: volcano, category: nature, difficulty: hard)
I have a word in my mind. Let me explain it to you!  
This is something found on mountains that sometimes becomes very dangerous. It can throw out hot liquid rock and smoke. People often stay away when it becomes active.

### Example 3 (word: scissors, category: object, difficulty: easy)
I have a word in my mind. Let me explain it to you!  
It’s a small tool used at school or home. It has two sharp parts that you move with your fingers to cut paper or fabric. You should always use it carefully.

Now, write a new description for the word: {selected_word}.
"""

    response = requests.post(OLLAMA_API_URL, json={
        "model": "gemma3:1b",
        "prompt": start_prompt,
        "stream": False
    })

    raw_response = response.json().get("response", "")

    description = raw_response.strip()
        
    return jsonify({"description": description, "answer": selected_word})

@app.route('/guess', methods=['POST'])
def ask_llama_to_guess():
    data = request.get_json()
    user_description = data.get("description", "")
    
    guess_prompt = f"""
You are a highly intelligent language model playing a guessing game. Based on the following description, guess the English noun that fits best.

Description: {user_description}. Read the description carefully and think about the context, objects, or concepts it describes.

Respond with only one word. Do not explain your reasoning. Do not add extra words or phrases.
"""

    response = requests.post(OLLAMA_API_URL, json={
    "model": "gemma3:1b",
    "prompt": guess_prompt,
    "stream": False,
    "temperature": 0.8,  # ToDo: this is added but I'm not sure if it works
    "top_p": 0.9 # ToDo: this is added but I'm not sure if it works
})

    guess = response.json().get("response", "").strip()

    return jsonify({"guess": guess})

@app.route('/get-word', methods=['POST'])
def user_start_game():
    data = request.get_json()
    difficulty = data.get("difficulty", "easy") 
    category = data.get("category", "")
    #words_list = word_data.get("words", [])
    # Filter words matching difficulty and category
    words = [
        item["word"] for item in word_data
        if item["difficulty"].lower() == difficulty.lower() and item["category"].lower() == category.lower()
    ]

    if not words:
        return jsonify({"error": "No words found for this combination"}), 400

    selected_word = random.choice(words)

    return jsonify({"word": selected_word})

@app.route('/hint', methods=['POST'])
def get_hint():
    data = request.get_json()
    word = data.get("word", "")

    hint_prompt = f"""
You are a word game master. Your task is to give a short and subtle hint for the word '{word}'.

Rules:
- Do not use the word itself, any part of it, or obvious synonyms.
-Use very simple vocabulary (English B1 level).
- write somehow guessable give examples like: the word begins with.. or ends with...
- Only one to two short sentences. No questions, no lists, no sound effects.
- Use function, context,example or related ideas to inspire curiosity.
"""

    response = requests.post(OLLAMA_API_URL, json={
    "model": "gemma3:1b",
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
    app.run(host="0.0.0.0",debug=True, port=5001)
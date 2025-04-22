from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
import random

app = Flask(__name__)
CORS(app)

OLLAMA_API_URL = "http://192.168.0.109:11434/api/generate"

#WORDS = ["cat", "bicycle", "sun", "apple", "river", "book", "airplane", "tree", "camera", "piano"]

@app.route('/start', methods=['POST'])
def start_game():
    data = request.get_json()
    difficulty = data.get("difficulty", "easy")

    # Step 1: Ask the AI to choose a word based on difficulty
    word_prompt = f"Think of one English noun that is considered {difficulty}. It should be a common word, suitable for a word guessing game. Respond with only the word, nothing else."

    word_response = requests.post(OLLAMA_API_URL, json={
        "model": "llama2",
        "prompt": word_prompt,
        "stream": False
    })

    word = word_response.json().get("response", "").strip().lower()

    # Step 2: Ask the AI to describe that word
    description_prompt = f"""Start the response with this exact sentence: 'I have a word in my mind. Let me explain it to you!'

Now describe the word '{word}' in plain and simple English. You are NOT allowed to use the word itself, any part of the word, or any related words that contain the same root or structure, like a riddle. Do NOT use emojis, sound effects (like *giggles* or *squees*), roleplay, jokes, or questions. Do not add personal comments or emotion. Your description must be clear, neutral, and informative.

Only return one short paragraph that helps someone guess the word based on meaning, not language tricks. Follow these instructions exactly."""

    description_response = requests.post(OLLAMA_API_URL, json={
        "model": "llama2",
        "prompt": description_prompt,
        "stream": False
    })

    description = description_response.json().get("response", "")

    return jsonify({"description": description, "answer": word})

@app.route('/')
def index():
    return "APP IS RUNNING"

@app.route('/guess', methods=['POST'])
def ask_llama():
    data = request.get_json()
    description = data.get("description", "")
    prompt = f"Guess the word based on this description: '{description}'. Just respond with one word."

    response = requests.post(OLLAMA_API_URL, json={
        "model": "llama2",
        "prompt": prompt,
        "stream": False
    })

    full_response = response.json()
    return jsonify({"guess": full_response.get("response", "")})

@app.route('/hint', methods=['POST'])
def get_hint():
    data = request.get_json()
    word = data.get("word", "")

    prompt = f"Give a subtle hint for the word '{word}' without using the word itself. Keep it short and a bit cryptic, like a riddle."

    response = requests.post(OLLAMA_API_URL, json={
        "model": "llama2",
        "prompt": prompt,
        "stream": False
    })

    hint = response.json().get("response", "")
    return jsonify({"hint": hint})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
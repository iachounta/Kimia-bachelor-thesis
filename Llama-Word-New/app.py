from flask import Flask, request, jsonify
from flask_cors import CORS
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

    # Prompt to generate word and description
    start_prompt = f"""
You are a professional word game master. Your task is to set up a guessing challenge based on the difficulty level: {difficulty.upper()}.

First, select one English noun according to this difficulty:
- Easy: A very common, everyday object or concept (e.g., "cat", "book", "tree").
- Medium: A less common, slightly abstract, or specialized noun (e.g., "compass", "harbor", "thunder").
- Hard: A rare, complex, or abstract noun (e.g., "astronaut", "mirage", "paradox").

Choose a word fitting the difficulty: {difficulty.upper()}.

Do not explain your choice. Simply remember the word internally.

Next, describe the word:
- Start with this sentence: "I have a word in my mind. Let me explain it to you!"
- Write a short, clear description without using the word itself, parts of the word, or obvious synonyms.
- Focus on what the word is, what it does, or where you find it.
- No emotions,roleplay, questions, or direct hints. With a little bit of fun. 
- Maximum 3 to 4 sentences. Around 50 words.

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
        "stream": False
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
        "stream": False
    })

    hint = response.json().get("response", "").strip()

    return jsonify({"hint": hint})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
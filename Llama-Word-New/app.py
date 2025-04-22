from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
import random

app = Flask(__name__)
CORS(app)

OLLAMA_API_URL = "http://192.168.0.109:11434/api/generate"

WORDS = ["cat", "bicycle", "sun", "apple", "river", "book", "airplane", "tree", "camera", "piano"]

@app.route('/start', methods=['GET'])
def start_game():
    word = random.choice(WORDS)

    prompt = f"Describe the word '{word}' without saying the word itself. Be clear but not too obvious. Just return the description. Write simple english"
    
    response = requests.post(OLLAMA_API_URL, json={
        "model": "llama2",
        "prompt": prompt,
        "stream": False
    })

    description = response.json().get("response", "")

    return jsonify({"description": description, "answer": word})

@app.route('/')
def index():
    return render_template('index.html')

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
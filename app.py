import os
import requests
import json
import random
import logging
import ollama
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv
os.environ['OLLAMA_HOST'] = 'http://ollama:11434'
logger.info("Starting application")

#from azure.ai.inference import ChatCompletionsClient
#from azure.ai.inference.models import SystemMessage, UserMessage
#from azure.core.credentials import AzureKeyCredential
load_dotenv()

#endpoint = os.getenv("AZURE_INFERENCE_SDK_ENDPOINT", "https://ai-kimiabeheshti974756ai333821514357.services.ai.azure.com/models")
#model_name = os.getenv("DEPLOYMENT_NAME", "Llama-4-Maverick-17B-128E-Instruct-FP8")
#key = os.getenv("AZURE_INFERENCE_SDK_KEY", "")
#client = ChatCompletionsClient(endpoint=endpoint, credential=AzureKeyCredential(key))

#client = ChatCompletionsClient(
   # endpoint=endpoint,
  #  credential=AzureKeyCredential(key),
   
#)


def llm_complete(prompt: str, *, temperature: float = 0.7,
                 top_p: float = 0.9, max_tokens: int = 256) -> str:
    """
    Simple helper to call a locally running Ollama model.
    """
    logger.info(f"Calling LLM with prompt: {prompt[:50]}... (truncated for logging)")
    response = ollama.chat(
        model='llama4:maverick',
        messages=[
            {"role": "system", "content": "You are a helpful, playful word-game master."},
            {"role": "user", "content": prompt}
        ],
        options={
            "temperature": temperature,
            "top_p": top_p,
            "num_predict": max_tokens
        }
    )

    return response['message']['content'].strip()



app = Flask(__name__)
CORS(app)


with open("all_words.json", "r", encoding="utf-8") as fh:
    WORD_DATA = json.load(fh)


@app.get("/")
def index():
    return "APP IS RUNNING"


@app.post("/start")
def start_game():
    data = request.get_json(force=True)
    difficulty = data.get("difficulty", "easy")
    category = data.get("category", "animal")

    
    candidates = [
        item["word"]
        for item in WORD_DATA
        if item["difficulty"].lower() == difficulty.lower()
        and item["category"].lower() == category.lower()
    ]
    if not candidates:
        return jsonify({"error": "No words found for this combination"}), 400

    secret_word = random.choice(candidates)

    
    prompt = f"""
You are a professional word game master. Your task is to describe a secret word so that a human can guess it—but without using the word itself, parts of the word, or direct synonyms.

The word is: {secret_word}
Its category is: {category}

Write a short and clear description that matches the following rules:
- Start with: "I have a word in my mind. Let me explain it to you!"
- Use very simple vocabulary (English B1 level).
- Write 3 to 4 sentences. Around 50 words.
- Do not use the secret word, any part of it, or its direct synonyms.
- Do not ask questions or use sound effects.
- Be informative but also slightly playful.

Now, write a new description for the word: {secret_word}.
""".strip()

    description = llm_complete(prompt, temperature=0.7, max_tokens=120)

    return jsonify({"description": description, "answer": secret_word})


@app.post("/guess")
def ask_llm_to_guess():
    data = request.get_json(force=True)
    user_description = data.get("description", "")

    prompt = f"""
You are a highly intelligent language model playing a guessing game.
Based on the following description, guess the *one* English noun that fits best.

Description: {user_description}

Respond with **only** that single word—no explanations, no extra text.
""".strip()

    guess = llm_complete(prompt, temperature=0.1, top_p=0.9, max_tokens=3)
    return jsonify({"guess": guess})


@app.post("/get-word")
def user_start_game():
    data = request.get_json(force=True)
    difficulty = data.get("difficulty", "easy")
    category = data.get("category", "")

    candidates = [
        item["word"]
        for item in WORD_DATA
        if item["difficulty"].lower() == difficulty.lower()
        and item["category"].lower() == category.lower()
    ]
    if not candidates:
        return jsonify({"error": "No words found for this combination"}), 400

    return jsonify({"word": random.choice(candidates)})


@app.post("/hint")
def get_hint():
    data = request.get_json(force=True)
    word = data.get("word", "")

    prompt = f"""
You are a word game master. Give a short, subtle hint to help someone guess the word '{word}'.

Rules:
- Do NOT use the word itself, any part of it, or obvious synonyms.
- Use very simple vocabulary (English B1 level).
- Only 1-2 short sentences – no questions, no lists, no sound effects.
- You may reveal that it begins or ends with a certain letter, or mention its function/context creatively.
""".strip()

    hint = llm_complete(prompt, temperature=0.6, max_tokens=40)
    return jsonify({"hint": hint})


DB_PASSWORD = os.getenv("DB_PASSWORD")
MONGO_URI = (
    f"mongodb+srv://llm-game-db-user:{DB_PASSWORD}"
    "@cluster0.mvqxy54.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)

mongo_client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True)
logs_collection = mongo_client["word_game"]["logs2"]


@app.post("/api/log")
def log_event():
    logs_collection.insert_one(request.get_json(force=True))
    return {"status": "success"}, 201


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
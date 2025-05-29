import os
import json
import random

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv

# ------------ Azure AI Inference set-up ------------------------------------
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
load_dotenv()

endpoint = os.getenv("AZURE_INFERENCE_SDK_ENDPOINT", "https://ai-kimiabeheshti974756ai333821514357.services.ai.azure.com/models")
model_name = os.getenv("DEPLOYMENT_NAME", "Llama-4-Maverick-17B-128E-Instruct-FP8")
key = os.getenv("AZURE_INFERENCE_SDK_KEY", "")
client = ChatCompletionsClient(endpoint=endpoint, credential=AzureKeyCredential(key))

client = ChatCompletionsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(key),
    #credential_scopes=["https://cognitiveservices.azure.com/.default"],
)

# Helper that wraps one call to the model -----------------------------------
def llm_complete(prompt: str, *, temperature: float = 0.7,
                 top_p: float = 0.9, max_tokens: int = 256) -> str:
    """
    Simple helper around ChatCompletionsClient.complete().
    Returns the assistant's text with leading/trailing whitespace removed.
    """
    response = client.complete(
        messages=[
            SystemMessage(content="You are a helpful, playful word-game master."),
            UserMessage(content=prompt)
        ],
        model=model_name,
        temperature=temperature,
        top_p=top_p,
        max_tokens=max_tokens,
    )
    # `response.choices[0].message.content` is the model’s reply :contentReference[oaicite:0]{index=0}
    return response.choices[0].message.content.strip()


# ------------ Flask & game logic -------------------------------------------
app = Flask(__name__)
CORS(app)

# Load the curated word list once at start-up
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

    # Pick a word matching difficulty & category
    candidates = [
        item["word"]
        for item in WORD_DATA
        if item["difficulty"].lower() == difficulty.lower()
        and item["category"].lower() == category.lower()
    ]
    if not candidates:
        return jsonify({"error": "No words found for this combination"}), 400

    secret_word = random.choice(candidates)

    # Build the prompt
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


# ------------ MongoDB logging endpoint -------------------------------------
DB_PASSWORD = os.getenv("DB_PASSWORD")
MONGO_URI = (
    f"mongodb+srv://llm-game-db-user:{DB_PASSWORD}"
    "@cluster0.mvqxy54.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)

mongo_client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True)
logs_collection = mongo_client["word_game"]["logs"]


@app.post("/api/log")
def log_event():
    logs_collection.insert_one(request.get_json(force=True))
    return {"status": "success"}, 201


# ------------ Run the Flask app --------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
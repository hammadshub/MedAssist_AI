from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json

from services.nlp_engine import extract_symptoms
from services.ml_engine import predict_diseases, get_best_next_symptom
from services.safety_engine import evaluate_red_flags
from services.recommendation import get_recommendations
from models.db import execute_query

chat_bp = Blueprint("chat", __name__, url_prefix="/api")

MAX_QUESTIONS = 7

@chat_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat_predict():
    data = request.get_json()
    message = data.get("message", "").strip()
    initial_message = data.get("initial_message", "").strip()
    known_symptoms = data.get("known_symptoms", [])
    absent_symptoms = data.get("absent_symptoms", [])
    unrecognized = []
    if message:
        nlp_result = extract_symptoms(message)
        matched = nlp_result["matched"]
        unrecognized = nlp_result.get("unrecognized", [])
        for sym in matched:
            if sym not in known_symptoms:
                known_symptoms.append(sym)
                
    if not known_symptoms:
        return jsonify({
            "status": "in_progress",
            "question": "Could you please describe your symptoms first?",
            "known_symptoms": [],
            "absent_symptoms": [],
            "unrecognized": unrecognized
        }), 200
    ml_result = predict_diseases(known_symptoms)
    top_confidence = ml_result["predictions"][0]["confidence"] if ml_result["predictions"] else 0
    total_questions = len(known_symptoms) + len(absent_symptoms)
    if top_confidence >= 95.0 or total_questions >= MAX_QUESTIONS:
        safety_result = evaluate_red_flags(known_symptoms)
        risk_level = safety_result.get("risk_level", ml_result.get("risk_level", "LOW"))
        
        top_disease_name = ml_result["predictions"][0]["disease"] if ml_result["predictions"] else None
        recommendations = get_recommendations(top_disease_name) if top_disease_name else {}
        
        final_input_text = initial_message if initial_message else (message or "Chatbot Interaction")
        user_id = int(get_jwt_identity())
        execute_query(
            """INSERT INTO predictions
               (user_id, raw_input, extracted_kw, top_diseases, risk_level, red_flags)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (
                user_id,
                final_input_text,
                json.dumps(known_symptoms),
                json.dumps(ml_result["predictions"]),
                risk_level,
                json.dumps(safety_result.get("triggered_rules", []))
            ),
            commit=True
        )
        
        return jsonify({
            "status": "completed",
            "predictions": ml_result["predictions"],
            "risk_level": risk_level,
            "red_flags": safety_result.get("triggered_rules", []),
            "emergency_message": safety_result.get("emergency_message"),
            "recommendations": recommendations,
            "extracted_symptoms": known_symptoms,
            "raw_input": final_input_text,
            "disclaimer": "This is an AI-generated preliminary assessment and NOT a medical diagnosis."
        }), 200
    next_symptom = get_best_next_symptom(known_symptoms, absent_symptoms)
    if not next_symptom:
        # Fallback if no symptoms left
        return jsonify({
            "status": "completed",
            "predictions": ml_result["predictions"],
            "risk_level": ml_result.get("risk_level", "LOW"),
            "recommendations": {},
            "extracted_symptoms": known_symptoms
        }), 200
        
    formatted_symptom = next_symptom.replace("_", " ")
    question = f"Are you also experiencing {formatted_symptom}?"
    
    return jsonify({
        "status": "in_progress",
        "question": question,
        "next_symptom": next_symptom,
        "known_symptoms": known_symptoms,
        "absent_symptoms": absent_symptoms,
        "unrecognized": unrecognized,
        "predictions": ml_result["predictions"]
    }), 200

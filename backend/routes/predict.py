from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from services.nlp_engine import extract_symptoms
from services.ml_engine import predict_diseases
from services.safety_engine import evaluate_red_flags
from services.recommendation import get_recommendations
from models.db import execute_query
import json

predict_bp = Blueprint("predict", __name__, url_prefix="/api")


@predict_bp.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    """
    Full prediction pipeline:
    1. Accept free-text symptoms
    2. NLP extraction
    3. ML prediction (top 3)
    4. Safety engine (red-flag check + risk level)
    5. Recommendations
    6. Store in DB & return results
    """
    data = request.get_json()
    raw_input = data.get("symptoms", "").strip()

    if not raw_input:
        return jsonify({"error": "Symptom text is required"}), 400

    # ── Step 1: NLP keyword extraction ──────────────────
    nlp_result = extract_symptoms(raw_input)
    matched_symptoms = nlp_result["matched"]

    if not matched_symptoms:
        return jsonify({
            "error": "Could not identify any medical symptoms from your input. "
                     "Please try to describe your symptoms more clearly.",
            "unrecognized": nlp_result.get("unrecognized", []),
        }), 422

    # ── Step 2: ML prediction ───────────────────────────
    ml_result = predict_diseases(matched_symptoms)

    # ── Step 3: Safety engine ───────────────────────────
    safety_result = evaluate_red_flags(matched_symptoms)

    # Determine final risk level (safety engine can override ML)
    risk_level = safety_result.get("risk_level", ml_result.get("risk_level", "LOW"))

    # ── Step 4: Recommendations ─────────────────────────
    top_disease_name = ml_result["predictions"][0]["disease"] if ml_result["predictions"] else None
    recommendations = get_recommendations(top_disease_name) if top_disease_name else {}

    # ── Step 5: Store prediction ────────────────────────
    user_id = int(get_jwt_identity())
    execute_query(
        """INSERT INTO predictions
           (user_id, raw_input, extracted_kw, top_diseases, risk_level, red_flags)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (
            user_id,
            raw_input,
            json.dumps(matched_symptoms),
            json.dumps(ml_result["predictions"]),
            risk_level,
            json.dumps(safety_result.get("triggered_rules", [])),
        ),
        commit=True,
    )

    # ── Build response ──────────────────────────────────
    return jsonify({
        "raw_input": raw_input,
        "extracted_symptoms": matched_symptoms,
        "unrecognized": nlp_result.get("unrecognized", []),
        "predictions": ml_result["predictions"],
        "risk_level": risk_level,
        "red_flags": safety_result.get("triggered_rules", []),
        "emergency_message": safety_result.get("emergency_message"),
        "recommendations": recommendations,
        "disclaimer": (
            "This is an AI-generated preliminary assessment and NOT a medical diagnosis. "
            "Please consult a qualified healthcare professional for proper evaluation."
        ),
    }), 200

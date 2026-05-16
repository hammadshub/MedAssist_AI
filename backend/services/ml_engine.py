"""
ML Engine – Loads the trained Random Forest model and runs predictions.

Returns top-3 predicted diseases with confidence scores.
"""

import json
import os
import numpy as np
import joblib
import csv
from config import Config

_model = None
_symptom_columns = None
_descriptions = None


def _load_model():
    """Lazily load the trained model and symptom column order."""
    global _model, _symptom_columns, _descriptions

    if _model is None:
        if not os.path.exists(Config.MODEL_PATH):
            raise FileNotFoundError(
                f"Model file not found at {Config.MODEL_PATH}. "
                "Please train the model first by running ml/train_model.py."
            )
        _model = joblib.load(Config.MODEL_PATH)

    if _symptom_columns is None:
        if not os.path.exists(Config.SYMPTOM_COLUMNS_PATH):
            raise FileNotFoundError(
                f"Symptom columns file not found at {Config.SYMPTOM_COLUMNS_PATH}."
            )
        with open(Config.SYMPTOM_COLUMNS_PATH, "r") as f:
            _symptom_columns = json.load(f)

    if _descriptions is None:
        _descriptions = {}
        try:
            desc_path = os.path.join(os.path.dirname(Config.SYMPTOM_COLUMNS_PATH), "kaggle_data", "symptom_Description.csv")
            with open(desc_path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                next(reader) # skip header
                for row in reader:
                    if len(row) >= 2:
                        _descriptions[row[0].strip()] = row[1].strip()
        except Exception:
            pass

    return _model, _symptom_columns, _descriptions


def _load_disease_symptoms():
    """Load disease-symptom profiles from disease_symptoms.json for hybrid scoring."""
    try:
        ds_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "disease_symptoms.json")
        with open(ds_path, "r") as f:
            return json.load(f)
    except Exception:
        return {}


def predict_diseases(matched_symptoms: list[str]) -> dict:
    """
    Run the ML model on a list of canonical symptom keys.

    Args:
        matched_symptoms: e.g. ["abdominal_pain", "nausea", "bloating"]

    Returns:
        {
            "predictions": [
                {"disease": "Gastritis", "confidence": 0.72},
                {"disease": "Peptic Ulcer Disease", "confidence": 0.15},
                {"disease": "Food Poisoning", "confidence": 0.08},
            ],
            "risk_level": "LOW" | "MEDIUM"
        }
    """
    model, symptom_columns, descriptions = _load_model()

    # Build binary feature vector aligned to training column order
    feature_vector = [1 if col in matched_symptoms else 0 for col in symptom_columns]
    features = np.array([feature_vector])

    # Get probability distribution across all classes
    probabilities = model.predict_proba(features)[0]
    class_labels = model.classes_

    # Sort by probability descending, take top 3
    top_indices = np.argsort(probabilities)[::-1][:3]

    predictions = []
    for idx in top_indices:
        d_name = class_labels[idx]
        predictions.append({
            "disease": d_name,
            "confidence": round(float(probabilities[idx]) * 100, 1),
            "description": descriptions.get(d_name, "Clinical medical evaluation is recommended.")
        })

    # Assign base risk level (safety engine may override)
    top_confidence = predictions[0]["confidence"] if predictions else 0
    if top_confidence >= 60:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "predictions": predictions,
        "risk_level": risk_level,
    }




def get_best_next_symptom(known_symptoms: list[str], absent_symptoms: list[str]) -> str | None:
    
    model, symptom_columns, _ = _load_model()

    # Current best confidence (for any disease) with known symptoms
    base_probs = model.predict_proba(
        [np.array([1 if col in known_symptoms else 0 for col in symptom_columns])]
    )[0]
    base_max_conf = float(np.max(base_probs)) * 100.0

    # Filter candidate symptoms: only consider symptoms that belong
    # to diseases whose profiles share at least one symptom with the
    # user's known symptoms. This keeps questions contextually relevant.
    disease_profiles = _load_disease_symptoms()
    known_set = set(known_symptoms)

    relevant_symptoms = set()
    for disease_name, profile_symptoms in disease_profiles.items():
        profile_set = set(profile_symptoms)
        # Does this disease's profile contain ANY of the user's symptoms?
        if profile_set & known_set:
            # Yes — all of this disease's symptoms are fair game
            relevant_symptoms.update(profile_set)

    base_feature_vector = [1 if col in known_symptoms else 0 for col in symptom_columns]

    best_symptom = None
    best_increase = 0.0

    for i, sym in enumerate(symptom_columns):
        if sym in known_symptoms or sym in absent_symptoms:
            continue

        # Only consider symptoms from related disease profiles
        if relevant_symptoms and sym not in relevant_symptoms:
            continue

        # Simulate: "What if the user also has this symptom?"
        test_vector = list(base_feature_vector)
        test_vector[i] = 1

        probabilities = model.predict_proba([test_vector])[0]

        # Check the best confidence for ANY disease with this
        # symptom added — allows exploring alternative diagnoses
        test_max_conf = float(np.max(probabilities)) * 100.0
        increase = test_max_conf - base_max_conf

        if increase > best_increase:
            best_increase = increase
            best_symptom = sym

    if best_symptom:
        return best_symptom

    # ── Fallback: pick from related disease profiles directly ──
    for disease_name, profile_symptoms in disease_profiles.items():
        profile_set = set(profile_symptoms)
        if profile_set & known_set:
            for sym in profile_symptoms:
                if sym not in known_symptoms and sym not in absent_symptoms and sym in symptom_columns:
                    return sym

    # ── Final fallback: any unasked symptom
    for sym in symptom_columns:
        if sym not in known_symptoms and sym not in absent_symptoms:
            return sym

    return None



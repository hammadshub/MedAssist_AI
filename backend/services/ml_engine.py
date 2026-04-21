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
    """
    Simulates adding each unasked symptom to pinpoint which one
    increases the top predicted disease's confidence the most.
    """
    model, symptom_columns, _ = _load_model()
    base_res = predict_diseases(known_symptoms)
    if not base_res["predictions"]:
        return None
        
    top_disease = base_res["predictions"][0]["disease"]
    base_conf = base_res["predictions"][0]["confidence"]
    
    # Sometimes confidence might drop for the same disease if we pick irrelevant symptoms,
    # we just want to find max positive increase.
    best_symptom = None
    max_conf_increase = 0.0
    
    class_labels = list(model.classes_)
    if top_disease not in class_labels:
        return None
    top_disease_idx = class_labels.index(top_disease)
    
    # Prepare base boolean feature vector
    base_feature_vector = [1 if col in known_symptoms else 0 for col in symptom_columns]
    
    for i, sym in enumerate(symptom_columns):
        if sym in known_symptoms or sym in absent_symptoms:
            continue
            
        # Simulate having this symptom
        test_vector = list(base_feature_vector)
        test_vector[i] = 1
        
        # predict_proba returns array of arrays: [[p1, p2, p3...]]
        probabilities = model.predict_proba([test_vector])[0]
        test_conf = float(probabilities[top_disease_idx]) * 100.0
        
        increase = test_conf - base_conf
        if increase > max_conf_increase:
            max_conf_increase = increase
            best_symptom = sym
            
    # Fallback: if no single symptom robustly increases probability of the top disease,
    # just pick the first unasked symptom that belongs to the top disease's known profile
    # (Since we are using ML, sometimes adding just 1 symptom doesn't show huge impact due to tree structure)
    # If no increase is found, just pick any unasked symptom.
    if not best_symptom:
        for sym in symptom_columns:
            if sym not in known_symptoms and sym not in absent_symptoms:
                return sym
                
    return best_symptom

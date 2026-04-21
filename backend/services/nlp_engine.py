"""
NLP Engine – Extracts medical symptom keywords from free-text input.

Pipeline:
  1. Clean text (lowercase, strip punctuation / numbers)
  2. Tokenize & remove stop words
  3. Lemmatize
  4. Match tokens / bigrams / trigrams against a medical lexicon
  5. Return matched canonical symptom keys + unrecognized tokens
"""

import re

# ─── Medical Lexicon ──────────────────────────────────────
# Maps user-facing phrases → canonical symptom key used by the ML model.
# This lexicon is intentionally comprehensive to handle common
# ways patients describe their symptoms.

MEDICAL_LEXICON = {
    "stomach pain": "abdominal_pain",
    "belly pain": "abdominal_pain",
    "tummy pain": "abdominal_pain",
    "abdominal pain": "abdominal_pain",
    "stomach ache": "abdominal_pain",
    "belly ache": "abdominal_pain",
    "tummy ache": "abdominal_pain",
    "stomach cramp": "abdominal_pain",
    "abdominal cramp": "abdominal_pain",
    "pain in stomach": "abdominal_pain",
    "pain in abdomen": "abdominal_pain",
    "nausea": "nausea",
    "feeling nauseous": "nausea",
    "feel sick": "nausea",
    "queasy": "nausea",
    "vomiting": "vomiting",
    "throwing up": "vomiting",
    "vomit": "vomiting",
    "puking": "vomiting",
    "bloating": "swelling_of_stomach",
    "bloated": "swelling_of_stomach",
    "feel bloated": "swelling_of_stomach",
    "gas": "swelling_of_stomach",
    "flatulence": "swelling_of_stomach",
    "diarrhea": "diarrhoea",
    "loose stool": "diarrhoea",
    "loose motion": "diarrhoea",
    "watery stool": "diarrhoea",
    "runny stool": "diarrhoea",
    "frequent stool": "diarrhoea",
    "constipation": "constipation",
    "hard stool": "constipation",
    "difficulty passing stool": "constipation",
    "infrequent bowel movement": "constipation",
    "heartburn": "acidity",
    "acid reflux": "acidity",
    "burning chest": "acidity",
    "burning in chest": "acidity",
    "chest burning": "acidity",
    "regurgitation": "acidity",
    "loss of appetite": "loss_of_appetite",
    "no appetite": "loss_of_appetite",
    "not hungry": "loss_of_appetite",
    "poor appetite": "loss_of_appetite",
    "weight loss": "weight_loss",
    "losing weight": "weight_loss",
    "unintentional weight loss": "weight_loss",
    "blood in stool": "bloody_stool",
    "bloody stool": "bloody_stool",
    "rectal bleeding": "bloody_stool",
    "black stool": "bloody_stool",
    "tarry stool": "bloody_stool",
    "dark stool": "bloody_stool",
    "vomiting blood": "stomach_bleeding",
    "blood vomit": "stomach_bleeding",
    "rigid abdomen": "swelling_of_stomach",
    "abdominal rigidity": "swelling_of_stomach",
    "hard abdomen": "swelling_of_stomach",
    "dehydration": "dehydration",
    "severe dehydration": "dehydration",
    "dry mouth": "dehydration",
    "indigestion": "indigestion",
    "upset stomach": "indigestion",
    "difficulty swallowing": "patches_in_throat",
    "trouble swallowing": "patches_in_throat",
    "chest pain": "chest_pain",
    "chest tightness": "chest_pain",
    "tight chest": "chest_pain",
    "pressure in chest": "chest_pain",
    "sweating": "sweating",
    "cold sweat": "sweating",
    "excessive sweating": "sweating",
    "shortness of breath": "breathlessness",
    "breathlessness": "breathlessness",
    "difficulty breathing": "breathlessness",
    "hard to breathe": "breathlessness",
    "can't breathe": "breathlessness",
    "palpitation": "palpitations",
    "palpitations": "palpitations",
    "heart racing": "palpitations",
    "rapid heartbeat": "palpitations",
    "irregular heartbeat": "palpitations",
    "dizziness": "dizziness",
    "dizzy": "dizziness",
    "lightheaded": "dizziness",
    "light headed": "dizziness",
    "fainting": "loss_of_balance",
    "faint": "loss_of_balance",
    "passed out": "loss_of_balance",
    "loss of consciousness": "loss_of_balance",
    "unconsciousness": "loss_of_balance",
    "jaw pain": "neck_pain",
    "pain in jaw": "neck_pain",
    "pain radiating to jaw": "neck_pain",
    "cough": "cough",
    "dry cough": "cough",
    "persistent cough": "cough",
    "productive cough": "mucoid_sputum",
    "coughing mucus": "mucoid_sputum",
    "cough with phlegm": "mucoid_sputum",
    "fever": "high_fever",
    "high fever": "high_fever",
    "temperature": "high_fever",
    "chills": "chills",
    "body ache": "muscle_pain",
    "body pain": "muscle_pain",
    "muscle pain": "muscle_pain",
    "muscle ache": "muscle_pain",
    "sore throat": "throat_irritation",
    "throat pain": "throat_irritation",
    "runny nose": "runny_nose",
    "nasal congestion": "runny_nose",
    "stuffy nose": "runny_nose",
    "sneezing": "continuous_sneezing",
    "fatigue": "fatigue",
    "tired": "fatigue",
    "tiredness": "fatigue",
    "exhaustion": "fatigue",
    "weakness": "fatigue",
    "rapid breathing": "fast_heart_rate",
    "fast breathing": "fast_heart_rate",
    "bluish lips": "cold_hands_and_feets",
    "blue lips": "cold_hands_and_feets",
    "bluish fingertips": "cold_hands_and_feets",
    "blue fingertips": "cold_hands_and_feets",
    "frequent urination": "continuous_feel_of_urine",
    "urinating frequently": "continuous_feel_of_urine",
    "excessive thirst": "polyuria",
    "always thirsty": "polyuria",
    "increased thirst": "polyuria",
    "blurred vision": "blurred_and_distorted_vision",
    "blurry vision": "blurred_and_distorted_vision",
    "vision blurred": "blurred_and_distorted_vision",
    "slow healing": "pus_filled_pimples",
    "wounds not healing": "pus_filled_pimples",
    "numbness": "weakness_in_limbs",
    "tingling": "weakness_in_limbs",
    "pins and needles": "weakness_in_limbs",
    "increased hunger": "excessive_hunger",
    "always hungry": "excessive_hunger",
    "fruity breath": "acidity",
    "fruity smelling breath": "acidity",
    "confusion": "altered_sensorium",
    "confused": "altered_sensorium",
    "disoriented": "altered_sensorium",
    "headache": "headache",
    "head pain": "headache",
    "severe headache": "headache",
    "worst headache": "headache",
    "throbbing headache": "headache",
    "migraine": "headache",
    "sensitivity to light": "visual_disturbances",
    "light sensitivity": "visual_disturbances",
    "photophobia": "visual_disturbances",
    "sensitivity to sound": "visual_disturbances",
    "sound sensitivity": "visual_disturbances",
    "aura": "visual_disturbances",
    "visual aura": "visual_disturbances",
    "anxiety": "anxiety",
    "feeling anxious": "anxiety",
    "nervousness": "anxiety",
    "nervous": "anxiety",
    "worry": "anxiety",
    "excessive worry": "anxiety",
    "restlessness": "restlessness",
    "restless": "restlessness",
    "can't relax": "restlessness",
    "irritability": "irritability",
    "irritable": "irritability",
    "sleep problem": "restlessness",
    "insomnia": "restlessness",
    "trouble sleeping": "restlessness",
    "can't sleep": "restlessness",
    "difficulty concentrating": "lack_of_concentration",
    "can't concentrate": "lack_of_concentration",
    "poor concentration": "lack_of_concentration",
    "muscle tension": "muscle_weakness",
    "tense muscles": "muscle_weakness",
    "panic": "anxiety",
    "panic attack": "anxiety",
    "vision loss": "visual_disturbances",
    "abnormal menstruation": "abnormal_menstruation",
    "acidity": "acidity",
    "acute liver failure": "acute_liver_failure",
    "altered sensorium": "altered_sensorium",
    "back pain": "back_pain",
    "blackheads": "blackheads",
    "bladder discomfort": "bladder_discomfort",
    "blister": "blister",
    "blood in sputum": "blood_in_sputum",
    "blurred and distorted vision": "blurred_and_distorted_vision",
    "brittle nails": "brittle_nails",
    "bruising": "bruising",
    "burning micturition": "burning_micturition",
    "cold hands and feets": "cold_hands_and_feets",
    "coma": "coma",
    "congestion": "congestion",
    "continuous feel of urine": "continuous_feel_of_urine",
    "continuous sneezing": "continuous_sneezing",
    "cramps": "cramps",
    "dark urine": "dark_urine",
    "depression": "depression",
    "diarrhoea": "diarrhoea",
    "dischromic  patches": "dischromic__patches",
    "distention of abdomen": "distention_of_abdomen",
    "drying and tingling lips": "drying_and_tingling_lips",
    "enlarged thyroid": "enlarged_thyroid",
    "excessive hunger": "excessive_hunger",
    "extra marital contacts": "extra_marital_contacts",
    "family history": "family_history",
    "fast heart rate": "fast_heart_rate",
    "fluid overload": "fluid_overload",
    "foul smell of urine": "foul_smell_of_urine",
    "hip joint pain": "hip_joint_pain",
    "history of alcohol consumption": "history_of_alcohol_consumption",
    "increased appetite": "increased_appetite",
    "inflammatory nails": "inflammatory_nails",
    "internal itching": "internal_itching",
    "irregular sugar level": "irregular_sugar_level",
    "irritation in anus": "irritation_in_anus",
    "itching": "itching",
    "joint pain": "joint_pain",
    "knee pain": "knee_pain",
    "lack of concentration": "lack_of_concentration",
    "lethargy": "lethargy",
    "loss of balance": "loss_of_balance",
    "loss of smell": "loss_of_smell",
    "malaise": "malaise",
    "mild fever": "mild_fever",
    "mood swings": "mood_swings",
    "movement stiffness": "movement_stiffness",
    "mucoid sputum": "mucoid_sputum",
    "muscle wasting": "muscle_wasting",
    "muscle weakness": "muscle_weakness",
    "neck pain": "neck_pain",
    "nodal skin eruptions": "nodal_skin_eruptions",
    "obesity": "obesity",
    "pain behind the eyes": "pain_behind_the_eyes",
    "pain during bowel movements": "pain_during_bowel_movements",
    "pain in anal region": "pain_in_anal_region",
    "painful walking": "painful_walking",
    "passage of gases": "passage_of_gases",
    "patches in throat": "patches_in_throat",
    "phlegm": "phlegm",
    "polyuria": "polyuria",
    "prominent veins on calf": "prominent_veins_on_calf",
    "puffy face and eyes": "puffy_face_and_eyes",
    "pus filled pimples": "pus_filled_pimples",
    "receiving blood transfusion": "receiving_blood_transfusion",
    "receiving unsterile injections": "receiving_unsterile_injections",
    "red sore around nose": "red_sore_around_nose",
    "red spots over body": "red_spots_over_body",
    "redness of eyes": "redness_of_eyes",
    "rusty sputum": "rusty_sputum",
    "scurring": "scurring",
    "shivering": "shivering",
    "silver like dusting": "silver_like_dusting",
    "sinus pressure": "sinus_pressure",
    "skin peeling": "skin_peeling",
    "skin rash": "skin_rash",
    "slurred speech": "slurred_speech",
    "small dents in nails": "small_dents_in_nails",
    "spinning movements": "spinning_movements",
    "spotting  urination": "spotting__urination",
    "stiff neck": "stiff_neck",
    "stomach bleeding": "stomach_bleeding",
    "sunken eyes": "sunken_eyes",
    "swelled lymph nodes": "swelled_lymph_nodes",
    "swelling joints": "swelling_joints",
    "swelling of stomach": "swelling_of_stomach",
    "swollen blood vessels": "swollen_blood_vessels",
    "swollen extremeties": "swollen_extremeties",
    "swollen legs": "swollen_legs",
    "throat irritation": "throat_irritation",
    "toxic look (typhos)": "toxic_look_(typhos)",
    "ulcers on tongue": "ulcers_on_tongue",
    "unsteadiness": "unsteadiness",
    "visual disturbances": "visual_disturbances",
    "watering from eyes": "watering_from_eyes",
    "weakness in limbs": "weakness_in_limbs",
    "weakness of one body side": "weakness_of_one_body_side",
    "weight gain": "weight_gain",
    "yellow crust ooze": "yellow_crust_ooze",
    "yellow urine": "yellow_urine",
    "yellowing of eyes": "yellowing_of_eyes",
    "yellowish skin": "yellowish_skin",
    "yellow skin": "yellowish_skin",
}


import os
import json

# Auto-inject all 131 Kaggle dataset columns into the Lexicon!
try:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    columns_path = os.path.join(script_dir, "..", "ml", "symptom_columns.json")
    with open(columns_path, "r") as f:
        ml_symptoms = json.load(f)
        for sym in ml_symptoms:
            # "yellowish_skin" -> "yellowish skin"
            phrase = sym.replace("_", " ").strip()
            if phrase not in MEDICAL_LEXICON:
                MEDICAL_LEXICON[phrase] = sym
            # Add specific common variants for new Kaggle terms
            if "yellowish" in sym:
                MEDICAL_LEXICON[sym.replace("yellowish", "yellow").replace("_", " ").strip()] = sym
except Exception as e:
    pass # Falback to hardcoded lexicon if file is not found

# Build a sorted list of phrases (longest first) so multi-word matches
# take priority over single-word matches.
_PHRASES_SORTED = sorted(MEDICAL_LEXICON.keys(), key=len, reverse=True)

# Collect all single-word lemma forms for fallback matching
_SINGLE_WORD_KEYS = {k for k in MEDICAL_LEXICON if " " not in k}


def _clean(text: str) -> str:
    """Lowercase, strip punctuation (keep spaces), collapse whitespace."""
    text = text.lower()
    text = re.sub(r"[^a-z\s']", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_symptoms(raw_text: str) -> dict:
    """
    Extract canonical symptom keys from free-text input.

    Returns:
        {
            "matched": ["abdominal_pain", "nausea", ...],
            "unrecognized": ["xyz", ...]
        }
    """
    cleaned = _clean(raw_text)
    matched = set()
    remaining = cleaned

    # Pass 1 – greedy multi-word phrase matching (longest first)
    for phrase in _PHRASES_SORTED:
        if phrase in remaining:
            matched.add(MEDICAL_LEXICON[phrase])
            remaining = remaining.replace(phrase, " ")

    # Pass 2 – single-word fallback for leftover tokens
    remaining = re.sub(r"\s+", " ", remaining).strip()
    leftover_tokens = remaining.split() if remaining else []
    unrecognized = []

    stop_words = {
        "i", "me", "my", "have", "has", "had", "been", "am", "is", "are",
        "was", "were", "be", "a", "an", "the", "and", "or", "but", "for",
        "of", "in", "on", "to", "with", "from", "also", "very", "really",
        "been", "having", "feeling", "feel", "lot", "much", "some", "few",
        "days", "day", "week", "weeks", "month", "months", "ago", "since",
        "get", "getting", "got", "its", "it", "that", "this", "so", "too",
        "not", "no", "don't", "can't", "just", "like", "sometimes", "often",
        "always", "recently", "today", "yesterday", "last", "past", "about",
    }

    for token in leftover_tokens:
        if token in stop_words or len(token) <= 2:
            continue
        if token in MEDICAL_LEXICON:
            matched.add(MEDICAL_LEXICON[token])
        else:
            unrecognized.append(token)

    return {
        "matched": sorted(matched),
        "unrecognized": unrecognized,
    }

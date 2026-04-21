"""
Recommendation Engine – Returns lab tests, specialist, and lifestyle tips
for a given disease name.

Falls back to a hardcoded dictionary if the DB table is empty,
ensuring the system always has recommendations available.
"""

from models.db import execute_query
from services.disease_knowledge import KNOWLEDGE_BASE
_FALLBACK = {
    "Gastritis": {
        "lab_tests": "Complete Blood Count (CBC), H. pylori breath/stool test, Upper endoscopy",
        "specialist": "Gastroenterologist",
        "lifestyle_tips": "Avoid spicy and acidic foods, reduce alcohol, eat smaller frequent meals, manage stress",
    },
    "Peptic Ulcer Disease": {
        "lab_tests": "H. pylori test, Upper GI endoscopy, CBC",
        "specialist": "Gastroenterologist",
        "lifestyle_tips": "Avoid NSAIDs, stop smoking, limit alcohol, eat regular meals, reduce stress",
    },
    "Irritable Bowel Syndrome (IBS)": {
        "lab_tests": "CBC, Stool test, Celiac serology, Colonoscopy (if needed)",
        "specialist": "Gastroenterologist",
        "lifestyle_tips": "Follow a low-FODMAP diet, increase fiber gradually, regular exercise, stress management",
    },
    "Gastroenteritis": {
        "lab_tests": "Stool culture, CBC, Electrolyte panel",
        "specialist": "Gastroenterologist / General Physician",
        "lifestyle_tips": "Stay hydrated with ORS, rest, eat bland foods (BRAT diet), avoid dairy temporarily",
    },
    "Food Poisoning": {
        "lab_tests": "Stool culture, CBC, Blood culture (if severe)",
        "specialist": "General Physician / Emergency Medicine",
        "lifestyle_tips": "Drink plenty of fluids, rest, avoid solid food initially, then eat bland foods",
    },
    "Acid Reflux (GERD)": {
        "lab_tests": "Upper endoscopy, Esophageal pH monitoring, Barium swallow",
        "specialist": "Gastroenterologist",
        "lifestyle_tips": "Elevate head while sleeping, avoid eating 3 hrs before bed, avoid trigger foods, maintain healthy weight",
    },
    "Chronic Constipation": {
        "lab_tests": "Thyroid function tests, CBC, Colonoscopy (if age >45)",
        "specialist": "Gastroenterologist",
        "lifestyle_tips": "Increase dietary fiber, drink 8+ glasses of water daily, regular physical activity, establish toilet routine",
    },
    "Coronary Artery Disease": {
        "lab_tests": "Lipid panel, ECG, Stress test, Coronary angiography",
        "specialist": "Cardiologist",
        "lifestyle_tips": "Heart-healthy diet, regular exercise, stop smoking, manage blood pressure and cholesterol",
    },
    "Hypertension": {
        "lab_tests": "Blood pressure monitoring, Lipid panel, Renal function tests, ECG",
        "specialist": "Cardiologist / Internal Medicine",
        "lifestyle_tips": "Reduce sodium intake, exercise regularly, maintain healthy weight, limit alcohol, manage stress",
    },
    "Angina": {
        "lab_tests": "ECG, Stress test, Cardiac enzymes (troponin), Coronary angiography",
        "specialist": "Cardiologist",
        "lifestyle_tips": "Avoid physical overexertion, take prescribed medications, stop smoking, heart-healthy diet",
    },
    "Influenza": {
        "lab_tests": "Rapid influenza diagnostic test, CBC, Chest X-ray (if complications suspected)",
        "specialist": "General Physician",
        "lifestyle_tips": "Rest, stay hydrated, take fever reducers, isolate to prevent spread, annual flu vaccination",
    },
    "Pneumonia": {
        "lab_tests": "Chest X-ray, CBC, Sputum culture, Blood oxygen level (pulse oximetry)",
        "specialist": "Pulmonologist / General Physician",
        "lifestyle_tips": "Complete prescribed antibiotics, rest, stay hydrated, use humidifier, deep breathing exercises",
    },
    "Type 2 Diabetes": {
        "lab_tests": "Fasting blood glucose, HbA1c, Oral glucose tolerance test, Lipid panel",
        "specialist": "Endocrinologist / Diabetologist",
        "lifestyle_tips": "Monitor blood sugar regularly, balanced diet low in refined sugars, regular exercise, maintain healthy weight",
    },
    "Migraine": {
        "lab_tests": "Neurological exam, MRI/CT scan (to rule out other causes)",
        "specialist": "Neurologist",
        "lifestyle_tips": "Identify and avoid triggers, maintain regular sleep schedule, stay hydrated, stress management techniques",
    },
    "Generalized Anxiety Disorder": {
        "lab_tests": "Thyroid function tests (to rule out thyroid issues), CBC",
        "specialist": "Psychiatrist / Psychologist",
        "lifestyle_tips": "Cognitive behavioral therapy, regular exercise, mindfulness meditation, limit caffeine, adequate sleep",
    },
}


def get_recommendations(disease_name: str) -> dict:
    """
    Return recommendations for a disease.

    Tries the database first; falls back to the hardcoded dictionary.
    """
    if not disease_name:
        return {}

    # Try DB first
    try:
        row = execute_query(
            """SELECT r.lab_tests, r.specialist, r.lifestyle_tips
               FROM recommendations r
               JOIN diseases d ON r.disease_id = d.id
               WHERE d.name = %s""",
            (disease_name,),
            fetchone=True,
        )
        if row:
            fallback_data = KNOWLEDGE_BASE.get(disease_name, {})
            return {
                "lab_tests": row["lab_tests"] if row.get("lab_tests") else fallback_data.get("lab_tests", "Consult a physician for required diagnostics."),
                "specialist": row["specialist"] if row.get("specialist") else fallback_data.get("specialist", "General Physician"),
                "lifestyle_tips": row["lifestyle_tips"] if row.get("lifestyle_tips") else "Maintain a healthy lifestyle.",
            }
    except Exception:
        pass

    # Fallback to pure knowledge base if completely missing from DB
    fb = KNOWLEDGE_BASE.get(disease_name, {})
    return {
        "lab_tests": fb.get("lab_tests", "General blood work recommended"),
        "specialist": fb.get("specialist", "General Physician"),
        "lifestyle_tips": "Consult a healthcare professional for a tailored lifestyle plan.",
    }

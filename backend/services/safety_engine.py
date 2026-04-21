"""
Rule-Based Safety Engine – Detects red-flag symptom combinations
and overrides ML risk levels when necessary.

Red-flag rules are loaded from the database on first call and cached.
"""

import json
from models.db import execute_query

_rules_cache = None


def _load_rules():
    """Load red-flag rules from DB (cached after first call)."""
    global _rules_cache
    if _rules_cache is None:
        rows = execute_query("SELECT * FROM red_flag_rules", fetchall=True)
        _rules_cache = []
        for row in rows:
            combo = row["symptom_combo"]
            if isinstance(combo, str):
                combo = json.loads(combo)
            _rules_cache.append({
                "id": row["id"],
                "name": row["name"],
                "symptom_combo": combo,
                "category": row["category"],
                "risk_level": row["risk_level"],
                "message": row["message"],
            })
    return _rules_cache


def invalidate_cache():
    """Call this when admin updates rules so they are reloaded next time."""
    global _rules_cache
    _rules_cache = None


# Risk-level severity ordering
_SEVERITY = {"HIGH": 1, "URGENT": 2, "EMERGENCY": 3}


def evaluate_red_flags(matched_symptoms: list[str]) -> dict:
    """
    Check extracted symptoms against all red-flag rules.

    Args:
        matched_symptoms: canonical symptom keys, e.g. ["chest_pain", "sweating"]

    Returns:
        {
            "triggered_rules": [
                {"name": "Cardiac emergency", "risk_level": "HIGH",
                 "message": "Seek emergency care immediately", "category": "Cardiac"}
            ],
            "risk_level": "HIGH" | "URGENT" | "EMERGENCY" | None,
            "emergency_message": "..." | None
        }
    """
    rules = _load_rules()
    symptom_set = set(matched_symptoms)

    triggered = []
    max_severity = 0
    emergency_message = None

    for rule in rules:
        combo = set(rule["symptom_combo"])
        if combo and combo.issubset(symptom_set):
            triggered.append({
                "name": rule["name"],
                "risk_level": rule["risk_level"],
                "message": rule["message"],
                "category": rule["category"],
            })
            severity = _SEVERITY.get(rule["risk_level"], 0)
            if severity > max_severity:
                max_severity = severity
                emergency_message = rule["message"]

    # Determine overall risk level
    overall_risk = None
    for level, sev in _SEVERITY.items():
        if sev == max_severity:
            overall_risk = level
            break

    return {
        "triggered_rules": triggered,
        "risk_level": overall_risk,
        "emergency_message": emergency_message,
    }

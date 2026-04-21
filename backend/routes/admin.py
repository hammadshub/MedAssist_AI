from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.db import execute_query
from utils.decorators import admin_required
import json

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


# ─── Diseases CRUD ───────────────────────────────────────

@admin_bp.route("/diseases", methods=["GET"])
@jwt_required()
@admin_required
def list_diseases():
    """List all diseases."""
    rows = execute_query("SELECT * FROM diseases ORDER BY category, name", fetchall=True)
    return jsonify({"diseases": rows}), 200


@admin_bp.route("/diseases", methods=["POST"])
@jwt_required()
@admin_required
def add_disease():
    """Add a new disease."""
    data = request.get_json()
    name = data.get("name", "").strip()
    category = data.get("category", "").strip()
    description = data.get("description", "").strip()

    if not name:
        return jsonify({"error": "Disease name is required"}), 400

    disease_id = execute_query(
        "INSERT INTO diseases (name, category, description) VALUES (%s, %s, %s)",
        (name, category, description),
        commit=True,
    )
    _log_admin_action("ADD_DISEASE", f"Added disease: {name}")
    return jsonify({"message": "Disease added", "id": disease_id}), 201


@admin_bp.route("/diseases/<int:disease_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_disease(disease_id):
    """Update an existing disease."""
    data = request.get_json()
    name = data.get("name", "").strip()
    category = data.get("category", "").strip()
    description = data.get("description", "").strip()

    execute_query(
        "UPDATE diseases SET name=%s, category=%s, description=%s WHERE id=%s",
        (name, category, description, disease_id),
        commit=True,
    )
    _log_admin_action("UPDATE_DISEASE", f"Updated disease id={disease_id}")
    return jsonify({"message": "Disease updated"}), 200


@admin_bp.route("/diseases/<int:disease_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_disease(disease_id):
    """Delete a disease."""
    execute_query("DELETE FROM diseases WHERE id=%s", (disease_id,), commit=True)
    _log_admin_action("DELETE_DISEASE", f"Deleted disease id={disease_id}")
    return jsonify({"message": "Disease deleted"}), 200


# ─── Symptoms CRUD ───────────────────────────────────────

@admin_bp.route("/symptoms", methods=["GET"])
@jwt_required()
@admin_required
def list_symptoms():
    """List all symptoms."""
    rows = execute_query("SELECT * FROM symptoms ORDER BY name", fetchall=True)
    return jsonify({"symptoms": rows}), 200


@admin_bp.route("/symptoms", methods=["POST"])
@jwt_required()
@admin_required
def add_symptom():
    """Add a new symptom."""
    data = request.get_json()
    name = data.get("name", "").strip()
    aliases = data.get("aliases", "").strip()

    if not name:
        return jsonify({"error": "Symptom name is required"}), 400

    symptom_id = execute_query(
        "INSERT INTO symptoms (name, aliases) VALUES (%s, %s)",
        (name, aliases),
        commit=True,
    )
    _log_admin_action("ADD_SYMPTOM", f"Added symptom: {name}")
    return jsonify({"message": "Symptom added", "id": symptom_id}), 201


@admin_bp.route("/symptoms/<int:symptom_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_symptom(symptom_id):
    """Update a symptom."""
    data = request.get_json()
    execute_query(
        "UPDATE symptoms SET name=%s, aliases=%s WHERE id=%s",
        (data.get("name", ""), data.get("aliases", ""), symptom_id),
        commit=True,
    )
    _log_admin_action("UPDATE_SYMPTOM", f"Updated symptom id={symptom_id}")
    return jsonify({"message": "Symptom updated"}), 200


@admin_bp.route("/symptoms/<int:symptom_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_symptom(symptom_id):
    """Delete a symptom."""
    execute_query("DELETE FROM symptoms WHERE id=%s", (symptom_id,), commit=True)
    _log_admin_action("DELETE_SYMPTOM", f"Deleted symptom id={symptom_id}")
    return jsonify({"message": "Symptom deleted"}), 200


# ─── Red-Flag Rules CRUD ────────────────────────────────

@admin_bp.route("/rules", methods=["GET"])
@jwt_required()
@admin_required
def list_rules():
    """List all red-flag rules."""
    rows = execute_query("SELECT * FROM red_flag_rules ORDER BY category", fetchall=True)
    for row in rows:
        row["symptom_combo"] = json.loads(row["symptom_combo"]) if row["symptom_combo"] else []
    return jsonify({"rules": rows}), 200


@admin_bp.route("/rules", methods=["POST"])
@jwt_required()
@admin_required
def add_rule():
    """Add a new red-flag rule."""
    data = request.get_json()
    rule_id = execute_query(
        """INSERT INTO red_flag_rules (name, symptom_combo, category, risk_level, message)
           VALUES (%s, %s, %s, %s, %s)""",
        (
            data.get("name", ""),
            json.dumps(data.get("symptom_combo", [])),
            data.get("category", ""),
            data.get("risk_level", "HIGH"),
            data.get("message", ""),
        ),
        commit=True,
    )
    _log_admin_action("ADD_RULE", f"Added rule: {data.get('name')}")
    return jsonify({"message": "Rule added", "id": rule_id}), 201


@admin_bp.route("/rules/<int:rule_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_rule(rule_id):
    """Update a red-flag rule."""
    data = request.get_json()
    execute_query(
        """UPDATE red_flag_rules
           SET name=%s, symptom_combo=%s, category=%s, risk_level=%s, message=%s
           WHERE id=%s""",
        (
            data.get("name", ""),
            json.dumps(data.get("symptom_combo", [])),
            data.get("category", ""),
            data.get("risk_level", "HIGH"),
            data.get("message", ""),
            rule_id,
        ),
        commit=True,
    )
    _log_admin_action("UPDATE_RULE", f"Updated rule id={rule_id}")
    return jsonify({"message": "Rule updated"}), 200


@admin_bp.route("/rules/<int:rule_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_rule(rule_id):
    """Delete a red-flag rule."""
    execute_query("DELETE FROM red_flag_rules WHERE id=%s", (rule_id,), commit=True)
    _log_admin_action("DELETE_RULE", f"Deleted rule id={rule_id}")
    return jsonify({"message": "Rule deleted"}), 200


# ─── Helper ──────────────────────────────────────────────

def _log_admin_action(action, details):
    """Write an entry to admin_logs."""
    from flask_jwt_extended import get_jwt_identity

    try:
        admin_id = int(get_jwt_identity())
        execute_query(
            "INSERT INTO admin_logs (admin_id, action, details) VALUES (%s, %s, %s)",
            (admin_id, action, details),
            commit=True,
        )
    except Exception:
        pass  # non-critical: don't block the main action

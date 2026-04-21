from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.db import execute_query

history_bp = Blueprint("history", __name__, url_prefix="/api")


@history_bp.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    """Return all past predictions for the authenticated user."""
    user_id = int(get_jwt_identity())
    rows = execute_query(
        """SELECT id, raw_input, extracted_kw, top_diseases,
                  risk_level, red_flags, created_at
           FROM predictions
           WHERE user_id = %s
           ORDER BY created_at DESC""",
        (user_id,),
        fetchall=True,
    )

    # Parse JSON columns
    import json
    for row in rows:
        row["extracted_kw"] = json.loads(row["extracted_kw"]) if row["extracted_kw"] else []
        row["top_diseases"] = json.loads(row["top_diseases"]) if row["top_diseases"] else []
        row["red_flags"] = json.loads(row["red_flags"]) if row["red_flags"] else []
        row["created_at"] = row["created_at"].isoformat() if row["created_at"] else None

    return jsonify({"history": rows}), 200


@history_bp.route("/history/<int:prediction_id>", methods=["GET"])
@jwt_required()
def get_prediction_detail(prediction_id):
    """Return a single prediction by ID (must belong to the authenticated user)."""
    user_id = int(get_jwt_identity())
    row = execute_query(
        """SELECT id, raw_input, extracted_kw, top_diseases,
                  risk_level, red_flags, created_at
           FROM predictions
           WHERE id = %s AND user_id = %s""",
        (prediction_id, user_id),
        fetchone=True,
    )

    if not row:
        return jsonify({"error": "Prediction not found"}), 404

    import json
    row["extracted_kw"] = json.loads(row["extracted_kw"]) if row["extracted_kw"] else []
    row["top_diseases"] = json.loads(row["top_diseases"]) if row["top_diseases"] else []
    row["red_flags"] = json.loads(row["red_flags"]) if row["red_flags"] else []
    row["created_at"] = row["created_at"].isoformat() if row["created_at"] else None

    return jsonify({"prediction": row}), 200

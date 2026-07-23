from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from ..extensions import db
from ..models import Prediction

predictions_bp = Blueprint("predictions", __name__, url_prefix="/api/predictions")


def build_report(prediction: Prediction) -> dict:
    report = current_app.prediction_service.predict_report(prediction.input_text)
    return {**prediction.to_dict(), **report}


@predictions_bp.post("")
@jwt_required()
def create_prediction():
    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    word_count = len(text.split())

    if word_count < 25:
        return jsonify(error="Please write at least 25 words so the model has enough context."), 400
    if len(text) > 5000:
        return jsonify(error="Text must be 5,000 characters or fewer."), 400

    report = current_app.prediction_service.predict_report(text)
    if report["recognized_features"] < 5:
        return jsonify(error="The model recognized too little of the text. Please use complete, descriptive sentences."), 400

    prediction = Prediction(
        input_text=text,
        predicted_type=report["predicted_type"],
        confidence=report["confidence"],
        user_id=int(get_jwt_identity()),
        model_version="v2-report",
    )
    db.session.add(prediction)
    db.session.commit()
    return jsonify(prediction={**prediction.to_dict(), **report}), 201


@predictions_bp.get("")
@jwt_required()
def list_predictions():
    user_id = int(get_jwt_identity())
    records = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.created_at.desc()).all()
    return jsonify(predictions=[record.to_dict() for record in records])


@predictions_bp.get("/<int:prediction_id>")
@jwt_required()
def get_prediction(prediction_id: int):
    user_id = int(get_jwt_identity())
    prediction = Prediction.query.filter_by(id=prediction_id, user_id=user_id).first_or_404()
    return jsonify(prediction=build_report(prediction))


@predictions_bp.patch("/<int:prediction_id>/feedback")
@jwt_required()
def update_feedback(prediction_id: int):
    user_id = int(get_jwt_identity())
    prediction = Prediction.query.filter_by(id=prediction_id, user_id=user_id).first_or_404()
    data = request.get_json(silent=True) or {}
    if not isinstance(data.get("is_accurate"), bool):
        return jsonify(error="is_accurate must be true or false."), 400
    prediction.is_accurate = data["is_accurate"]
    db.session.commit()
    return jsonify(prediction=prediction.to_dict())


@predictions_bp.delete("/<int:prediction_id>")
@jwt_required()
def delete_prediction(prediction_id: int):
    user_id = int(get_jwt_identity())
    prediction = Prediction.query.filter_by(id=prediction_id, user_id=user_id).first_or_404()
    db.session.delete(prediction)
    db.session.commit()
    return "", 204

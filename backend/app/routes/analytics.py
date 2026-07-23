from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func
from ..extensions import db
from ..models import Prediction


analytics_bp = Blueprint(
    "analytics",
    __name__,
    url_prefix="/api/analytics",
)


@analytics_bp.get("")
@jwt_required()
def analytics():
    user_id = int(get_jwt_identity())

    total = Prediction.query.filter_by(user_id=user_id).count()

    average_confidence = (
        db.session.query(func.avg(Prediction.confidence))
        .filter(Prediction.user_id == user_id)
        .scalar()
        or 0
    )

    distribution = (
        db.session.query(
            Prediction.predicted_type,
            func.count(Prediction.id),
        )
        .filter(Prediction.user_id == user_id)
        .group_by(Prediction.predicted_type)
        .all()
    )

    total_feedback = (
        Prediction.query
        .filter(
            Prediction.user_id == user_id,
            Prediction.is_accurate.isnot(None),
        )
        .count()
    )

    positive_feedback = (
        Prediction.query
        .filter(
            Prediction.user_id == user_id,
            Prediction.is_accurate.is_(True),
        )
        .count()
    )

    positive_feedback_percentage = (
        round((positive_feedback / total_feedback) * 100)
        if total_feedback > 0
        else 0
    )

    return jsonify(
        total_predictions=total,
        average_confidence=round(float(average_confidence), 4),
        type_distribution={
            mbti_type: count
            for mbti_type, count in distribution
        },
        total_feedback=total_feedback,
        positive_feedback=positive_feedback,
        positive_feedback_percentage=positive_feedback_percentage,
    )
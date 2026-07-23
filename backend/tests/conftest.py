import pytest
from app import create_app
from app.extensions import db


class FakePredictionService:
    def predict_report(self, text: str):
        return {
            "predicted_type": "INTJ",
            "confidence": 0.91,
            "closest_matches": [
                {"type": "INTJ", "confidence": 0.91},
                {"type": "INTP", "confidence": 0.04},
                {"type": "ENTJ", "confidence": 0.03},
                {"type": "INFJ", "confidence": 0.02},
            ],
            "writing_signals": [{"name": "Logic and problem solving", "icon": "🧩", "description": "Test signal", "matched_words": ["problem"], "score": 1}],
            "recognized_features": 12,
            "word_count": len(text.split()),
        }


@pytest.fixture()
def app():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-secret",
    })
    app.prediction_service = FakePredictionService()
    with app.app_context():
        db.drop_all()
        db.create_all()
    yield app


@pytest.fixture()
def client(app):
    return app.test_client()

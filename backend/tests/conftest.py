import pytest
from app import create_app
from app.extensions import db


class FakePredictionService:
    def predict(self, _text: str):
        return "INTJ", 0.91


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

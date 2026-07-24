import os
from pathlib import Path
from flask import Flask, jsonify
from .extensions import cors, db, jwt, migrate
from .routes.analytics import analytics_bp
from .routes.auth import auth_bp
from .routes.predictions import predictions_bp
from .services.prediction_service import PredictionService


def create_app(test_config: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.update(
        SQLALCHEMY_DATABASE_URI=os.getenv(
            "DATABASE_URL", "sqlite:///personality_ai.db"
        ).replace("postgres://", "postgresql://", 1),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY", "change-this-in-production"),
        JSON_SORT_KEYS=False,
    )

    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "https://personality-ai-fullstack.vercel.app",
                "https://personality-ai-fullstack-hh3n638wb-cindycastanons-projects.vercel.app",
            ]
        }
    },
)

    app.register_blueprint(auth_bp)
    app.register_blueprint(predictions_bp)
    app.register_blueprint(analytics_bp)

    model_dir = Path(__file__).resolve().parents[1] / "model"
    app.prediction_service = PredictionService(model_dir)

    @app.get("/api/health")
    def health():
        return jsonify(status="ok")

    @app.errorhandler(404)
    def not_found(_error):
        return jsonify(error="Resource not found."), 404

    with app.app_context():
        db.create_all()

    return app

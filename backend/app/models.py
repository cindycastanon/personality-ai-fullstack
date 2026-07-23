from datetime import datetime, timezone
from werkzeug.security import check_password_hash, generate_password_hash
from .extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    predictions = db.relationship("Prediction", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


class Prediction(db.Model):
    __tablename__ = "predictions"

    id = db.Column(db.Integer, primary_key=True)
    input_text = db.Column(db.Text, nullable=False)
    predicted_type = db.Column(db.String(4), nullable=False, index=True)
    confidence = db.Column(db.Float, nullable=False)
    model_version = db.Column(db.String(50), nullable=False, default="v1")
    is_accurate = db.Column(db.Boolean, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    user = db.relationship("User", back_populates="predictions")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "input_text": self.input_text,
            "predicted_type": self.predicted_type,
            "confidence": round(self.confidence, 4),
            "model_version": self.model_version,
            "is_accurate": self.is_accurate,
            "created_at": self.created_at.isoformat(),
        }

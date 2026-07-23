from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError
from ..extensions import db
from ..models import User


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email or "@" not in email:
        return jsonify(error="A valid email is required."), 400
    if len(password) < 8:
        return jsonify(error="Password must be at least 8 characters."), 400

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify(error="An account with this email already exists."), 409

    token = create_access_token(identity=str(user.id))
    return jsonify(access_token=token, user={"id": user.id, "email": user.email}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify(error="Invalid email or password."), 401

    token = create_access_token(identity=str(user.id))
    return jsonify(access_token=token, user={"id": user.id, "email": user.email})

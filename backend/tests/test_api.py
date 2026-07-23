def register(client):
    response = client.post("/api/auth/register", json={"email": "cindy@example.com", "password": "password123"})
    return response.get_json()["access_token"]


def test_register_predict_and_read_report(client):
    token = register(client)
    text = "I enjoy solving complex technical problems, planning my work carefully, learning new systems, and helping teammates understand difficult ideas while improving every solution over time."
    response = client.post("/api/predictions", headers={"Authorization": f"Bearer {token}"}, json={"text": text})
    assert response.status_code == 201
    prediction = response.get_json()["prediction"]
    assert prediction["predicted_type"] == "INTJ"
    assert len(prediction["closest_matches"]) == 4

    detail = client.get(f"/api/predictions/{prediction['id']}", headers={"Authorization": f"Bearer {token}"})
    assert detail.status_code == 200
    assert detail.get_json()["prediction"]["writing_signals"]


def test_short_prediction_is_rejected(client):
    token = register(client)
    response = client.post("/api/predictions", headers={"Authorization": f"Bearer {token}"}, json={"text": "Too short."})
    assert response.status_code == 400


def test_prediction_requires_authentication(client):
    response = client.post("/api/predictions", json={"text": "A sufficiently long piece of text that should still require authentication before the prediction endpoint can be used by anyone."})
    assert response.status_code == 401

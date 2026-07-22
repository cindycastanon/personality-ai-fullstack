def register(client):
    response = client.post("/api/auth/register", json={
        "email": "cindy@example.com",
        "password": "password123",
    })
    return response.get_json()["access_token"]


def test_register_and_predict(client):
    token = register(client)
    response = client.post(
        "/api/predictions",
        headers={"Authorization": f"Bearer {token}"},
        json={"text": "I enjoy solving complex problems and planning ahead."},
    )
    assert response.status_code == 201
    assert response.get_json()["prediction"]["predicted_type"] == "INTJ"


def test_prediction_requires_authentication(client):
    response = client.post("/api/predictions", json={"text": "A sufficiently long piece of text."})
    assert response.status_code == 401

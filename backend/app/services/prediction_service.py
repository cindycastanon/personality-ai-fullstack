from pathlib import Path
import joblib
import torch
import torch.nn as nn


class PersonalityModel(nn.Module):
    def __init__(self, input_size: int = 1000, num_classes: int = 16):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(input_size, 256),
            nn.ReLU(),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        return self.fc(x)


class PredictionService:
    def __init__(self, model_dir: Path):
        self.model = PersonalityModel()
        model_path = model_dir / "mbti_model.pth"
        self.model.load_state_dict(torch.load(model_path, map_location="cpu"))
        self.model.eval()
        self.vectorizer = joblib.load(model_dir / "vectorizer.pkl")
        self.label_encoder = joblib.load(model_dir / "label_encoder.pkl")

    def predict(self, text: str) -> tuple[str, float]:
        vector = self.vectorizer.transform([text]).toarray()
        tensor = torch.tensor(vector, dtype=torch.float32)

        with torch.no_grad():
            logits = self.model(tensor)
            probabilities = torch.softmax(logits, dim=1)
            confidence, predicted_index = torch.max(probabilities, dim=1)

        predicted_type = self.label_encoder.inverse_transform([predicted_index.item()])[0]
        return predicted_type, float(confidence.item())

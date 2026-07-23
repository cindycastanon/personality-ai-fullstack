from pathlib import Path
import re
import joblib
import torch
import torch.nn as nn


class PersonalityModel(nn.Module):
    def __init__(self, input_size: int = 1000, num_classes: int = 16):
        super().__init__()
        self.fc = nn.Sequential(nn.Linear(input_size, 256), nn.ReLU(), nn.Linear(256, num_classes))

    def forward(self, x):
        return self.fc(x)


SIGNAL_GROUPS = {
    "Reflection": {
        "icon": "🌱",
        "description": "Your response uses introspective language about thoughts, identity, or personal growth.",
        "words": {"think", "feel", "learn", "understand", "myself", "reflect", "meaning", "growth", "believe", "value"},
    },
    "Creativity": {
        "icon": "🎨",
        "description": "Your response includes imaginative, idea-oriented, or possibility-focused language.",
        "words": {"imagine", "creative", "ideas", "possibility", "dream", "design", "explore", "curious", "invent", "future"},
    },
    "People focus": {
        "icon": "❤️",
        "description": "Your response emphasizes relationships, empathy, collaboration, or the impact on other people.",
        "words": {"people", "friends", "family", "help", "care", "team", "together", "empathy", "support", "understand"},
    },
    "Structure": {
        "icon": "🧭",
        "description": "Your response contains planning, organization, goals, or decision-focused language.",
        "words": {"plan", "organize", "schedule", "goal", "decide", "prepare", "finish", "deadline", "order", "routine"},
    },
    "Logic and problem solving": {
        "icon": "🧩",
        "description": "Your response highlights analysis, systems, evidence, or solving difficult problems.",
        "words": {"logic", "analyze", "problem", "solve", "evidence", "system", "reason", "technical", "challenge", "solution"},
    },
    "Energy and action": {
        "icon": "⚡",
        "description": "Your response uses active, social, spontaneous, or experience-oriented language.",
        "words": {"action", "social", "talk", "meet", "adventure", "experience", "try", "excited", "active", "spontaneous"},
    },
}


class PredictionService:
    def __init__(self, model_dir: Path):
        self.model = PersonalityModel()
        self.model.load_state_dict(torch.load(model_dir / "mbti_model.pth", map_location="cpu"))
        self.model.eval()
        self.vectorizer = joblib.load(model_dir / "vectorizer.pkl")
        self.label_encoder = joblib.load(model_dir / "label_encoder.pkl")

    def analyze_signals(self, text: str) -> list[dict]:
        words = re.findall(r"[a-zA-Z']+", text.lower())
        word_set = set(words)
        ranked = []
        for name, group in SIGNAL_GROUPS.items():
            matches = sorted(word_set.intersection(group["words"]))
            if matches:
                ranked.append({
                    "name": name,
                    "icon": group["icon"],
                    "description": group["description"],
                    "matched_words": matches[:5],
                    "score": len(matches),
                })
        ranked.sort(key=lambda item: item["score"], reverse=True)
        if not ranked:
            ranked = [{
                "name": "General writing patterns",
                "icon": "✨",
                "description": "The prediction was based on vocabulary patterns learned from the training data, but no simple explanation category was strong.",
                "matched_words": [],
                "score": 0,
            }]
        return ranked[:3]

    def predict_report(self, text: str) -> dict:
        sparse_vector = self.vectorizer.transform([text])
        recognized_features = int(sparse_vector.nnz)
        tensor = torch.tensor(sparse_vector.toarray(), dtype=torch.float32)

        with torch.no_grad():
            probabilities = torch.softmax(self.model(tensor), dim=1)[0]

        top_values, top_indices = torch.topk(probabilities, k=4)
        matches = []
        for value, index in zip(top_values.tolist(), top_indices.tolist()):
            matches.append({
                "type": str(self.label_encoder.inverse_transform([index])[0]),
                "confidence": float(value),
            })

        return {
            "predicted_type": matches[0]["type"],
            "confidence": matches[0]["confidence"],
            "closest_matches": matches,
            "writing_signals": self.analyze_signals(text),
            "recognized_features": recognized_features,
            "word_count": len(re.findall(r"[a-zA-Z']+", text)),
        }

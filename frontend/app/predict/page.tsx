"use client";

import { apiFetch } from "@/lib/api";
import { FormEvent, useState } from "react";

type Prediction = { id: number; predicted_type: string; confidence: number; created_at: string };

export default function PredictPage() {
  const [text, setText] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await apiFetch<{ prediction: Prediction }>("/api/predictions", { method: "POST", body: JSON.stringify({ text }) });
      setPrediction(data.prediction);
    } catch (err) { setError(err instanceof Error ? err.message : "Prediction failed."); }
    finally { setLoading(false); }
  }

  return (
    <div className="twoColumn">
      <form className="card form" onSubmit={submit}>
        <span className="eyebrow">Personality prediction</span>
        <h1>Tell us how you think and interact.</h1>
        <label>Your description<textarea rows={12} maxLength={5000} value={text} onChange={(e) => setText(e.target.value)} placeholder="I enjoy planning ahead, solving difficult problems…" required /></label>
        <div className="formFooter"><span>{text.length}/5000</span><button className="button" disabled={loading}>{loading ? "Analyzing…" : "Predict personality"}</button></div>
        {error && <p className="error">{error}</p>}
      </form>
      <section className="card resultCard">
        {prediction ? <><span className="eyebrow">Your result</span><div className="typeBadge">{prediction.predicted_type}</div><h2>{Math.round(prediction.confidence * 100)}% confidence</h2><p>Your result was saved to your personal history.</p></> : <><h2>Your result will appear here.</h2><p>Enter at least 20 characters and submit your description.</p></>}
      </section>
    </div>
  );
}

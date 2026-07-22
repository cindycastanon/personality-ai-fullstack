"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

type Prediction = { id: number; input_text: string; predicted_type: string; confidence: number; is_accurate: boolean | null; created_at: string };

export default function HistoryPage() {
  const [items, setItems] = useState<Prediction[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try { const data = await apiFetch<{ predictions: Prediction[] }>("/predictions"); setItems(data.predictions); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not load history."); }
  }
  useEffect(() => { load(); }, []);

  async function feedback(id: number, is_accurate: boolean) {
    await apiFetch(`/predictions/${id}/feedback`, { method: "PATCH", body: JSON.stringify({ is_accurate }) });
    load();
  }
  async function remove(id: number) {
    await apiFetch(`/predictions/${id}`, { method: "DELETE" });
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return <section><span className="eyebrow">Saved results</span><h1>Prediction history</h1>{error && <p className="error">{error}</p>}
    <div className="historyList">{items.map((item) => <article className="card historyCard" key={item.id}><div><div className="typeBadge smallType">{item.predicted_type}</div><p>{item.input_text}</p><small>{new Date(item.created_at).toLocaleString()} · {Math.round(item.confidence * 100)}% confidence</small></div><div className="historyActions"><span>Accurate?</span><button onClick={() => feedback(item.id, true)}>Yes</button><button onClick={() => feedback(item.id, false)}>No</button><button className="danger" onClick={() => remove(item.id)}>Delete</button></div></article>)}</div>
    {!error && items.length === 0 && <div className="card"><p>No predictions saved yet.</p></div>}
  </section>;
}

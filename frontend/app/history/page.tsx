"use client";

import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { personalityProfiles } from "@/lib/personalityData";

type Prediction = {
  id: number;
  input_text: string;
  predicted_type: string;
  confidence: number;
  is_accurate: boolean | null;
  created_at: string;
};

export default function HistoryPage() {
  const [items, setItems] = useState<Prediction[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");

      const data = await apiFetch<{ predictions: Prediction[] }>(
        "/predictions"
      );

      setItems(data.predictions);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load history."
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: number) {
    try {
      setError("");

      await apiFetch(`/predictions/${id}`, {
        method: "DELETE",
      });

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete prediction."
      );
    }
  }

  return (
    <section>
      <span className="eyebrow">Saved results</span>
      <h1>Prediction history</h1>

      {error && <p className="error">{error}</p>}

      <div className="historyList">
        {items.map((item) => (
          <article className="card historyCard" key={item.id}>
            <div className="historyIdentity">
              <div className="historyEmoji">
                {personalityProfiles[item.predicted_type]?.emoji}
              </div>

              <div>
                <div className="typeBadge smallType">
                  {item.predicted_type}
                </div>

                <strong>
                  {personalityProfiles[item.predicted_type]?.name}
                </strong>

                <p>{item.input_text}</p>

                <small>
                  {new Date(item.created_at).toLocaleString()} ·{" "}
                  {Math.round(item.confidence * 100)}% confidence
                </small>
              </div>
            </div>

            <div className="historyActions">
              <Link
                className="button small"
                href={`/history/${item.id}`}
              >
                Read full report
              </Link>

              <button
                type="button"
                className="danger"
                onClick={() => remove(item.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {!error && items.length === 0 && (
        <div className="card">
          <p>No predictions saved yet.</p>
        </div>
      )}
    </section>
  );
}
"use client";

import { apiFetch } from "@/lib/api";
import { FormEvent, useState } from "react";
import confetti from "canvas-confetti";
import ResultReport, { Report } from "@/components/ResultReport";

export default function PredictPage() {
  const [text, setText] = useState("");
  const [prediction, setPrediction] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);
    setPrediction(null);

    try {
      const data = await apiFetch<{ prediction: Report }>(
        "/predictions",
        {
          method: "POST",
          body: JSON.stringify({ text }),
        }
      );

      setPrediction(data.prediction);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.65 },
      });

      setTimeout(() => {
        document
          .getElementById("result")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Prediction failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const words = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  return (
    <>
      <section className="predictIntro">
        <span className="eyebrow">
          Writing-style personality predictor
        </span>

        <h1>
          Tell us how you think, decide, and interact.
        </h1>

        <p>
          Write at least 25 words about how you solve problems,
          spend time, make decisions, work with people, and
          respond to challenges.
        </p>
      </section>

      <form
        className="card form predictionForm"
        onSubmit={submit}
      >
        <label>
          Your description

          <textarea
            rows={10}
            maxLength={5000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="I usually approach difficult decisions by... When I work with other people... In my free time..."
            required
          />
        </label>

        <div className="promptChips">
          <span>Decision-making</span>
          <span>Social energy</span>
          <span>Planning style</span>
          <span>Problem solving</span>
          <span>Personal values</span>
        </div>

        <div className="formFooter">
          <span
            className={
              words < 25 ? "wordWarning" : "wordReady"
            }
          >
            {words}/25 minimum words
          </span>

          <button
            className="button"
            disabled={loading}
          >
            {loading
              ? "Analyzing your writing…"
              : "Reveal my personality"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}
      </form>

      {prediction && (
        <div
          id="result"
          className="resultSection"
        >
          <ResultReport report={prediction} />

          <div className="savedNotice">
            ✓ Full report saved to your personal history.
          </div>
        </div>
      )}
    </>
  );
}

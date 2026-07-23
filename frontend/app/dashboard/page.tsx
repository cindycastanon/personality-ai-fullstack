"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { personalityProfiles } from "@/lib/personalityData";

type Analytics = {
  total_predictions: number;
  average_confidence: number;
  type_distribution: Record<string, number>;
  total_feedback: number;
  positive_feedback: number;
  positive_feedback_percentage: number;
};

type Prediction = {
  predicted_type: string;
  created_at: string;
};

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [latest, setLatest] = useState<Prediction | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch<Analytics>("/analytics"),
      apiFetch<{ predictions: Prediction[] }>("/predictions"),
    ])
      .then(([analyticsData, predictionsData]) => {
        setAnalytics(analyticsData);
        setLatest(predictionsData.predictions[0] ?? null);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load dashboard."
        );
      });
  }, []);

  const mostCommon = useMemo(() => {
    if (!analytics) return undefined;

    return Object.entries(analytics.type_distribution).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];
  }, [analytics]);

  if (error) {
    return (
      <section>
        <span className="eyebrow">Personal analytics</span>
        <h1>Personality analytics</h1>
        <p className="error">{error}</p>
      </section>
    );
  }

  if (!analytics) {
    return (
      <section>
        <span className="eyebrow">Personal analytics</span>
        <h1>Personality analytics</h1>
        <p className="dashboardSubtitle">
          Track your predictions and model performance over time.
        </p>

        <div className="statGrid">
          {[1, 2, 3, 4, 5].map((item) => (
            <article
              className="card statCard dashboardSkeleton"
              key={item}
            >
              <span />
              <strong />
              <small />
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (analytics.total_predictions === 0) {
    return (
      <section>
        <span className="eyebrow">Personal analytics</span>
        <h1>Personality analytics</h1>
        <p className="dashboardSubtitle">
          Track your predictions and model performance over time.
        </p>

        <div className="card dashboardEmpty">
          <h2>No predictions yet</h2>
          <p>
            Create your first personality prediction to see your
            analytics.
          </p>
        </div>
      </section>
    );
  }

  const sortedDistribution = Object.entries(
    analytics.type_distribution
  ).sort((a, b) => b[1] - a[1]);

  return (
    <section>
      <span className="eyebrow">Personal analytics</span>

      <h1>Personality analytics</h1>

      <p className="dashboardSubtitle">
        Track your predictions and model performance over time.
      </p>

      <div className="statGrid">
        <article className="card statCard">
          <span>📊 Total predictions</span>
          <strong>{analytics.total_predictions}</strong>
          <small>Reports created</small>
        </article>

        <article className="card statCard">
          <span>🧠 Most common type</span>
          <strong>{mostCommon ?? "—"}</strong>
          <small>
            {mostCommon
              ? personalityProfiles[mostCommon]?.name
              : "No results yet"}
          </small>
        </article>

        <article className="card statCard">
          <span>🎯 Average confidence</span>
          <strong>
            {Math.round(analytics.average_confidence * 100)}%
          </strong>
          <small>Based on all predictions</small>
        </article>

        <article className="card statCard">
          <span>👍 Positive feedback</span>
          <strong>
            {analytics.total_feedback > 0
              ? `${analytics.positive_feedback_percentage}%`
              : "—"}
          </strong>
          <small>
            {analytics.total_feedback > 0
              ? `${analytics.positive_feedback} of ${analytics.total_feedback} marked accurate`
              : "No feedback submitted yet"}
          </small>
        </article>

        <article className="card statCard">
          <span>🕒 Latest prediction</span>
          <strong>{latest?.predicted_type ?? "—"}</strong>
          <small>
            {latest
              ? new Date(latest.created_at).toLocaleDateString(
                  undefined,
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )
              : "No predictions yet"}
          </small>
        </article>
      </div>

      <div className="card distributionCard">
        <div className="distributionHeader">
          <div>
            <span className="eyebrow">Results overview</span>
            <h2>Type distribution</h2>
          </div>

          <small>
            {analytics.total_predictions} total predictions
          </small>
        </div>

        <div className="distribution">
          {sortedDistribution.map(([type, count]) => {
            const percentage = analytics.total_predictions
              ? (count / analytics.total_predictions) * 100
              : 0;

            return (
              <div key={type} className="distributionRow">
                <span>
                  <b>{type}</b>
                  {" · "}
                  {personalityProfiles[type]?.name}
                </span>

                <div className="distributionTrack">
                  <i
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <strong>{count}</strong>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

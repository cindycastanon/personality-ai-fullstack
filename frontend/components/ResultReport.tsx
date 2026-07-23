"use client";
import { apiFetch } from "@/lib/api";
import { useState } from "react";
import Link from "next/link";
import { personalityProfiles } from "@/lib/personalityData";

export type Match = {
  type: string;
  confidence: number;
};

export type Signal = {
  name: string;
  icon: string;
  description: string;
  matched_words: string[];
};

export type Report = {
  id: number;
  predicted_type: string;
  confidence: number;
  closest_matches: Match[];
  writing_signals: Signal[];
  word_count: number;
  recognized_features: number;
  created_at?: string;
  is_accurate?: boolean | null;
};

export default function ResultReport({
  report,
  compact = false,
}: {
  report: Report;
  compact?: boolean;
}) {
  const profile = personalityProfiles[report.predicted_type];
  const percent = Math.round(report.confidence * 100);

  const level =
    percent >= 60 ? "High" : percent >= 30 ? "Moderate" : "Low";

  const [feedback, setFeedback] = useState<boolean | null>(
    report.is_accurate ?? null
  );

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);

  async function submitFeedback(isAccurate: boolean) {
    try {
      setSavingFeedback(true);
      setFeedbackMessage("");

      await apiFetch(`/predictions/${report.id}/feedback`, {
  method: "PATCH",
  body: JSON.stringify({
    is_accurate: isAccurate,
  }),
});

      setFeedback(isAccurate);
      setFeedbackMessage("✓ Feedback saved successfully.");
    } catch (error) {
      console.error("Feedback error:", error);

      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : "Could not save feedback."
      );
    } finally {
      setSavingFeedback(false);
    }
  }

  return (
    <div className={`report theme-${profile.theme}`}>
      <section className="resultHero card reveal">
        <span className="resultEmoji">{profile.emoji}</span>
        <span className="eyebrow">Your personality report</span>

        <h1>
          Your closest match is <strong>{profile.type}</strong>
        </h1>

        <h2>“The {profile.name}”</h2>

        <p>{profile.summary}</p>

        <div className="confidenceBlock">
          <div className="confidenceHeader">
            <strong>Prediction confidence</strong>

            <span>
              {percent}% · {level}
            </span>
          </div>

          <div className="confidenceTrack">
            <div
              className="confidenceFill"
              style={{
                width: `${Math.max(percent, 3)}%`,
              }}
            />
          </div>

          {percent < 30 && (
            <small>
              Low confidence means the top types were close. A longer, more
              detailed response may produce a clearer result.
            </small>
          )}
        </div>
      </section>

      <section className="card reveal delay1">
        <span className="eyebrow">Model explanation</span>

        <h2>Why this result appeared</h2>

        <p className="disclaimer">
          These are understandable writing signals, not a psychological
          diagnosis or proof of personality.
        </p>

        <div className="signalGrid">
          {report.writing_signals.map((signal) => (
            <article className="signal" key={signal.name}>
              <span>{signal.icon}</span>

              <div>
                <h3>{signal.name}</h3>

                <p>{signal.description}</p>

                {signal.matched_words.length > 0 && (
                  <small>
                    Recognized examples: {signal.matched_words.join(", ")}
                  </small>
                )}
              </div>
            </article>
          ))}
        </div>

        <small>
          The model recognized {report.recognized_features} TF-IDF features
          across {report.word_count} words.
        </small>
      </section>

      <section className="card reveal delay2">
        <span className="eyebrow">Closest matches</span>

        <h2>How the model ranked the top types</h2>

        <div className="matchList">
          {report.closest_matches.map((match) => (
            <div className="matchRow" key={match.type}>
              <Link href={`/explore#${match.type}`}>
                <strong>{match.type}</strong> ·{" "}
                {personalityProfiles[match.type].name}
              </Link>

              <div className="miniTrack">
                <span
                  style={{
                    width: `${Math.max(match.confidence * 100, 2)}%`,
                  }}
                />
              </div>

              <b>{Math.round(match.confidence * 100)}%</b>
            </div>
          ))}
        </div>
      </section>

      {!compact && (
        <section className="card feedbackSection reveal delay3">
          <span className="eyebrow">Help improve the model</span>

          <h2>Did this result feel accurate?</h2>

          <div className="feedbackButtons">
            <button
              type="button"
              className={`feedbackYes ${
                feedback === true ? "feedbackSelectedYes" : ""
              }`}
              disabled={savingFeedback}
              onClick={() => submitFeedback(true)}
            >
              {feedback === true ? "✓ Yes" : "Yes"}
            </button>

            <button
              type="button"
              className={`feedbackNo ${
                feedback === false ? "feedbackSelectedNo" : ""
              }`}
              disabled={savingFeedback}
              onClick={() => submitFeedback(false)}
            >
              {feedback === false ? "✓ No" : "No"}
            </button>
          </div>

          {savingFeedback && (
            <p className="feedbackMessage">Saving feedback...</p>
          )}

          {!savingFeedback && feedbackMessage && (
            <p className="feedbackMessage">{feedbackMessage}</p>
          )}
        </section>
      )}

      {!compact && (
        <>
          <section className="profileGrid reveal delay3">
            <article className="card">
              <span className="eyebrow">Natural strengths</span>

              <ul className="checkList">
                {profile.strengths.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
            </article>

            <article className="card">
              <span className="eyebrow">Growth areas</span>

              <ul>
                {profile.growthAreas.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="card">
              <span className="eyebrow">Career environments</span>

              <ul>
                {profile.careers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="profileGrid">
            <article className="card">
              <h3>Communication style</h3>
              <p>{profile.communication}</p>
            </article>

            <article className="card">
              <h3>Work style</h3>
              <p>{profile.workStyle}</p>
            </article>

            <article className="card">
              <h3>Relationships</h3>
              <p>{profile.relationships}</p>
            </article>
          </section>

          <blockquote className="quoteCard">
            “{profile.quote}”
          </blockquote>
        </>
      )}
    </div>
  );
}

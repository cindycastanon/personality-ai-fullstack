import Link from "next/link";

export default function Home() {
  return (
    <section className="hero">
      <span className="eyebrow">
        AI-powered personality analysis
      </span>

      <h1>
        Discover your personality through the power of AI.
      </h1>

      <p>
        PersonalityAI analyzes your writing using a trained machine
        learning model to predict your MBTI personality type.
        Receive a detailed report, confidence score, save your
        history, and track your results over time.
      </p>

      <div className="actions">
        <Link className="button" href="/register">
          Get Started
        </Link>

        <Link className="secondaryButton" href="/predict">
          Try Demo
        </Link>
      </div>

      <div className="featureGrid">
        <article className="card">
          <h3>🧠 AI Personality Prediction</h3>

          <p>
            A PyTorch neural network analyzes your writing and
            predicts one of the 16 Myers-Briggs personality types.
          </p>
        </article>

        <article className="card">
          <h3>📈 Personal Dashboard</h3>

          <p>
            View analytics including confidence scores, personality
            distribution, prediction history, and community feedback.
          </p>
        </article>

        <article className="card">
          <h3>🔒 Secure Accounts</h3>

          <p>
            Create an account, securely save your predictions, and
            access them anytime with JWT authentication.
          </p>
        </article>
      </div>

      <div
        className="card"
        style={{
          marginTop: "4rem",
          textAlign: "center",
        }}
      >
        <span className="eyebrow">
          HOW IT WORKS
        </span>

        <h2>Three simple steps</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          <div>
            <h3>✍️ Write</h3>

            <p>
              Describe yourself in at least 25 words.
            </p>
          </div>

          <div>
            <h3>🤖 Analyze</h3>

            <p>
              Our machine learning model evaluates your writing.
            </p>
          </div>

          <div>
            <h3>📄 Explore</h3>

            <p>
              Receive a detailed personality report with confidence
              scores and save it to your history.
            </p>
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginTop: "3rem",
          textAlign: "center",
        }}
      >
        <h2>Ready to discover your personality?</h2>

        <p>
          Start your first AI-powered personality analysis today.
        </p>

        <div
          style={{
            marginTop: "1.5rem",
          }}
        >
          <Link
            className="button"
            href="/predict"
          >
            Start Analysis
          </Link>
        </div>
      </div>
    </section>
  );
}

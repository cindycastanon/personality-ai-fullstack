import Link from "next/link";

export default function Home() {
  return (
    <section className="hero">
      <span className="eyebrow">AI-powered personality insights</span>
      <h1>Turn your writing into an MBTI prediction.</h1>
      <p>Submit a thoughtful description, receive a model prediction with confidence, and save your results securely.</p>
      <div className="actions"><Link className="button" href="/register">Get started</Link><Link className="secondaryButton" href="/predict">Try prediction</Link></div>
      <div className="featureGrid">
        <article className="card"><h3>PyTorch inference</h3><p>A trained neural network classifies text into one of 16 MBTI types.</p></article>
        <article className="card"><h3>Private history</h3><p>Authenticated users can save, review, and delete past predictions.</p></article>
        <article className="card"><h3>Feedback loop</h3><p>Mark results accurate or inaccurate to support future model evaluation.</p></article>
      </div>
    </section>
  );
}

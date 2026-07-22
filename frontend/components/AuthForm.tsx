"use client";

import { apiFetch, saveToken } from "@/lib/api";
import { FormEvent, useState } from "react";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await apiFetch<{ access_token: string }>(`/auth/${mode}`, {
        method: "POST", body: JSON.stringify({ email, password }),
      });
      saveToken(data.access_token);
      location.href = "/predict";
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to continue."); }
    finally { setLoading(false); }
  }

  return (
    <form className="form card narrow" onSubmit={submit}>
      <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      {error && <p className="error">{error}</p>}
      <button className="button" disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Login" : "Register"}</button>
    </form>
  );
}

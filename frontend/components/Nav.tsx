"use client";

import Link from "next/link";
import { clearToken, getToken } from "@/lib/api";
import { useEffect, useState } from "react";

export default function Nav() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => setLoggedIn(Boolean(getToken())), []);

  return (
    <nav className="nav">
      <Link href="/" className="brand">PersonalityAI</Link>
      <div className="navLinks">
        <Link href="/predict">Predict</Link>
        <Link href="/history">History</Link>
        {loggedIn ? (
          <button className="linkButton" onClick={() => { clearToken(); location.href = "/login"; }}>Logout</button>
        ) : (
          <><Link href="/login">Login</Link><Link className="button small" href="/register">Create account</Link></>
        )}
      </div>
    </nav>
  );
}

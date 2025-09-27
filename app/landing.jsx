"use client";
import { useState } from "react";
import { useEmail } from "../components/Providers";

export default function Landing({ onSubmit }) {
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");
  const { setEmail } = useEmail();

  function handleSubmit(e) {
    e.preventDefault();
    if (!emailInput.trim()) {
      setError("Please enter your email.");
      return;
    }
    setError("");
    setEmail(emailInput.trim());
    if (onSubmit) onSubmit({ email: emailInput.trim() });
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f7f8fa" }}>
      <div style={{ background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 2px 16px #0001", minWidth: 320 }}>
        <h1 style={{ marginBottom: 24, fontWeight: 700, fontSize: 28 }}>Welcome to QS Skills Chart</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email" style={{ fontSize: 16, marginBottom: 8, display: "block" }}>Enter your email to begin:</label>
          <input
            id="email"
            type="email"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", fontSize: 16, borderRadius: 6, border: "1px solid #ccc", marginBottom: 12 }}
            autoFocus
          />
          {error && <div style={{ color: "#d33", fontSize: 13, marginBottom: 8 }}>{error}</div>}
          <button type="submit" style={{ width: "100%", padding: "10px 0", fontSize: 16, borderRadius: 6, background: "#4269D0", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Start</button>
        </form>
      </div>
    </div>
  );
}

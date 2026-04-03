"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// global-error wraps the root layout, so it must include <html> and <body>.
// Tailwind classes may not be available here — use inline styles for reliability.
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#f0fdfa", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: "0 16px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#0d9488", marginBottom: 8 }}>Fitlyst</h1>
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", padding: 40 }}>
            <p style={{ fontSize: "3rem", marginBottom: 16 }}>⚠️</p>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111827", marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: 32 }}>
              A critical error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{ background: "#0d9488", color: "#fff", fontWeight: 600, padding: "12px 24px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: "0.95rem" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

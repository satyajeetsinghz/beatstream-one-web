import React    from "react";
import ReactDOM from "react-dom/client";
import App       from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// ── Service Worker registration ───────────────────────────────────────────────
// Enables offline support, background caching, and is required for the PWA
// install prompt to appear on Android / Chrome / Edge.
//
// The SW is only registered in production — in development the SW can cause
// confusing caching behaviour that hides code changes.
//
// If you're using Vite + vite-plugin-pwa, remove this block and configure
// the plugin in vite.config.ts instead — it generates the SW automatically.
// ─────────────────────────────────────────────────────────────────────────────
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        console.info("[BeatStream] Service worker registered:", reg.scope);
      })
      .catch((err) => {
        // Non-fatal — app works without a SW, just no offline support
        console.warn("[BeatStream] Service worker registration failed:", err);
      });
  });
}
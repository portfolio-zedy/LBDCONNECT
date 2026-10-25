"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production builds only (PWA installability
 * + basic offline fallback). Dev is left untouched to avoid Turbopack HMR
 * cache weirdness.
 */
export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);
  return null;
}

import type { MetadataRoute } from "next";

/**
 * PWA manifest — makes the app installable ("Add to Home Screen") and lets
 * PWABuilder package it as a real Android APK.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LBD Nation Connect — Bethel",
    short_name: "LBD Connect",
    description:
      "Living by God's Design. Welcome to Bethel — the Online Prayer House. Pray · Grow · Connect · Fulfil.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf9f4",
    theme_color: "#c7590e",
    icons: [
      {
        src: "/images/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

import express, { type Express } from "express";
import path from "path";

// Simplified logger function for Netlify
export function log(message: string, source = "netlify") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// In Netlify Functions, we don't need setupVite at all
export function setupVite(_app: Express) {
  // This is intentionally empty as we don't need Vite in production
  log("Vite setup skipped in Netlify environment");
  return Promise.resolve();
}

// We also don't need to serve static files in Netlify Functions
export function serveStatic(_app: Express) {
  // This is intentionally empty as static files are handled by Netlify
  log("Static file serving skipped in Netlify environment");
}
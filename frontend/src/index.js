import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
import "@/index.css";
import App from "@/App";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch((error) => {
        console.error("Service worker cleanup failed", error);
      });

    if (window.caches) {
      window.caches
        .keys()
        .then((keys) => Promise.all(keys.filter((key) => key.startsWith("vaal-vibes-shell")).map((key) => window.caches.delete(key))))
        .catch((error) => {
          console.error("Cache cleanup failed", error);
        });
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);

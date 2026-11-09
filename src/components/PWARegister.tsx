"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Proje Notları PWA Service Worker devrede:", registration.scope);

            // Periodic background check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                    console.log("Yeni bir sürüm mevcut. Yenileniyor...");
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn("PWA Service Worker kaydı yapılamadı:", err);
          });
      });
    }
  }, []);

  return null;
}

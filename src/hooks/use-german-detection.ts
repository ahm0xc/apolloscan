"use client";

import { useEffect, useState } from "react";

export function useGermanDetection() {
  const [isGermanUser, setIsGermanUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectGermanUser = async () => {
      try {
        // INFO: check browser language first
        const language = navigator.language || navigator.languages?.[0] || "";
        const isGermanLanguage = language.toLowerCase().includes("de");

        if (isGermanLanguage) {
          setIsGermanUser(true);
          setLoading(false);
          return;
        }

        // INFO: fallback to ip-based detection if available
        try {
          const response = await fetch("/api/detect-country");
          const data = await response.json();
          if (data.country === "DE") {
            setIsGermanUser(true);
          }
        } catch (error) {
          console.log("Country detection failed, using language only");
        }
      } catch (error) {
        console.log("German detection error:", error);
      } finally {
        setLoading(false);
      }
    };

    detectGermanUser();
  }, []);

  return { isGermanUser, loading };
}

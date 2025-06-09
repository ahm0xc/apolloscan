"use client";

import { useEffect, useState } from "react";

import { Languages, X } from "lucide-react";

import { Button } from "./ui/button";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function AutoTranslate() {
  const [showTranslate, setShowTranslate] = useState(false);
  const [isGermanUser, setIsGermanUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectGermanUser = async () => {
      try {
        // INFO: check browser language first
        const language = navigator.language || navigator.languages?.[0] || "";
        const isGermanLanguage = language.toLowerCase().includes("de");

        // INFO: check if user dismissed translation before
        const dismissed = localStorage.getItem("translate-dismissed");
        if (dismissed) {
          setIsLoading(false);
          return;
        }

        if (isGermanLanguage) {
          setIsGermanUser(true);
          setShowTranslate(true);
          setIsLoading(false);
          return;
        }

        // INFO: fallback to server-side detection
        try {
          const response = await fetch("/api/detect-country");
          const data = await response.json();
          if (data.isGerman) {
            setIsGermanUser(true);
            setShowTranslate(true);
          }
        } catch (error) {
          console.log("Country detection failed, using language only");
        }
      } catch (error) {
        console.log("German detection error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    detectGermanUser();
  }, []);

  const handleTranslate = () => {
    // INFO: add google translate script and trigger translation
    if (!document.getElementById("google_translate_element")) {
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.head.appendChild(script);

      // INFO: initialize google translate
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "de,en",
            autoDisplay: false,
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );

        // INFO: auto-trigger german translation
        setTimeout(() => {
          const select = document.querySelector(
            ".goog-te-combo"
          ) as HTMLSelectElement;
          if (select) {
            select.value = "de";
            select.dispatchEvent(new Event("change"));
          }
        }, 1000);
      };
    } else {
      // INFO: if already loaded, just trigger translation
      const select = document.querySelector(
        ".goog-te-combo"
      ) as HTMLSelectElement;
      if (select) {
        select.value = "de";
        select.dispatchEvent(new Event("change"));
      }
    }

    setShowTranslate(false);
    localStorage.setItem("translate-accepted", "true");
  };

  const handleDismiss = () => {
    localStorage.setItem("translate-dismissed", "true");
    setShowTranslate(false);
  };

  // INFO: don't show anything while loading
  if (isLoading) {
    return <div id="google_translate_element" className="hidden"></div>;
  }

  if (!isGermanUser || !showTranslate) {
    return <div id="google_translate_element" className="hidden"></div>;
  }

  return (
    <>
      <div id="google_translate_element" className="hidden"></div>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm mx-4 animate-in slide-in-from-top duration-300">
        <div className="flex items-start gap-3">
          <Languages className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-2">
              Möchten Sie diese Seite ins Deutsche übersetzen?
            </p>
            <p className="text-xs text-blue-100 mb-3">
              Would you like to translate this page to German?
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleTranslate}
                size="sm"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Ja, übersetzen
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-blue-700"
              >
                Nein
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-gray-200 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

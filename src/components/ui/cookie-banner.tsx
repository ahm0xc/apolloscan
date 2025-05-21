"use client";

import { useEffect, useState } from "react";

import { Cookie, X } from "lucide-react";

import { Button } from "./button";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-5 rounded-lg border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-lg shadow-indigo-100/50">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-2 text-white">
          <Cookie size={18} />
        </div>
        <div className="flex-1">
          <div className="mb-3 text-sm font-semibold text-indigo-700">
            Cookie Notice
          </div>
          <p className="mb-4 text-xs text-indigo-600/80">
            We use cookies to enhance your browsing experience and analyze our
            traffic.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={declineCookies}
                className="h-8 border-indigo-200 bg-white text-xs text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
              >
                Decline
              </Button>
              <Button
                size="sm"
                onClick={acceptCookies}
                className="h-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-xs text-white hover:from-indigo-600 hover:to-purple-600"
              >
                Accept
              </Button>
            </div>
            <button
              onClick={declineCookies}
              className="rounded-full p-1.5 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

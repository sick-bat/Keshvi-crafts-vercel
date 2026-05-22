"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { ANALYTICS_CONSENT_KEY, pushToDataLayer } from "@/lib/analytics";

const GTM_ID = "GTM-MFVDFHT3";

export default function ConsentManager() {
  const [consent, setConsent] = useState<"unknown" | "granted" | "denied">("unknown");

  useEffect(() => {
    const saved = localStorage.getItem(ANALYTICS_CONSENT_KEY);
    if (saved === "granted" || saved === "denied") {
      setConsent(saved);
    }

    const browserWindow = window as typeof window & { dataLayer?: unknown[] };
    browserWindow.dataLayer = browserWindow.dataLayer || [];
    browserWindow.dataLayer.push({
      event: "default_consent",
      analytics_storage: saved === "granted" ? "granted" : "denied",
      ad_storage: "denied",
    });
  }, []);

  const updateConsent = (next: "granted" | "denied") => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, next);
    setConsent(next);
    pushToDataLayer({
      event: "consent_update",
      analytics_storage: next,
      ad_storage: "denied",
    });
  };

  return (
    <>
      {consent === "granted" && (
        <Script id="gtm-consented" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
      )}

      {consent === "unknown" && (
        <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
          <p>
            We use analytics cookies to understand shopping journeys and improve Keshvi Crafts. Essential cart and checkout storage still works without analytics.
          </p>
          <div className="cookie-banner-actions">
            <button type="button" onClick={() => updateConsent("denied")} className="cookie-btn secondary">
              Decline
            </button>
            <button type="button" onClick={() => updateConsent("granted")} className="cookie-btn primary">
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}

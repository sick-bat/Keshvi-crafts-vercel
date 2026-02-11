import "./globals.css";
import "./utilities.css";
import Script from "next/script";
import BootstrapNavbar from "@/components/BootstrapNavbar";
import TrustBar from "@/components/TrustBar";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import JsonLd from "@/components/JsonLd";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export const metadata = {
  metadataBase: new URL("https://keshvicrafts.com"),
  title: {
    default: "Keshvi Crafts | Handmade Crochet, Artisanal Home Decor & luxury Gifts",
    template: "%s | Keshvi Crafts",
  },
  description: "Discover Keshvi Crafts for exquisite handmade crochet, artisanal home decor, and sustainable luxury gifts. Made to order in India with premium quality and care.",
  keywords: ["handmade crochet", "artisanal home decor", "luxury sustainable gifts", "custom crochet India", "handcrafted gifts", "crochet flowers", "handmade keychains"],
  openGraph: {
    title: "Keshvi Crafts | Handmade Crochet & Artisanal Decor",
    description: "Premium handmade crochet items and sustainable gifts. Crafted with love in India.",
    url: "https://keshvi-crafts-vercel.vercel.app", // Fallback or main URL
    siteName: "Keshvi Crafts",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Bootstrap CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        />
      </head>
      <body className="bg-cream text-dark">
        <AnalyticsTracker />
        <TrustBar />
        <BootstrapNavbar />

        {/* Remove .container here so hero can be full width */}
        {children}

        <Footer />

        <Toast />

        {/* Bootstrap JS */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Keshvi Crafts",
            "image": "https://keshvicrafts.com/logo.png", // Assuming a logo exists or general image
            "description": "Handmade crochet and artisanal home decor, crafted with care in India.",
            "url": "https://keshvicrafts.com",
            "telephone": "+917507996961",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "IN"
            },
            "priceRange": "₹₹",
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
              ],
              "opens": "09:00",
              "closes": "18:00"
            },
            "sameAs": [
              "https://instagram.com/keshvi_craft"
            ]
          }}
        />
      </body>
    </html>
  );
}

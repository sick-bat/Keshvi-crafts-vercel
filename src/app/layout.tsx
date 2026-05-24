import "./globals.css";
import "./utilities.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/components/CartDrawer.css";
import BootstrapNavbar from "@/components/BootstrapNavbar";
import TrustBar from "@/components/TrustBar";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import CartDrawer from "@/components/CartDrawer";
import JsonLd from "@/components/JsonLd";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import ConsentManager from "@/components/ConsentManager";

export const metadata = {
  metadataBase: new URL("https://www.keshvicrafts.in"),
  title: {
    default: "Keshvi Crafts | Handmade Crochet, Artisanal Home Decor & luxury Gifts",
    template: "%s | Keshvi Crafts",
  },
  description: "Discover Keshvi Crafts for exquisite handmade crochet, artisanal home decor, and sustainable luxury gifts. Made to order in India with premium quality and care.",
  keywords: ["handmade crochet", "artisanal home decor", "luxury sustainable gifts", "custom crochet India", "handcrafted gifts", "crochet flowers", "handmade keychains"],
  openGraph: {
    title: "Keshvi Crafts | Handmade Crochet & Artisanal Decor",
    description: "Premium handmade crochet items and sustainable gifts. Crafted with love in India.",
    url: "https://www.keshvicrafts.in",
    siteName: "Keshvi Crafts",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.keshvicrafts.in/uploads/hero/Top_brown.png",
        width: 1200,
        height: 630,
        alt: "Keshvi Crafts - Handmade Crochet",
      }
    ],
  },
  alternates: {
    canonical: "https://www.keshvicrafts.in",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-cream text-dark">
        <ConsentManager />
        <AnalyticsTracker />
        <TrustBar />
        <BootstrapNavbar />

        {/* Remove .container here so hero can be full width */}
        {children}

        <Footer />

        <Toast />
        <CartDrawer />

        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Keshvi Crafts",
            "image": "https://www.keshvicrafts.in/uploads/hero/logo.png",
            "description": "Handmade crochet and artisanal home decor, crafted with care in India.",
            "url": "https://www.keshvicrafts.in",
            "telephone": "+917310045515",
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

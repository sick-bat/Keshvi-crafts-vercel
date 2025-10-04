import "./globals.css";
import Script from "next/script";
import BootstrapNavbar from "@/components/BootstrapNavbar";

export const metadata = {
  metadataBase: new URL("https://keshvicrafts.com"),
  title: "Keshvi Crafts",
  description: "Handmade crochet & artisanal pieces. Made-to-order, crafted in India.",
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
        <BootstrapNavbar />

        {/* Remove .container here so hero can be full width */}
        {children}

        {/* Bootstrap JS */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

"use client";
import Link from "next/link";
import "./HeroSection.css";

export default function HeroSection() {
  return (
    <div className="hero">
      <section className="hero-grid">
        <div className="copy">
          <h1>
            Handmade Crochet
            <br />
            Gifts, Made to Order
          </h1>
          <p className="sub">
            Premium keyrings, flowers, bags, decor, and custom crochet pieces made with care in India.
          </p>
          <Link href="/collections" className="cta">
            Shop Handmade Gifts
          </Link>
          <div className="hero-trust" aria-label="Keshvi Crafts promises">
            <span>Made to order</span>
            <span>Handcrafted in India</span>
            <span>Ships in 3 business days</span>
          </div>
        </div>

        <div
          className="photo"
          role="img"
          aria-label="Model wearing handmade crochet top"
        ></div>
      </section>
    </div>
  );
}

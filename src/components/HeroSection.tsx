"use client";
import Image from "next/image";
import Link from "next/link";
import "./HeroSection.css";

export default function HeroSection() {
  return (
    <main className="hero">
      <section className="hero-grid">
        <div className="copy">
          <h1>
            Comfort
            <br />
            Crafted
            <br />
            with Care
          </h1>
          <p className="sub">Wrap them in warmth that lasts</p>
          <Link href="/products/Stripes_top" className="cta">
            Shop Now
          </Link>
        </div>

        <div
          className="photo"
          role="img"
          aria-label="Model wearing handmade crochet top"
        ></div>
      </section>
    </main>
  );
}

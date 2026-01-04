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
          <p className="sub">Handmade crochet gifts & home decor, made to order across India</p>
          <Link href="/collections" className="cta">
            Browse Collections
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

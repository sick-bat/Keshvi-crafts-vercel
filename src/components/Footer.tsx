"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* About */}
          <div className="footer-section">
            <h3 className="footer-title">About Keshvi Crafts</h3>
            <p className="footer-text">
              Handmade crochet and artisanal pieces crafted with care in India.
              Each item is made to order, ensuring quality and thoughtfulness in every stitch.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/collections">Collections</Link></li>
              <li><Link href="/wishlist">Wishlist</Link></li>
              <li><Link href="/cart">Cart</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="footer-section">
            <h3 className="footer-title">Policies</h3>
            <ul className="footer-links">
              <li><Link href="/shipping">Shipping Policy</Link></li>
              <li><Link href="/returns">Return & Exchange Policy</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-title">Contact Us</h3>
            <ul className="footer-links">
              <li><Link href="/contact">Contact Page</Link></li>
              <li>
                <a href="https://wa.me/+917507996961" target="_blank" rel="noopener noreferrer">
                  WhatsApp Support
                </a>
              </li>
              <li>
                <a href="mailto:KESHVICRAFTS@gmail.com">Email Us</a>
              </li>
            </ul>
            <div className="footer-social" style={{ marginTop: "1rem" }}>
              <span className="footer-text" style={{ marginBottom: "0.5rem", display: "block" }}>
                Follow Us
              </span>
              <div style={{ display: "flex", gap: "0.8rem" }}>
                <a href="https://www.instagram.com/keshvi_crafts/" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-link">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Keshvi Crafts. All rights reserved.
          </p>
          <p className="footer-text" style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
            Handmade with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  );
}



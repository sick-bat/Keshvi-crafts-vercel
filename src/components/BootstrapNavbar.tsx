"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import CartBadge from "@/components/CartBadge";
import "./Navbar.css";

export default function BootstrapNavbar() {
  const pathname = usePathname();

  const isActive = (href: string): boolean =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href) ?? false;


  return (
    <nav className="keshvi-nav">
      <div className="nav-inner">
        {/* === Left side: Brand === */}
        <Link href="/" className="brand" aria-label="Keshvi Crafts — Home">
          <Image
            src="/uploads/hero/logo.png"
            alt="Keshvi Crafts Logo"
            width={100}
            height={100}
            className="logo-img"
            style={{
              objectFit: "contain",
              width: "90px", // Reduced slightly via CSS to keep sharp but large
              height: "90px",
              marginTop: "30px", // Pushes logo down to overlap
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" // Add depth for overlap
            }}
          />
          {/* wordmark removed as requested */}
        </Link>

        {/* === Right side: Navigation with icons + labels === */}
        <div className="nav-icons">
          <Link href="/" className={`nav-item ${isActive("/") ? "active" : ""}`} title="Home">
            <Image
              src="/uploads/hero/home.png"
              alt="Home"
              width={20}
              height={20}
              className="nav-icon"
            />
            <span className="nav-label">Home</span>
          </Link>

          <Link href="/collections" className={`nav-item ${isActive("/collections") ? "active" : ""}`} title="Collections">
            <Image
              src="/uploads/hero/collections.png"
              alt="Collections"
              width={20}
              height={20}
              className="nav-icon"
            />
            <span className="nav-label">Collections</span>
          </Link>

          <Link href="/wishlist" className={`nav-item ${isActive("/wishlist") ? "active" : ""}`} title="Wishlist">
            <Image
              src="/uploads/hero/wishlist.png"
              alt="Wishlist"
              width={20}
              height={20}
              className="nav-icon"
            />
            <span className="nav-label">Wishlist</span>
          </Link>

          {/* === Cart with badge === */}
          <Link href="/cart" className={`nav-item cart ${isActive("/cart") ? "active" : ""}`} title="Cart">
            <div className="cart-wrapper">
              <Image
                src="/uploads/hero/cart.png"
                alt="Cart"
                width={20}
                height={20}
                className="nav-icon"
              />
              <span className="cart-badge">
                <CartBadge />
              </span>
            </div>
            <span className="nav-label">Cart</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import CartBadge from "@/components/CartBadge";
import "./Navbar.css";

export default function BootstrapNavbar() {
  const pathname = usePathname();
  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <nav className="keshvi-nav">
      <div className="nav-inner">
        {/* === Left side: Brand === */}
        <Link href="/" className="brand" aria-label="Keshvi Crafts — Home">
          <span className="logo">
            <Image src="/uploads/hero/logo.png" alt="Keshvi Crafts Logo" width={28} height={28} />
          </span>
          <span className="wordmark">Keshvi Crafts</span>
        </Link>

        {/* === Right side: Icons === */}
        <div className="nav-icons">
          <Link href="/" title="Home">
            <Image
              src="/uploads/hero/home.png"
              alt="Home"
              width={22}
              height={22}
              className={`icon ${isActive("/") ? "active" : ""}`}
            />
          </Link>

          <Link href="/profile" title="Profile">
            <Image
              src="/uploads/hero/profile.png"
              alt="Profile"
              width={22}
              height={22}
              className={`icon ${isActive("/profile") ? "active" : ""}`}
            />
          </Link>

          <Link href="/collections" title="Collections">
            <Image
              src="/uploads/hero/collections.png"
              alt="Collections"
              width={22}
              height={22}
              className={`icon ${isActive("/collections") ? "active" : ""}`}
            />
          </Link>

          <Link href="/wishlist" title="Wishlist">
            <Image
              src="/uploads/hero/wishlist.png"
              alt="Wishlist"
              width={22}
              height={22}
              className={`icon ${isActive("/wishlist") ? "active" : ""}`}
            />
          </Link>

          {/* === Cart with badge === */}
          <Link href="/cart" title="Cart" className="cart">
            <Image
              src="/uploads/hero/cart.png"
              alt="Cart"
              width={22}
              height={22}
              className={`icon ${isActive("/cart") ? "active" : ""}`}
            />
            <span className="cart-badge">
              <CartBadge />
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CartBadge from "@/components/CartBadge";

export default function BootstrapNavbar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white sticky-top border-bottom">
      <div className="container">
        <Link className="navbar-brand fw-bold" href="/">
          Keshvi Crafts
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto mb-2 mb-md-0">
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/") ? "active" : ""}`} href="/">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/collections") ? "active" : ""}`}
                href="/collections"
              >
                Collections
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/wishlist") ? "active" : ""}`}
                href="/wishlist"
              >
                Wishlist
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link d-flex align-items-center ${
                  isActive("/cart") ? "active" : ""
                }`}
                href="/cart"
              >
                Cart
                <span className="ms-1 badge rounded-pill bg-dark">
                  <CartBadge />
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

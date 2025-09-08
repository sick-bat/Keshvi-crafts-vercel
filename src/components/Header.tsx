"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import CartBadge from "@/components/CartBadge";

const links = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collections" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/cart", label: "Cart" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  return (
    <header className="site-header">
      <div className="container flex h-14 items-center gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="font-bold text-lg tracking-wide"
          aria-label="Keshvi Crafts Home"
        >
          Keshvi Crafts
        </Link>

        {/* Desktop nav */}
        <nav className="ml-auto hidden md:flex items-center gap-7">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${isActive(href) ? "nav-link--active" : ""}`}
            >
              {label}
              {href === "/cart" && (
                <span className="ml-1 inline-flex items-center justify-center">
                  <CartBadge />
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="ml-auto md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-neutral-300/70 bg-white hover:bg-neutral-50"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t border-neutral-200/60 bg-white/90 backdrop-blur">
          <div className="container py-3 flex flex-col gap-3">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link ${isActive(href) ? "nav-link--active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span className="text-base">{label}</span>
                {href === "/cart" && (
                  <span className="ml-2 inline-flex items-center justify-center align-middle">
                    <CartBadge />
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

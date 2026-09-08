"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV_LINKS = [
  { href: "/problems", label: "Problems" },
  { href: "/rooms", label: "Rooms" },
  { href: "/community", label: "Community" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-arena-bg/80 backdrop-blur border-b border-arena-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-brand-500">{"</>"}</span>
          <span>CodeArena</span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname.startsWith(l.href)
                  ? "bg-arena-surface text-white"
                  : "text-arena-muted hover:text-white hover:bg-arena-surface"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link href="/profile" className="btn-ghost text-sm py-1.5">
            Profile
          </Link>
          <button className="btn-primary text-sm py-1.5">Sign In</button>
        </div>
      </div>
    </nav>
  );
}

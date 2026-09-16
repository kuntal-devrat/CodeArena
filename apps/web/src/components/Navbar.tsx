"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Code2, Sparkles, Shuffle } from "lucide-react";

const NAV_LINKS = [
  { href: "/problems", label: "Problems" },
  { href: "/submissions", label: "Submissions" },
  { href: "/rooms", label: "Rooms" },
  { href: "/community", label: "Community" },
];

export function Navbar() {
  const pathname = usePathname();

  // If inside the fullscreen problem workspace, don't show the global navbar
  if (pathname.startsWith("/problems/") && pathname !== "/problems") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-m3-surface-container/90 backdrop-blur-md border-b border-m3-outline-variant/30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-8 h-8 rounded-xl bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center border border-m3-primary/30 group-hover:scale-105 transition-transform duration-200">
              <Code2 className="w-4.5 h-4.5 text-m3-primary" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-m3-on-surface font-semibold text-[15px] tracking-tight">CodeArena</span>
              <span className="text-[10.5px] font-mono font-medium bg-m3-surface-container-highest text-m3-primary px-2 py-0.5 rounded-full border border-m3-outline-variant/40">
                2,913 Qs
              </span>
            </div>
          </Link>

          {/* Navigation Links - M3 Pill Tabs */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 ease-m3-standard select-none",
                    active
                      ? "bg-m3-secondary-container text-m3-on-secondary-container font-semibold shadow-xs"
                      : "text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container-high"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/problems/two-sum"
            className="m3-btn-outlined text-[12.5px] px-3.5 py-1.5 hidden sm:inline-flex"
          >
            <Shuffle className="w-3.5 h-3.5 text-m3-warning" />
            <span>Quick Practice</span>
          </Link>

          <Link
            href="/problems"
            className="m3-btn-filled text-[12.5px] px-4 py-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Solve Now</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

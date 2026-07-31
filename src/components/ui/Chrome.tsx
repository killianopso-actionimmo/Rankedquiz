"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

/* ==========================================================================
   NAVBAR — fond alternatif, bordure subtile, item actif en cyan
   ======================================================================== */
export function Navbar({
  items,
  activeHref,
  right,
}: {
  items: Array<{ href: string; label: string }>;
  activeHref?: string;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-background-sunken/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-token-6 px-token-4">
        <Logo />
        <ul className="flex flex-1 items-center gap-token-1">
          {items.map((item) => (
            <li key={item.href}>
              <NavLink href={item.href} active={item.href === activeHref}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        {right}
      </nav>
    </header>
  );
}

export function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-10 items-center rounded-md px-token-4 text-sm font-semibold",
        "transition-colors duration-[var(--duration-fast)] ease-token",
        active
          ? "bg-primary text-ink-accent shadow-subtle"
          : "text-ink-soft hover:bg-background-card hover:text-ink",
      )}
    >
      {children}
    </a>
  );
}

/** Zone logo : pastille vanilla + accent cyan. */
export function Logo({ className }: { className?: string }) {
  return (
    <a href="/" className={cn("flex shrink-0 items-center gap-token-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-lg shadow-[inset_0_0_0_2px_rgb(var(--c-cyan))]">
        🎯
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-ink">
        Ranked<span className="text-primary-dark">Quiz</span>
      </span>
    </a>
  );
}

/* ==========================================================================
   FOOTER
   ======================================================================== */
export function Footer({
  columns,
}: {
  columns: Array<{ title: string; links: Array<{ href: string; label: string }> }>;
}) {
  return (
    <footer className="mt-token-8 border-t border-line bg-background-sunken">
      <div className="mx-auto grid max-w-6xl gap-token-8 px-token-4 py-token-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-token-4 max-w-xs text-sm text-ink-soft">
            5 modes de jeu, 3 niveaux de difficulte, un seul classement.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-token-4 text-xs font-bold uppercase tracking-wider text-ink-soft">
              {col.title}
            </h4>
            <ul className="space-y-token-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-ink transition-colors duration-[var(--duration-fast)] hover:text-primary-dark"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-token-4 py-token-4 text-xs text-ink-soft">
          © {new Date().getFullYear()} RankedQuiz — tous droits reserves.
        </p>
      </div>
    </footer>
  );
}

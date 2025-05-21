"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname === "/") return null;

  return (
    <footer className="mt-auto border-t border-border/40 bg-background py-6 text-sm text-muted-foreground">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <div>
          <p>© {currentYear} Apollo Scan. All rights reserved.</p>
        </div>
        <nav className="flex gap-4">
          <Link
            href="/privacy"
            className="transition-colors hover:text-foreground"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-foreground"
          >
            Terms
          </Link>
          <Link
            href="/imprint"
            className="transition-colors hover:text-foreground"
          >
            Imprint
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { SiteAccessRole } from "@/lib/auth";

const baseNavItems = [
  { href: "/", label: "Home" },
  { href: "/studies", label: "Studies" },
  { href: "/calendar", label: "Calendar" },
  { href: "/prayer", label: "Prayer" },
  { href: "/resources", label: "Resources" },
];

const adminNavItem = { href: "/admin", label: "Admin" };

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link href={href} className={isActive ? "nav-link active" : "nav-link"}>
      {label}
    </Link>
  );
}

export function AppChrome({
  children,
  accessRole,
}: {
  children: React.ReactNode;
  accessRole?: SiteAccessRole | null;
}) {
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const hideChrome = pathname.startsWith("/gate");
  const navItems = accessRole === "admin" ? [...baseNavItems, adminNavItem] : baseNavItems;

  useEffect(() => {
    if (mobileMenuRef.current) {
      mobileMenuRef.current.open = false;
    }
  }, [pathname]);

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand">
            <Image src="/lgwc-tree.png" alt="Love & Good Works" width={54} height={54} />
            <h1 className="brand-title">Love & Good Works</h1>
          </Link>

          <nav className="site-nav site-nav-desktop" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          <div className="header-right">
            <details className="site-nav-mobile" ref={mobileMenuRef}>
              <summary aria-label="Open navigation menu">
                <span className="hamburger-icon" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </summary>
              <div className="site-nav-mobile-panel">
                <nav className="site-nav site-nav-dropdown" aria-label="Primary">
                  {navItems.map((item) => (
                    <NavLink key={`mobile-${item.href}`} href={item.href} label={item.label} />
                  ))}
                </nav>
                <form action="/api/auth/logout" method="post" className="site-nav-mobile-signout">
                  <button className="button-outline" type="submit">
                    Sign Out
                  </button>
                </form>
              </div>
            </details>

            <form action="/api/auth/logout" method="post" className="site-signout-desktop">
              <button className="button-outline" type="submit">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container page">{children}</main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>Love & Good Works Club</p>
          <p>Hebrews 10:24-25</p>
        </div>
      </footer>
    </>
  );
}

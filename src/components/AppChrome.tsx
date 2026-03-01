"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/calendar", label: "Calendar" },
  { href: "/studies", label: "Studies" },
  { href: "/prayer", label: "Prayer" },
  { href: "/resources", label: "Resources" },
  { href: "/admin", label: "Admin" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link href={href} className={isActive ? "nav-link active" : "nav-link"}>
      {label}
    </Link>
  );
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/gate");

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

          <nav className="site-nav" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          <form action="/api/auth/logout" method="post">
            <button className="button-outline" type="submit">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <main className="container page">{children}</main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>Love & Good Works</p>
          <p>Hebrews 10:24</p>
        </div>
      </footer>
    </>
  );
}

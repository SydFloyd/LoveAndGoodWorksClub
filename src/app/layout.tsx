import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Lora, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { AppChrome } from "@/components/AppChrome";
import { getAccessRoleFromCookieValue, SITE_AUTH_COOKIE } from "@/lib/auth";

const headingFont = Lora({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Love & Good Works",
    template: "%s | Love & Good Works",
  },
  description:
    "Love & Good Works is focused on Jesus Christ, prayer, Scripture study, and Christian community.",
  icons: {
    icon: [
      { url: "/icon.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=2", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/icon.png?v=2",
    apple: [{ url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" }],
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const accessRole = getAccessRoleFromCookieValue(cookieStore.get(SITE_AUTH_COOKIE)?.value);

  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <AppChrome accessRole={accessRole}>{children}</AppChrome>
      </body>
    </html>
  );
}

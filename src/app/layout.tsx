import type { Metadata } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { AppChrome } from "@/components/AppChrome";

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
    icon: "/lgwc-tree.png",
    shortcut: "/lgwc-tree.png",
    apple: "/lgwc-tree.png",
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}

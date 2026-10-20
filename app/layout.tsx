import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SmoothScrolling } from "@/components/SmoothScrolling/SmoothScrolling";
import JsonLd from "@/components/JsonLd";
import { SITE_GRAPH } from "@/lib/site-structured-data";
import SiteFooter from "@/components/SiteFooter/SiteFooter";

const geistSans = localFont({
  src: "../public/fonts/geist.woff2",
  variable: "--font-geist",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "../public/fonts/jetbrains-mono.woff2",
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

const cormorant = localFont({
  src: "../public/fonts/cormorant.woff2",
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

const newsreader = localFont({
  src: [
    { path: "../public/fonts/newsreader.woff2", style: "normal" },
    { path: "../public/fonts/newsreader-italic.woff2", style: "italic" },
  ],
  variable: "--font-newsreader",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mzfortech.com"),
  title: {
    default: "Model Zero — Software & AI Company in Cairo",
    template: "%s | Model Zero",
  },
  applicationName: "Model Zero",
  description:
    "Model Zero (MZ) is a Cairo-based software and AI company that builds custom systems and trains teams to run them.",
  creator: "Model Zero",
  publisher: "Model Zero",
  openGraph: {
    siteName: "Model Zero",
    images: [{ url: "/og.webp", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.webp"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import { TransitionLink } from "@/components/TransitionLink/TransitionLink";
import Image from "next/image";
import { CustomCursor } from "@/components/CustomCursor/CustomCursor";
import WebMCP from "@/components/WebMCP/WebMCP";
import SiteBackground from "@/components/SiteBackground/SiteBackground";
import GamepadNavigation from "@/components/GamepadNavigation/GamepadNavigation";
import KonamiArcade from "@/components/KonamiArcade/KonamiArcade";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} ${cormorant.variable} ${newsreader.variable}`}
      data-theme="dark"
    >
      <head>
      </head>
      <body>
        <JsonLd data={SITE_GRAPH} />
        <SiteBackground />
        <GamepadNavigation />
        <KonamiArcade />
        <WebMCP />
        <CustomCursor />
        {/* The studio's mark, and the only wordmark on the splash, the privacy
            page and the case study — pages that have no launcher chrome. The
            launcher has its own, centred above the nav.

            Position and size live in CSS (`.layout-logo-link` / `-img` in
            globals.css) rather than in inline styles. They used to be inline,
            which meant the mobile override had to reach in with `!important`
            from a media query to undo them — the classic outcome of a value
            set in the one place that cannot be overridden cleanly. The
            `width`/`height` props here are the intrinsic ratio and nothing
            else; the rendered size is CSS's business. */}
        <TransitionLink href="/" className="layout-logo-link">
          <Image
            src="/model-zero-logo.svg"
            alt="Model Zero logo"
            width={100}
            height={100}
            className="layout-logo-img"
            priority
          />
        </TransitionLink>
        <SmoothScrolling>{children}</SmoothScrolling>
        <SiteFooter />
      </body>
    </html>
  );
}

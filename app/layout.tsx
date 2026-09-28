import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SmoothScrolling } from "@/components/SmoothScrolling/SmoothScrolling";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  weight: ["400", "600"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mzfortech.com"),
  title: {
    default: "MZ — Research, Software and Knowledge",
    template: "%s | MZ",
  },
  applicationName: "MZ",
  description:
    "MZ is a technology engineering studio in Cairo, Egypt, building software and proprietary systems and sharing the research and knowledge behind them.",
  creator: "MZ",
  publisher: "MZ",
  openGraph: {
    siteName: "MZ",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} ${cormorant.variable}`}
      data-theme="dark"
    >
      <head>
      </head>
      <body>
        <SiteBackground />
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
            src="/mz-logo.min.svg"
            alt="MZ"
            width={100}
            height={100}
            className="layout-logo-img"
            priority
          />
        </TransitionLink>
        <SmoothScrolling>{children}</SmoothScrolling>
      </body>
    </html>
  );
}

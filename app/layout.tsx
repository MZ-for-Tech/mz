import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SmoothScrolling } from "@/components/SmoothScrolling/SmoothScrolling";
import { headers } from 'next/headers';
import DocumentLanguage from '@/components/DocumentLanguage';
import Measurement from '@/components/Measurement';

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
  metadataBase: new URL("https://www.mzfortech.com"),
  title: {
    default: "Model Zero for Technology Solutions",
    template: "%s | MZ for Tech",
  },
  applicationName: "MZ",
  description:
    "Model Zero for Technology Solutions (MZ) is a Cairo-based software and AI company that builds custom systems and trains teams to run them.",
  creator: "MZ",
  publisher: "MZ",
  openGraph: {
    siteName: "MZ",
    images: [{ url: "/og.webp", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.webp"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  icons: { apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }] },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Existing URLs have locale below /research rather than a root [lang] segment.
  // The proxy sets this trusted path-derived header for the initial document.
  const locale = (await headers()).get('x-mz-locale') === 'ar' ? 'ar' : 'en';
  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${geistSans.variable} ${jetbrainsMono.variable} ${cormorant.variable}`}
      data-theme="dark"
    >
      <head>
      </head>
      <body>
        <DocumentLanguage />
        <Measurement />
        <a className="skip-link" href="#main-content">{locale === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to content'}</a>
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

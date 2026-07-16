import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SmoothScrolling } from "@/components/SmoothScrolling/SmoothScrolling";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MZ | Research. Software. Knowledge.",
  description: "Research-driven technology company. Cairo, Egypt.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { TransitionLink } from "@/components/TransitionLink/TransitionLink";
import { MzLogo } from "@/components/Logo/MzLogo";
import FpsCounter from "@/components/FpsCounter";
import { CustomCursor } from "@/components/CustomCursor/CustomCursor";

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
      <body>
        <CustomCursor />
        <FpsCounter />
        <TransitionLink href="/" className="layout-logo-link" style={{
          position: 'fixed',
          top: '10px',
          left: '20px',
          zIndex: 9999,
        }}>
          <MzLogo
            width={100}
            height={100}
            className="layout-logo-img"
          />
        </TransitionLink>
        <SmoothScrolling>{children}</SmoothScrolling>
      </body>
    </html>
  );
}

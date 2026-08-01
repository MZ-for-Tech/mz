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
import Image from "next/image";
import FpsCounter from "@/components/FpsCounter";
import { CustomCursor } from "@/components/CustomCursor/CustomCursor";
import WebMCP from "@/components/WebMCP/WebMCP";

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
        <WebMCP />
        <CustomCursor />
        <FpsCounter />
        <TransitionLink href="/" className="layout-logo-link" style={{
          position: 'fixed',
          top: '10px',
          left: '20px',
          zIndex: 9999,
        }}>
          <Image
            src="/mz-logo.min.svg"
            alt="MZ"
            width={100}
            height={100}
            priority
            className="layout-logo-img"
          />
        </TransitionLink>
        <SmoothScrolling>{children}</SmoothScrolling>
      </body>
    </html>
  );
}

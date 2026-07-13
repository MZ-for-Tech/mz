import type { Metadata } from "next";
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

import Link from "next/link";
import Image from "next/image";
import FpsCounter from "@/components/FpsCounter";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} ${cormorant.variable}`}
    >
      <body>
        <FpsCounter />
        <Link href="/" style={{
          position: 'fixed',
          top: '10px',
          left: '20px',
          zIndex: 9999,
          mixBlendMode: 'difference'
        }}>
          <Image
            src="/logo.png"
            alt="MZ Logo"
            width={100}
            height={100}
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </Link>
        <SmoothScrolling>{children}</SmoothScrolling>
      </body>
    </html>
  );
}

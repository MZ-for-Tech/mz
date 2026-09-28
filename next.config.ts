import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const SITE = "https://mzfortech.com";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.1.18", "192.168.1.*", "localhost"],
  // Only ship the drei modules the page actually imports (it exports hundreds).
  experimental: {
    optimizePackageImports: ["@react-three/drei"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    qualities: [70, 75],
  },
  // mz-specific config if any
  async headers() {
    return [
      {
        // ── Immutable static assets — never revalidate
        source: "/hdr/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Static artwork (icons, nested-united assets) — content never
        // changes in place; new versions get new filenames.
        source: "/(icons|nested)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // ── Global security and public discovery headers
        source: "/(.*)",
        headers: [
          // Security
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },

          // ── Public discovery resources ──
          { key: "Link", value: `<${SITE}/sitemap.xml>; rel="sitemap"; type="application/xml"` },
          { key: "Link", value: `<${SITE}/llms.txt>; rel="describedby"; type="text/plain"` },
        ],
      },
      {
        // ── Markdown content negotiation — serve /content.md as text/markdown
        source: "/content.md",
        headers: [
          { key: "Content-Type", value: "text/markdown; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
        ],
      },
      {
        // ── llms.txt served as plain text
        source: "/llms.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  }
};

export default bundleAnalyzer(nextConfig);

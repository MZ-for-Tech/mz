import type { NextConfig } from "next";

const SITE = "https://mzfortech.com";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  // mz-specific config if any
  async headers() {
    return [
      {
        // ── Global headers (security + AI discoverability Link headers)
        source: "/(.*)",
        headers: [
          // Security
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },

          // ── AI / Agent Discoverability Link Headers ──
          // Sitemap
          { key: "Link", value: `<${SITE}/sitemap.xml>; rel="sitemap"; type="application/xml"` },
          // llms.txt — LLM-readable content manifest (llmstxt.org standard)
          { key: "Link", value: `<${SITE}/llms.txt>; rel="describedby"; type="text/plain"` },
          // AI Plugin / Agent card (ChatGPT / OpenAI Actions compatible)
          { key: "Link", value: `<${SITE}/.well-known/ai-plugin.json>; rel="ai-plugin"` },
          // MCP Server Card (Model Context Protocol)
          { key: "Link", value: `<${SITE}/.well-known/mcp.json>; rel="mcp"` },
          // Agent Skills descriptor
          { key: "Link", value: `<${SITE}/.well-known/agent.json>; rel="agent-capabilities"` },
          // OpenAPI catalog for API discovery
          { key: "Link", value: `<${SITE}/.well-known/openapi.json>; rel="api-catalog"` },
          // OAuth Authorization Server discovery
          { key: "Link", value: `<${SITE}/.well-known/oauth-authorization-server>; rel="oauth-authorization-server"` },
          // OAuth Protected Resource
          { key: "Link", value: `<${SITE}/.well-known/oauth-protected-resource>; rel="oauth-protected-resource"` },
          // x402 Payment Required protocol hint
          { key: "X-Payment-Endpoint", value: `${SITE}/.well-known/x402` },
          // Content language signals
          { key: "Content-Language", value: "en-US" },
          // Web Bot Auth signal
          { key: "X-Robots-Tag", value: "index, follow" },
          { key: "X-AI-Accessible", value: "true" },
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
      {
        // ── .well-known JSON files — allow any origin (AI agents need CORS)
        source: "/.well-known/(.*)",
        headers: [
          { key: "Content-Type", value: "application/json; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      }
    ];
  }
};

export default nextConfig;

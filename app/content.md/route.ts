import { discoveryContent } from "@/lib/discovery-content";
export const dynamic = "force-static";
export function GET() { return new Response(discoveryContent(true), { headers: { "Content-Type": "text/markdown; charset=utf-8", "X-Robots-Tag": "noindex, follow" } }); }

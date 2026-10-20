import { discoveryContent } from "@/lib/discovery-content";
export const dynamic = "force-static";
export function GET() { return new Response(discoveryContent(), { headers: { "Content-Type": "text/plain; charset=utf-8" } }); }

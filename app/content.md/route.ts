import { publicSummary } from '@/lib/public-content';

export const dynamic = 'force-static';
export function GET() {
  return new Response(publicSummary(), { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'X-Robots-Tag': 'noindex, follow' } });
}

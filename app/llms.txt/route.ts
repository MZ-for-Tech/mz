import { publicSummary } from '@/lib/public-content';

export const dynamic = 'force-static';
export function GET() {
  return new Response(publicSummary(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

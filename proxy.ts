import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MARKDOWN_PAGES = new Set([
  '/',
  '/home',
  '/work',
  '/work/nested-united',
  '/services',
  '/intel',
  '/contact',
  '/privacy',
  '/research',
  '/research/ar',
]);

function acceptsMarkdown(acceptHeader: string | null) {
  return acceptHeader?.split(',').some((mediaRange) => {
    const [mediaType, ...parameters] = mediaRange.trim().split(';');
    if (mediaType.toLowerCase() !== 'text/markdown') return false;

    const quality = parameters
      .map((parameter) => parameter.trim())
      .find((parameter) => parameter.toLowerCase().startsWith('q='));

    return quality ? Number(quality.slice(2)) > 0 : true;
  }) ?? false;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isResearchArticlePath = pathname.startsWith('/research/') && pathname !== '/research/markdown';
  const isNegotiablePage = MARKDOWN_PAGES.has(pathname) || isResearchArticlePath;
  if (!isNegotiablePage) return NextResponse.next();

  if (request.method === 'GET' && acceptsMarkdown(request.headers.get('accept'))) {
    const destination = pathname.startsWith('/research')
      ? new URL('/research/markdown', request.url)
      : new URL('/content.md', request.url);

    if (pathname.startsWith('/research')) {
      destination.searchParams.set('path', pathname);
    }

    // Redirect to a distinct Markdown URL instead of varying the HTML URL's
    // response body. The redirect is not cacheable, so Accept variants cannot
    // poison a shared cache even if the CDN ignores Vary.
    const response = NextResponse.redirect(destination, 307);
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Vary', 'Accept');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

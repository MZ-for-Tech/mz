import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Check for Content Accessibility — Markdown content negotiation
  const acceptHeader = request.headers.get('accept');
  
  // If the agent is requesting markdown and hitting the root or a page, rewrite to content.md
  if (acceptHeader && acceptHeader.includes('text/markdown')) {
    if ((request.nextUrl.pathname === '/research' || request.nextUrl.pathname.startsWith('/research/'))
      && request.nextUrl.pathname !== '/research/markdown') {
      const researchMarkdownUrl = new URL('/research/markdown', request.url);
      researchMarkdownUrl.searchParams.set('path', request.nextUrl.pathname);
      return NextResponse.rewrite(researchMarkdownUrl, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'x-markdown-tokens': 'true',
        },
      });
    }

    // Rewrite to our static markdown file
    return NextResponse.rewrite(new URL('/content.md', request.url), {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': 'true'
      }
    });
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

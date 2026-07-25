import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for Content Accessibility — Markdown content negotiation
  const acceptHeader = request.headers.get('accept');
  
  // If the agent is requesting markdown and hitting the root or a page, rewrite to content.md
  if (acceptHeader && acceptHeader.includes('text/markdown')) {
    // Rewrite to our static markdown file
    return NextResponse.rewrite(new URL('/content.md', request.url), {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': 'true'
      }
    });
  }

  // Add Link response headers for agent discovery (RFC 8288) to all HTML responses
  const response = NextResponse.next();
  
  // Only add link headers to HTML page requests, not static assets
  if (request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.includes('.')) {
    return response;
  }

  const site = "https://mzltd.tech";
  const links = [
    `<${site}/.well-known/api-catalog>; rel="api-catalog"`,
    `<${site}/.well-known/openapi.json>; rel="service-desc"`,
    `<${site}/.well-known/oauth-authorization-server>; rel="oauth-authorization-server"`,
    `<${site}/.well-known/oauth-protected-resource>; rel="oauth-protected-resource"`,
    `<${site}/sitemap.xml>; rel="sitemap"`,
    `<${site}/llms.txt>; rel="describedby"`
  ];

  response.headers.set('Link', links.join(', '));
  response.headers.set('X-AI-Accessible', 'true');
  
  return response;
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

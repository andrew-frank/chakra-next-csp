import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest): NextResponse<unknown> {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const trustedStyleDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ].join(' ')

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'strict-dynamic' https: http: ${
      process.env.NODE_ENV === 'production'
        ? ''
        : `'unsafe-inline' 'unsafe-eval'`
    } 'nonce-${nonce}';
    style-src 'self' 'unsafe-inline';
    font-src 'self' data: ${trustedStyleDomains};
    img-src 'self' blob: data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
  /**
   * NOTE: the CSP for `style-src` does not fully work with `nonce` and SSR. This is because the `nonce` are hidden on modern browsers.
   * More context:
   *  HTML spec PR: https://github.com/whatwg/html/pull/2373.
   *  Next JS issues: https://github.com/vercel/next.js/issues/63749, https://github.com/vercel/next.js/issues/63015
   *
   * As a result the client gets empty nonce string (browsers strip the nonces) which causes client-server rendering mismatch.
   *
   * Therefore we're using:
   *   style-src 'self' 'unsafe-inline';
   * instead of:
   *   style-src 'self' 'nonce-${nonce}';
   *
   * NOTE: "For further relief (at the time of writing), both Twitter's report and Spotify's report on Mozilla Observatory both include 'unsafe-inline' for styling, but their overall scores couldn't be higher. We're always limited in some way by the architecture we choose, though it's clear that achieving a top-grade security score is doable regardless of how you're using Next.js."
   * Source: https://reesmorris.co.uk/blog/implementing-proper-csp-nextjs-styled-components
   */
  
  const csp = cspHeader.replace(/\s{2,}/g, ' ').trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })

  response.headers.set('Content-Security-Policy', csp)

  return response
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
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' }
      ]
    }
  ]
}

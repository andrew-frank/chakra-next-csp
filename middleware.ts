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
   * TODO: the CSP for `style-src` does not fully work with `nonce` and SSR.
   * The Client gets empty nonce string (browsers strip the nonces) which causes client-server rendering mismatch.
   * If it gets fixed, we'll be able to change the `style-src` to `'self' 'nonce-${nonce}';` (i.e. add 'nonce-{nonce}' instead of 'unsafe-inline')
   * Tracker 1: https://github.com/vercel/next.js/issues/63749
   * Tracker 2: https://github.com/vercel/next.js/issues/63015
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

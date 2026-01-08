import { withCommerceLayer } from './proxies/withCommerceLayer'

export default withCommerceLayer()

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api$|_next/static|_next/image|sw.js|favicon.ico|.*.svg$|.*.png$|.*.pdf$).*)",
  ],
}

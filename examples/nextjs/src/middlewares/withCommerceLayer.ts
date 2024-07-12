import { NextResponse } from 'next/server'
import type { WithMiddleware } from './types'
import { authenticate, jwtVerify } from '@commercelayer/js-auth'

export const withCommerceLayer: WithMiddleware = (next = () => NextResponse.next()) => {
  return async (request, event) => {
    if (
      request.nextUrl.pathname.endsWith(`/middleware`)
    ) {
      const auth = await authenticate('client_credentials', {
        clientId: 'BISG8bb3GWpC8_D7Nt1SuWWdieS5bJq831A50LgB_Ig',
        scope: 'market:id:KoaJYhMVVj'
      })

      const decodedJWT = await jwtVerify(auth.accessToken)

      let slug: string

      if (!('organization' in decodedJWT.payload)) {
        throw new Error('A "sales_channel" token is required.')
      }

      return NextResponse.json({
        from: 'middleware',
        orgSlug: decodedJWT.payload.organization.slug
      })
    }

    return NextResponse.next()
  }
}

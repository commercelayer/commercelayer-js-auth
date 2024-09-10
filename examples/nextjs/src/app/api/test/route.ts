import { authenticate, getCoreApiBaseEndpoint, jwtVerify } from "@commercelayer/js-auth"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(_request: NextRequest) {
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
    from: 'api',
    orgSlug: decodedJWT.payload.organization.slug,
    baseEndpoint: getCoreApiBaseEndpoint(auth.accessToken)
  })
}

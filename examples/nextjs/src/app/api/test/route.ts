import { authenticate, getCoreApiBaseEndpoint, jwtVerify } from "@commercelayer/js-auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  const auth = await authenticate("client_credentials", {
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID as string,
    scope: process.env.NEXT_PUBLIC_SCOPE as string,
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

import {
  authenticate,
  getCoreApiBaseEndpoint,
  jwtVerify,
  makeSalesChannel,
} from "@commercelayer/js-auth"
import { NextResponse } from 'next/server'
import { createStorage } from "unstorage"
import memoryDriver from "unstorage/drivers/memory"
import { makeCustomerStorage } from "@/app/utils/customerStorage"
import type { WithProxy } from "./types"

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string
const scope = process.env.NEXT_PUBLIC_SCOPE as string

export const withCommerceLayer: WithProxy = (
  _next = () => NextResponse.next(),
) => {
  return async (request, _event) => {
    if (request.nextUrl.pathname.endsWith("/proxy")) {
      const auth = await authenticate("client_credentials", {
        clientId,
        scope,
      })

      const decodedJWT = await jwtVerify(auth.accessToken)

      if (!("organization" in decodedJWT.payload)) {
        throw new Error('A "sales_channel" token is required.')
      }

      return NextResponse.json({
        from: "proxy",
        orgSlug: decodedJWT.payload.organization.slug,
        baseEndpoint: getCoreApiBaseEndpoint(auth.accessToken),
      })
    }

    if (request.nextUrl.pathname.endsWith("/api-credentials/server")) {
      /**
       * NOTE: This is a workaround to make the `refresh_token` working properly.
       * When custom access token expires, the `getAuthorization` method
       * will automatically refresh the access token using the `refresh_token`.
       * However, the customer token is stored in cookies and cookies
       * can only be set in Server Actions or Route Handlers.
       */
      const salesChannel = makeSalesChannel(
        {
          clientId,
          scope,
          debug: true,
        },
        {
          storage: createStorage({
            driver: memoryDriver(),
          }),
          customerStorage: makeCustomerStorage(),
        },
      )

      await salesChannel.getAuthorization()
    }

    return NextResponse.next()
  }
}

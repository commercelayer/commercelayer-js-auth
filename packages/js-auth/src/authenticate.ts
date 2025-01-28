import type {
  AuthenticateOptions,
  AuthenticateReturn,
  GrantType,
} from "./types/index.js"

import { camelCaseToSnakeCase } from "./utils/camelCaseToSnakeCase.js"
import { mapKeys } from "./utils/mapKeys.js"
import { snakeCaseToCamelCase } from "./utils/snakeCaseToCamelCase.js"

interface TokenJson {
  errors?: unknown
  expires: Date
  expires_in: number
  [key: string]: unknown
}

/**
 * Authenticate helper used to get the access token.
 *
 * _Please note that the authentication endpoint is subject to a [rate limit](https://docs.commercelayer.io/core/rate-limits)
 * of **max 30 reqs / 1 min** both in live and test mode._
 * @param grantType The type of OAuth 2.0 grant being used for authentication.
 * @param options Authenticate options
 * @returns
 * @example
 * ```ts
 * import { authenticate } from '@commercelayer/js-auth'
 *
 * const auth = await authenticate('client_credentials', {
 *   clientId: '{{ clientId }}',
 *   scope: 'market:id:DGzAouppwn'
 * })
 *
 * console.log(auth.accessToken)
 * ```
 */
export async function authenticate<TGrantType extends GrantType>(
  grantType: TGrantType,
  {
    domain = "commercelayer.io",
    headers,
    ...options
  }: AuthenticateOptions<TGrantType>,
): Promise<AuthenticateReturn<TGrantType>> {
  const body = mapKeys(
    {
      grant_type: grantType,
      ...options,
    },
    camelCaseToSnakeCase,
  )

  const response = await fetch(`https://auth.${domain}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  })

  const json: TokenJson = await response.json()

  if (json.errors == null) {
    json.expires = new Date(Date.now() + json.expires_in * 1000)
  }

  return mapKeys(
    json,
    snakeCaseToCamelCase,
  ) as unknown as AuthenticateReturn<TGrantType>
}

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
 *
 * **This performs a single uncached exchange.** For guest and integration tokens, prefer
 * `makeSalesChannel` or `makeIntegration`: they cache the token in a required `storage` and
 * handle expiry and refresh, which is what keeps an app under the rate limit. Reach for
 * `authenticate` to log a customer in (`password` or JWT bearer), for a webapp
 * `authorization_code` exchange, or for a provisioning application — and cache the result
 * yourself in those cases.
 *
 * **This method does not throw when authentication fails.** It resolves with an `errors`
 * array instead, so code that only handles rejection treats a failure as a success and
 * passes `undefined` downstream as the access token. Always check `errors` before reading
 * `accessToken`.
 *
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
 * if (auth.errors != null) {
 *   throw new Error(auth.errors[0].detail)
 * }
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
    cache: "no-store",
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

  if (json.errors != null && !Array.isArray(json.errors)) {
    json.errors = [json.errors]
  }

  return mapKeys(
    json,
    snakeCaseToCamelCase,
  ) as unknown as AuthenticateReturn<TGrantType>
}

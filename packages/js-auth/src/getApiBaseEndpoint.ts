import { getCoreApiBaseEndpoint } from './getCoreApiBaseEndpoint.js'
import { jwtDecode } from './jwtDecode.js'
import { extractIssuer } from './utils/extractIssuer.js'

/**
 * Derive the API base endpoint given a valid access token.
 *
 * The API base endpoint can be one of:
 * * [Core API base endpoint](https://docs.commercelayer.io/core/api-specification#base-endpoint)
 * * [Provisioning API base endpoint](https://docs.commercelayer.io/provisioning/getting-started/api-specification#base-endpoint)
 *
 * @example
 * ```ts
 * getApiBaseEndpoint('eyJhbGciOiJS...') //= "https://yourdomain.commercelayer.io"
 * ```
 */
export function getApiBaseEndpoint(accessToken: string): string {
  const decodedJWT = jwtDecode(accessToken)
  if (decodedJWT?.payload?.scope?.includes('provisioning-api')) {
    return extractIssuer(decodedJWT).replace('auth', 'provisioning')
  }

  return getCoreApiBaseEndpoint(accessToken)
}

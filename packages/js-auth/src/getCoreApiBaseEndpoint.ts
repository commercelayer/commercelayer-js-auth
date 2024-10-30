import { InvalidTokenError } from './errors/InvalidTokenError.js'
import { jwtDecode } from './jwtDecode.js'
import { extractIssuer } from './utils/extractIssuer.js'

/**
 * Derive the [Core API base endpoint](https://docs.commercelayer.io/core/api-specification#base-endpoint) given a valid access token.
 *
 * @example
 * ```ts
 * getCoreApiBaseEndpoint('eyJhbGciOiJS...') //= "https://yourdomain.commercelayer.io"
 * ```
 *
 * The method requires a valid access token with an `organization` in the payload.
 * When the organization is not set (e.g., provisioning token), it throws an `InvalidTokenError` exception.
 */
export function getCoreApiBaseEndpoint(accessToken: string): string {
  const decodedJWT = jwtDecode(accessToken)

  if (!('organization' in decodedJWT.payload)) {
    throw new InvalidTokenError('Invalid token format')
  }

  return extractIssuer(decodedJWT).replace(
    'auth',
    decodedJWT.payload.organization.slug
  )
}

import { InvalidTokenError } from './errors/InvalidTokenError.js'
import { jwtDecode } from './jwtDecode.js'

/**
 * Derive the [Core API base endpoint](https://docs.commercelayer.io/core/api-specification#base-endpoint) given a valid access token.
 * @example
 * ```ts
 * getCoreApiEndpoint('eyJhbGciOiJS...') //= "https://yourdomain.commercelayer.io"
 * ```
 */
export function getCoreApiEndpoint(accessToken: string): string {
  const decodedJWT = jwtDecode(accessToken)

  if (!('organization' in decodedJWT.payload)) {
    throw new InvalidTokenError('Invalid token format')
  }

  return decodedJWT.payload.iss.startsWith('https://auth.')
    ? decodedJWT.payload.iss.replace(
        'auth',
        decodedJWT.payload.organization.slug
      )
    : `https://${decodedJWT.payload.organization.slug}.commercelayer.io`
}

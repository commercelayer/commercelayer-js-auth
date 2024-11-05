import { InvalidTokenError } from './errors/InvalidTokenError.js'
import { jwtDecode } from './jwtDecode.js'
import { extractIssuer } from './utils/extractIssuer.js'

/**
 * Returns the [Provisioning API base endpoint](https://docs.commercelayer.io/provisioning/getting-started/api-specification#base-endpoint) given a valid access token.
 *
 * @example
 * ```ts
 * getProvisioningApiBaseEndpoint('eyJhbGciOiJS...') //= "https://provisioning.commercelayer.io"
 * ```
 *
 * The method requires a valid access token for Provisioning API.
 *
 * @param accessToken - The access token to decode.
 * @param options - An options object to configure behavior.
 * @returns The provisioning API base endpoint as a string, or `null` if the token is invalid and `shouldThrow` is `false`.
 * @throws InvalidTokenError - If the token is invalid and `shouldThrow` is true.
 */
export function getProvisioningApiBaseEndpoint(
  accessToken: string,
  options?: {
    /**
     * Whether to throw an error if the token is invalid.
     * @default true
     */
    shouldThrow?: true
  }
): string

/**
 * Returns the [Provisioning API base endpoint](https://docs.commercelayer.io/provisioning/getting-started/api-specification#base-endpoint) given a valid access token.
 *
 * @example
 * ```ts
 * getProvisioningApiBaseEndpoint('eyJhbGciOiJS...') //= "https://provisioning.commercelayer.io"
 * ```
 *
 * The method requires a valid access token for Provisioning API.
 *
 * @param accessToken - The access token to decode.
 * @param options - An options object to configure behavior.
 * @returns The provisioning API base endpoint as a string, or `null` if the token is invalid and `shouldThrow` is `false`.
 * @throws InvalidTokenError - If the token is invalid and `shouldThrow` is true.
 */
export function getProvisioningApiBaseEndpoint(
  accessToken: string,
  options: {
    /**
     * Whether to throw an error if the token is invalid.
     * @default true
     */
    shouldThrow: false
  }
): string | null

export function getProvisioningApiBaseEndpoint(
  accessToken: string,
  options: {
    shouldThrow?: boolean
  } = {}
): string | null {
  const { shouldThrow = true } = options
  const decodedJWT = jwtDecode(accessToken)

  if (!decodedJWT?.payload?.scope?.includes('provisioning-api')) {
    if (shouldThrow) {
      throw new InvalidTokenError('Invalid token format')
    }

    return null
  }

  return extractIssuer(decodedJWT).replace('auth', 'provisioning')
}

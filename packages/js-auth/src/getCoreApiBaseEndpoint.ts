import { InvalidTokenError } from "./errors/InvalidTokenError.js"
import { jwtDecode } from "./jwtDecode.js"
import { extractIssuer } from "./utils/extractIssuer.js"

/**
 * Derives the [Core API base endpoint](https://docs.commercelayer.io/core/api-specification#base-endpoint) given a valid access token.
 *
 * @example
 * ```ts
 * getCoreApiBaseEndpoint('eyJhbGciOiJS...') //= "https://yourdomain.commercelayer.io"
 * ```
 *
 * The method requires a valid access token with an `organization` in the payload.
 *
 * @param accessToken - The access token to decode.
 * @param options - An options object to configure behavior.
 * @returns The core API base endpoint as a string, or `null` if the token is invalid and `shouldThrow` is `false`.
 * @throws InvalidTokenError - If the token is invalid and `shouldThrow` is true.
 */
export function getCoreApiBaseEndpoint(
  accessToken: string,
  options?: {
    /**
     * Whether to throw an error if the token is invalid.
     * @default true
     */
    shouldThrow?: true
  },
): string

/**
 * Derives the [Core API base endpoint](https://docs.commercelayer.io/core/api-specification#base-endpoint) given a valid access token.
 *
 * @example
 * ```ts
 * getCoreApiBaseEndpoint('eyJhbGciOiJS...') //= "https://yourdomain.commercelayer.io"
 * ```
 *
 * The method requires a valid access token with an `organization` in the payload.
 *
 * @param accessToken - The access token to decode.
 * @param options - An options object to configure behavior.
 * @returns The core API base endpoint as a string, or `null` if the token is invalid and `shouldThrow` is `false`.
 * @throws InvalidTokenError - If the token is invalid and `shouldThrow` is true.
 */
export function getCoreApiBaseEndpoint(
  accessToken: string,
  options: {
    /**
     * Whether to throw an error if the token is invalid.
     * @default true
     */
    shouldThrow: false
  },
): string | null

export function getCoreApiBaseEndpoint(
  accessToken: string,
  options: {
    shouldThrow?: boolean
  } = {},
): string | null {
  const { shouldThrow = true } = options
  const decodedJWT = jwtDecode(accessToken)

  if (!("organization" in decodedJWT.payload)) {
    if (shouldThrow) {
      throw new InvalidTokenError("Invalid token format")
    }

    return null
  }

  return extractIssuer(decodedJWT).replace(
    "auth",
    decodedJWT.payload.organization.slug,
  )
}

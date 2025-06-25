import type { CommerceLayerJWT } from "src/jwtDecode.js"

/**
 * Check if a Commerce Layer JWT has expired.
 *
 * @param decodedJWT - The decoded JWT to check.
 * @returns `true` if the JWT has expired, `false` otherwise.
 */
export function hasExpired(decodedJWT: CommerceLayerJWT): boolean {
  return Date.now() >= decodedJWT.payload.exp * 1000
}

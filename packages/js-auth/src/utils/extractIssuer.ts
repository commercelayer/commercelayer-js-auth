import type { CommerceLayerJWT } from 'src/jwtDecode.js'

/**
 * Extract the `iss` from the decoded JWT.
 *
 * This is not as simple as `decodedJWT.payload.iss` because:
 * - at the beginning the `iss` was not required.
 * - the value can be `https://commercelayer.io` is old tokens.
 */
export function extractIssuer(
  decodedJWT: CommerceLayerJWT,
): `https://auth.${string}` {
  return decodedJWT?.payload?.iss?.startsWith('https://auth.')
    ? (decodedJWT.payload.iss as `https://auth.${string}`)
    : 'https://auth.commercelayer.io'
}

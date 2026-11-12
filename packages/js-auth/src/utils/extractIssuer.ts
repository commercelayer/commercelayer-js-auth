import type { CommerceLayerJWT } from "src/jwtDecode.js"

/**
 * Commerce Layer auth servers whose keys and endpoints this package trusts.
 */
type TrustedIssuer =
  | "https://auth.commercelayer.io"
  | "https://auth.commercelayer.co"
  | `https://auth.stg${string}.commercelayer.co`

/**
 * Matches a trusted issuer exactly.
 */
const trustedIssuerPattern =
  /^https:\/\/auth\.(commercelayer\.io|commercelayer\.co|stg\d*\.commercelayer\.co)$/

/**
 * Extract the `iss` from the decoded JWT.
 * Only a trusted Commerce Layer issuer is returned.
 */
export function extractIssuer(decodedJWT: CommerceLayerJWT): TrustedIssuer {
  const issuer = decodedJWT?.payload?.iss

  return isTrustedIssuer(issuer) ? issuer : "https://auth.commercelayer.io"
}

/**
 * Whether `issuer` is a Commerce Layer auth server this package trusts.
 */
function isTrustedIssuer(issuer: unknown): issuer is TrustedIssuer {
  return typeof issuer === "string" && trustedIssuerPattern.test(issuer)
}

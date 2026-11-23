import type { CommerceLayerJWT } from "src/jwtDecode.js"

/**
 * Commerce Layer auth servers whose keys and endpoints this package trusts.
 */
type TrustedIssuer =
  | `https://auth.commercelayer.${CommerceLayerTLD}`
  | `https://auth.${string}.commercelayer.${CommerceLayerTLD}`

/** Top-level domains Commerce Layer runs its auth servers on. */
type CommerceLayerTLD = "io" | "co" | "dev"

/**
 * Matches `https://auth.commercelayer.<tld>` or `https://auth.<environment>.commercelayer.<tld>`,
 * where `<environment>` is a single label, so no other host can match.
 */
const trustedIssuerPattern =
  /^https:\/\/auth\.(?:[a-z0-9-]+\.)?commercelayer\.(?:io|co|dev)$/

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

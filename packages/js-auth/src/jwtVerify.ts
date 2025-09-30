import { InvalidTokenError } from "./errors/InvalidTokenError.js"
import { TokenError } from "./errors/TokenError.js"
import { TokenExpiredError } from "./errors/TokenExpiredError.js"
import { type CommerceLayerJWT, jwtDecode } from "./jwtDecode.js"
import { decodeBase64URLSafe } from "./utils/base64.js"
import { extractIssuer } from "./utils/extractIssuer.js"
import { hasExpired } from "./utils/hasExpired.js"

/**
 * Validate the integrity and authenticity of the JWT.
 * It checks if the token is valid by verifying the signature against the public key used to create it.
 * This is useful to ensure that the token hasn't been tampered with and originates from Commerce Layer.
 *
 * When the verification succeeds, it resolves to the decoded access token, it rejects otherwise.
 */
export async function jwtVerify(
  accessToken: string,
  { ignoreExpiration = false, jwk }: JwtVerifyOptions = {},
): Promise<CommerceLayerJWT> {
  const decodedJWT = jwtDecode(accessToken)

  const jsonWebKey = jwk ?? (await getJsonWebKey(decodedJWT))

  if (jsonWebKey == null || jsonWebKey.kid !== decodedJWT.header.kid) {
    throw new InvalidTokenError('Invalid token "kid"')
  }

  if (!ignoreExpiration && hasExpired(decodedJWT)) {
    throw new TokenExpiredError()
  }

  const algorithm: RsaHashedImportParams = {
    name: "RSASSA-PKCS1-v1_5",
    hash: "SHA-512",
  }

  const publicKey = await crypto.subtle.importKey(
    "jwk",
    jsonWebKey,
    algorithm,
    true,
    ["verify"],
  )

  const rawSignature = new Uint8Array(
    Array.from(decodeBase64URLSafe(decodedJWT.signature, "binary"), (c) =>
      c.charCodeAt(0),
    ),
  )

  const rawData = new TextEncoder().encode(
    accessToken.split(".").slice(0, 2).join("."),
  )

  const isValid = await crypto.subtle.verify(
    algorithm,
    publicKey,
    rawSignature,
    rawData,
  )

  if (!isValid) {
    throw new InvalidTokenError("Invalid signature")
  }

  return decodedJWT
}

type CommerceLayerJsonWebKey = JsonWebKey & { kid: string }

interface JwtVerifyOptions {
  /**
   * Do not validate the token expiration when set to `true`.
   * @default false
   */
  ignoreExpiration?: boolean

  /**
   * Json Web Key used to verify the signature.
   *
   * The `kid` must match the `kid` from decoded accessToken.
   *
   * By default, we pick the jwk from https://auth.commercelayer.io/.well-known/jwks.json using the `kid` from the accessToken.
   */
  jwk?: CommerceLayerJsonWebKey
}

/** JWKS in-memory cache. */
const JWKSCache: Record<string, CommerceLayerJsonWebKey | undefined> = {}

/**
 * Get the `JsonWebKey` given a key identifier.
 * @param kid Key identifier.
 * @returns
 */
async function getJsonWebKey(
  jwt: CommerceLayerJWT,
): Promise<CommerceLayerJsonWebKey | undefined> {
  const { kid } = jwt.header

  if (JWKSCache[kid] != null) {
    return JWKSCache[kid]
  }

  const keys = await getJsonWebKeys(jwt)

  JWKSCache[kid] = keys.find((key) => key.kid === kid)

  return JWKSCache[kid]
}

/**
 * Retrieve RSA public keys from our JWKS (JSON Web Key Set) endpoint.
 * @returns
 */
async function getJsonWebKeys(
  jwt: CommerceLayerJWT,
): Promise<CommerceLayerJsonWebKey[]> {
  const jwksUrl = `${extractIssuer(jwt)}/.well-known/jwks.json`

  const response = await fetch(jwksUrl).then<{
    keys: CommerceLayerJsonWebKey[] | undefined
  }>(async (res) => await res.json())

  if (response.keys == null) {
    throw new TokenError(
      `Invalid jwks response from "${jwksUrl}": ${JSON.stringify(response)}`,
    )
  }

  return response.keys
}

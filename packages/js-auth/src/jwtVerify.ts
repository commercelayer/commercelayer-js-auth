import { TokenError } from './errors/TokenError.js'
import { TokenExpiredError } from './errors/TokenExpiredError.js'
import { jwtDecode, type CommerceLayerJWT } from './jwtDecode.js'
import { decodeBase64URLSafe } from './utils/base64.js'

/**
 * Verify a Commerce Layer access token.
 * When the verification succeeds, it resolves to the decoded access token, it rejects otherwise.
 */
export async function jwtVerify(
  accessToken: string,
  { ignoreExpiration = false, domain }: JwtVerifyOptions = {}
): Promise<CommerceLayerJWT> {
  const decodedJWT = jwtDecode(accessToken)

  const jsonWebKey = await getJsonWebKey(decodedJWT.header.kid, {
    domain
  })

  if (jsonWebKey == null) {
    throw new TokenError('Invalid token "kid"')
  }

  if (!ignoreExpiration && Date.now() >= decodedJWT.payload.exp * 1000) {
    throw new TokenExpiredError()
  }

  const algorithm: RsaHashedImportParams = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-512'
  }

  const publicKey = await crypto.subtle.importKey(
    'jwk',
    jsonWebKey,
    algorithm,
    true,
    ['verify']
  )

  const rawSignature = new Uint8Array(
    Array.from(decodeBase64URLSafe(decodedJWT.signature), (c) =>
      c.charCodeAt(0)
    )
  )

  const rawData = new TextEncoder().encode(
    accessToken.split('.').slice(0, 2).join('.')
  )

  const isValid = await crypto.subtle.verify(
    algorithm,
    publicKey,
    rawSignature,
    rawData
  )

  if (!isValid) {
    throw new TokenError('Invalid signature')
  }

  return decodedJWT
}

type CommerceLayerJsonWebKey = JsonWebKey & { kid: string }

interface JwtVerifyOptions {
  /**
   * The Commerce Layer's domain.
   */
  domain?: string
  /**
   * Do not validate the token expiration when set to `true`.
   * @default false
   */
  ignoreExpiration?: boolean
}

/** JWKS in-memory cache. */
const JWKSCache: Record<string, CommerceLayerJsonWebKey | undefined> = {}

/**
 * Get the `JsonWebKey` given a key identifier.
 * @param kid Key identifier.
 * @returns
 */
async function getJsonWebKey(
  kid: string,
  options: JwtVerifyOptions
): Promise<CommerceLayerJsonWebKey | undefined> {
  if (JWKSCache[kid] != null) {
    return JWKSCache[kid]
  }

  const keys = await getJsonWebKeys(options)

  JWKSCache[kid] = keys.find((key) => key.kid === kid)

  return JWKSCache[kid]
}

/**
 * Retrieve RSA public keys from our JWKS (JSON Web Key Set) endpoint.
 * @returns
 */
async function getJsonWebKeys({
  domain = 'commercelayer.io'
}: JwtVerifyOptions): Promise<CommerceLayerJsonWebKey[]> {
  const jwksUrl = `https://auth.${domain}/.well-known/jwks.json`

  const response = await fetch(jwksUrl).then<{
    keys: CommerceLayerJsonWebKey[] | undefined
  }>(async (res) => await res.json())

  if (response.keys == null) {
    throw new TokenError(
      `Invalid jwks response from "${jwksUrl}": ${JSON.stringify(response)}`
    )
  }

  return response.keys
}

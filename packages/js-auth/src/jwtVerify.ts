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
    domain,
    ignoreExpiration
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

/**
 * Get the `JsonWebKey` given a key identifier.
 * @param kid Key identifier.
 * @returns
 */
async function getJsonWebKey(
  kid: string,
  { domain = 'commercelayer.io' }: JwtVerifyOptions
): Promise<CommerceLayerJsonWebKey | undefined> {
  const response = await fetch(
    `https://auth.${domain}/.well-known/jwks.json`
  ).then<{ keys: CommerceLayerJsonWebKey[] }>(async (res) => await res.json())

  return response.keys.find((key) => key.kid === kid)
}

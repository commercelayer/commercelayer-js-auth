import { encodeBase64URLSafe } from './utils/base64.js'

interface Owner {
  type: 'User' | 'Customer'
  id: string
}

/**
 * Create a JWT assertion as the first step of the [JWT bearer token authorization grant flow](https://docs.commercelayer.io/core/authentication/jwt-bearer).
 *
 * The JWT assertion is a digitally signed JSON object containing information
 * about the client and the user on whose behalf the access token is being requested.
 *
 * This JWT assertion can include information such as the issuer (typically the client),
 * the owner (the user on whose behalf the request is made), and any other relevant claims.
 *
 * @example
 * ```ts
 * const assertion = await createAssertion({
 *   payload: {
 *     'https://commercelayer.io/claims': {
 *       owner: {
 *         type: 'Customer',
 *         id: '4tepftJsT2'
 *       },
 *       custom_claim: {
 *         customer: {
 *           first_name: 'John',
 *           last_name: 'Doe'
 *         }
 *       }
 *     }
 *   }
 * })
 * ```
 */
export async function createAssertion({ payload }: Assertion): Promise<string> {
  return await jwtEncode(payload, 'cl')
}

/** RequireAtLeastOne helps create a type where at least one of the properties of an interface (can be any property) is required to exist. */
type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>
}[keyof T]

interface Assertion {
  /** Assertion payload. */
  payload: {
    /** At least one of `owner` or `custom_claim` is required. You cannot use an empty object. */
    'https://commercelayer.io/claims': RequireAtLeastOne<{
      /** The customer or user you want to make the calls on behalf of. */
      owner?: Owner
      /** Any other information (key/value pairs) you want to enrich the token with. */
      custom_claim?: Record<string, unknown>
    }>
  }
}

async function jwtEncode(
  payload: Record<string, unknown>,
  secret: string,
): Promise<string> {
  const header = { alg: 'HS512', typ: 'JWT' }

  const encodedHeader = encodeBase64URLSafe(JSON.stringify(header), 'binary')

  const encodedPayload = encodeBase64URLSafe(
    JSON.stringify({
      ...payload,
      iat: Math.floor(new Date().getTime() / 1000),
    }),
    'utf-8',
  )

  const unsignedToken = `${encodedHeader}.${encodedPayload}`

  const signature = await createSignature(unsignedToken, secret)

  return `${unsignedToken}.${signature}`
}

async function createSignature(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const algorithm = { name: 'HMAC', hash: 'SHA-512' }

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    algorithm,
    false,
    ['sign', 'verify'],
  )

  const signature = await crypto.subtle.sign(
    algorithm.name,
    key,
    enc.encode(data),
  )

  return encodeBase64URLSafe(
    String.fromCharCode(...new Uint8Array(signature)),
    'binary',
  )
}

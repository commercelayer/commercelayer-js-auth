import { base64url } from '#utils/base64.js'

interface Owner {
  type: 'User' | 'Customer'
  id: string
}

export async function createAssertion(payload: {
  'https://commercelayer.io/claims': {
    /** The customer or user you want to make the calls on behalf of. */
    owner: Owner
    /** Any other information (key/value pairs) you want to enrich the token with. */
    custom_claim?: Record<string, unknown>
  }
}): Promise<string> {
  return await jwtEncode(payload, 'cl')
}

async function jwtEncode(
  payload: Record<string, unknown>,
  secret: string
): Promise<string> {
  const header = { alg: 'HS512', typ: 'JWT' }

  const encodedHeader = base64url(JSON.stringify(header))

  const encodedPayload = base64url(
    JSON.stringify({
      ...payload,
      iat: Math.floor(new Date().getTime() / 1000)
    })
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
    ['sign', 'verify']
  )

  const signature = await crypto.subtle.sign(
    algorithm.name,
    key,
    enc.encode(data)
  )

  return base64url(String.fromCharCode(...new Uint8Array(signature)))
}

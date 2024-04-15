import { decodeBase64URLSafe } from './utils/base64.js'

/**
 * Decode a Commerce Layer access token.
 */
export function jwtDecode(accessToken: string): CommerceLayerJWT {
  const [header, payload] = accessToken.split('.')

  return {
    header: JSON.parse(header != null ? decodeBase64URLSafe(header) : 'null'),
    payload: JSON.parse(payload != null ? decodeBase64URLSafe(payload) : 'null')
  }
}

interface CommerceLayerJWT {
  /** The header typically consists of two parts: the type of the token, which is JWT, and the signing algorithm being used, such as HMAC SHA256 or RSA. */
  header: {
    /** Signing algorithm being used (e.g. `HMAC`, `SHA256`, `RSA`, `RS512`). */
    alg: string
    /** Type of the token (usually `JWT`). */
    typ?: string
    /** Key ID */
    kid?: string
  }

  payload: Payload
}

type Payload =
  | JWTUser
  | JWTDashboard
  | JWTIntegration
  | JWTSalesChannel
  | JWTWebApp

interface JWTBase {
  /** The type of credentials you're using to authenticate to the APIs. */
  application: {
    id: string
    public: boolean
  }

  /** Scope used to restrict access to a specific active market and/or stock location. */
  scope: string
  /** The token expiration time, expressed as an [epoch](https://www.epoch101.com/). */
  exp: number
  /** The environment type (true for test mode, false for live mode). */
  test: boolean
  /** A randomly generated number, less than one. */
  rand: number
  /** Issued at (seconds since Unix epoch). */
  iat: number
  /** Who created and signed this token (e.g. `"https://commercelayer.io"`). */
  iss: string
}

type JWTUser = JWTBase & {
  /** The type of credentials you're using to authenticate to the APIs. */
  application: {
    kind: 'user'
  }
  /** The authenticated user. */
  user: {
    id: string
  }
}

type JWTDashboard = JWTBase & {
  /** The type of credentials you're using to authenticate to the APIs. */
  application: {
    kind: 'dashboard'
  }
  /** The authenticated user. */
  user: {
    id: string
  }
}

type JWTOrganizationBase = JWTBase & {
  /** The organization in scope. */
  organization: {
    id: string
    slug: string
    enterprise: boolean
    region: string
  }
  /**
   * Any other information (key/value pairs) you want to enrich the token with,
   * when using the [JWT Bearer flow](https://docs.commercelayer.io/core/authentication/jwt-bearer).
   */
  custom_claim?: Record<string, string>
  /**
   * The market(s) in scope.
   * This is available only when the scope is defined in the request.
   */
  market?: {
    id: string[]
    price_list_id: string
    stock_location_ids: string[]
    geocoder_id: string | null
    allows_external_prices: boolean
  }
}

type JWTWebApp = JWTOrganizationBase & {
  /** The type of credentials you're using to authenticate to the APIs. */
  application: {
    kind: 'webapp'
  }
  /** The owner (if any) authenticating to the APIs. */
  owner: {
    id: string
    type: 'User'
  }
}

type JWTSalesChannel = JWTOrganizationBase & {
  /** The type of credentials you're using to authenticate to the APIs. */
  application: {
    kind: 'sales_channel'
  }
  /** The owner (if any) authenticating to the APIs. */
  owner?: {
    id: string
    type: 'Customer'
  }
}

type JWTIntegration = JWTOrganizationBase & {
  /** The type of credentials you're using to authenticate to the APIs. */
  application: {
    kind: 'integration'
  }
}

export function jwtIsUser(payload: Payload): payload is JWTUser {
  return payload.application.kind === 'user'
}

export function jwtIsDashboard(payload: Payload): payload is JWTDashboard {
  return payload.application.kind === 'dashboard'
}

export function jwtIsIntegration(payload: Payload): payload is JWTIntegration {
  return payload.application.kind === 'integration'
}

export function jwtIsSalesChannel(
  payload: Payload
): payload is JWTSalesChannel {
  return payload.application.kind === 'sales_channel'
}

export function jwtIsWebApp(payload: Payload): payload is JWTWebApp {
  return payload.application.kind === 'webapp'
}

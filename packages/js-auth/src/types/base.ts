export interface TBaseOptions {
  /**
   * The application's client_id.
   */
  clientId: string
  /**
   * The access token scope (market, stock location).
   */
  scope?: string
  /**
   * The Commerce Layer's domain.
   */
  domain?: string
  /**
   * The request headers.
   */
  headers?: HeadersInit
}

export interface TBaseReturn {
  /**
   * The access token.
   */
  accessToken: string
  /**
   * The token type.
   */
  tokenType: 'bearer'
  /**
   * The access token expiration time in seconds.
   */
  expiresIn: number
  /**
   * The access token expiration date.
   */
  expires: Date
  /**
   * The access token scope (market, stock location).
   */
  scope: string
  /**
   * The creation date of the access token.
   */
  createdAt: number
  /**
   * The error code.
   */
  error?: string
  /**
   * The error description.
   */
  errorDescription?: string
}

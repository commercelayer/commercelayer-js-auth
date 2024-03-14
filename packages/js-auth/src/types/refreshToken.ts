import type { TBaseOptions } from '#types/index.js'

/**
 * The refresh token grant type is used by clients to exchange a refresh token for an access token when the access token has expired.
 * @see https://docs.commercelayer.io/core/authentication/refresh-token
 */
export interface TRefreshToken extends TBaseOptions {
  refreshToken: string
  clientSecret?: string
}

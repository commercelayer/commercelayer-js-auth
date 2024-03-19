import type { TBaseOptions } from '#types/base.js'

/**
 * The refresh token grant type is used by clients to exchange a refresh token for an access token when the access token has expired.
 * @see https://docs.commercelayer.io/core/authentication/refresh-token
 */
export interface TRefreshTokenOptions extends TBaseOptions {
  refreshToken: string
  clientSecret?: string
}

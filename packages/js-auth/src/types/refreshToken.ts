import type { TBaseOptions } from "./base.js"

/**
 * The refresh token grant type is used by clients to exchange a refresh token for an access token when the access token has expired.
 * @see https://docs.commercelayer.io/core/authentication/refresh-token
 */
export interface TRefreshTokenOptions extends TBaseOptions {
  /**
   * A valid `refresh_token`.
   */
  refreshToken: string
  /**
   * Your application's client secret
   * (required for confidential API credentials — i.e. in case of [authorization code flow](https://docs.commercelayer.io/core/authentication/refresh-token#webapp-application-with-authorization-code-flow)).
   */
  clientSecret?: string
}

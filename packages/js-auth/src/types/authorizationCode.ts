import type { TBaseOptions } from './base.js'
import type { TPasswordReturn } from './password.js'

/**
 * The authorization code grant type is used by clients to exchange an authorization code for an access token.
 * @see https://docs.commercelayer.io/core/authentication/authorization-code#getting-an-access-token
 */
export interface TAuthorizationCodeOptions extends TBaseOptions {
  /**
   * The authorization code that [you got](https://docs.commercelayer.io/core/authentication/authorization-code#getting-an-authorization-code) from the redirect URI query string.
   */
  code: string
  /**
   * Your application's redirect URI.
   */
  redirectUri: string
  /**
   * Your application's client secret.
   */
  clientSecret: string
}

export interface TAuthorizationCodeReturn
  extends Omit<TPasswordReturn, 'ownerType'> {
  ownerType: 'user'
}

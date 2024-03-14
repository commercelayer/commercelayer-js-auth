import type { TBaseOptions, TBaseReturn } from '#types/index.js'

/**
 * The password grant type is used by first-party clients to exchange a user's credentials for an access token.
 * @see https://docs.commercelayer.io/core/authentication/password
 */
export interface TPassword extends TBaseOptions {
  username: string
  password: string
}

/**
 * The password grant type is used by first-party clients to exchange a user's credentials for an access token.
 * @see https://docs.commercelayer.io/core/authentication/password
 */
export interface TPasswordReturn extends TBaseReturn {
  ownerId: string
  ownerType: 'customer'
  refreshToken: string
}

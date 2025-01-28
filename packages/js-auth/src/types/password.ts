import type { TBaseOptions, TBaseReturn } from "./base.js"

/**
 * The password grant type is used by first-party clients to exchange a user's credentials for an access token.
 * @see https://docs.commercelayer.io/core/authentication/password
 */
export interface TPasswordOptions extends TBaseOptions {
  /** The customer's email address. */
  username: string
  /** The customer's password */
  password: string
}

/**
 * The password grant type is used by first-party clients to exchange a user's credentials for an access token.
 * @see https://docs.commercelayer.io/core/authentication/password
 */
export interface TPasswordReturn extends TBaseReturn {
  ownerId: string
  ownerType: "customer"
  refreshToken: string
}

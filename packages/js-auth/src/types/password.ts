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
  /** The ID of the owner of the access token. */
  ownerId: string
  /** The type of the owner of the access token. */
  ownerType: "customer"
  /** The refresh token used to obtain a new access token. */
  refreshToken: string
}

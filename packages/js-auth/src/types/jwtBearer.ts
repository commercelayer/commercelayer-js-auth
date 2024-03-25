import type { TBaseOptions } from '#types/base.js'
import type { TPasswordReturn } from './password.js'

/**
 * Commerce Layer, through OAuth2, provides the support of token exchange in the on-behalf-of (delegation) scenario which allows,
 * for example, to make calls on behalf of a user and get an access token of the requesting user without direct user interaction.
 * Sales channels and webapps can accomplish it by leveraging the JWT Bearer flow,
 * which allows a client application to obtain an access token using a JSON Web Token (JWT) assertion.
 * @see https://docs.commercelayer.io/core/authentication/jwt-bearer
 */
export interface TJwtBearerOptions extends TBaseOptions {
  /** Your application's client secret. */
  clientSecret: string
  /**
   * A single JSON Web Token ([learn more](https://docs.commercelayer.io/core/authentication/jwt-bearer#creating-the-jwt-assertion)).
   * Max size is 4KB.
   *
   * **You can use the `createAssertion` helper method**.
   *
   * @example
   * ```ts
   * import { createAssertion } from '@commercelayer/js-auth'
   * ```
   */
  assertion: string
}

export interface TJwtBearerReturn extends Omit<TPasswordReturn, 'ownerType'> {
  ownerType: 'user' | 'customer'
}

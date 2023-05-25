import { type TPasswordReturn, type TPassword } from '#types/password'
import { type TRefreshToken } from '#types/refreshToken'
import {
  type TAuthorizationCodeReturn,
  type TAuthorizationCode
} from '#types/authorizationCode'
import { type TClientCredentials } from '#types/clientCredentials'

/**
 * The grant type. Possible values are: password, refresh_token, client_credentials, authorization_code.
 */
export type GrantType =
  | 'password'
  | 'refresh_token'
  | 'client_credentials'
  | 'authorization_code'

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
   * The organization's slug.
   */
  slug: string
  /**
   * The Commerce Layer's domain.
   */
  domain?: string
}

export type TOptions<TGrantType> = TGrantType extends 'password'
  ? TPassword
  : TGrantType extends 'refresh_token'
  ? TRefreshToken
  : TGrantType extends 'client_credentials'
  ? TClientCredentials
  : TGrantType extends 'authorization_code'
  ? TAuthorizationCode
  : never

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

export type TReturn<TGrantType> = TGrantType extends 'password'
  ? TPasswordReturn
  : TGrantType extends 'refresh_token'
  ? TPasswordReturn
  : TGrantType extends 'client_credentials'
  ? TBaseReturn
  : TGrantType extends 'authorization_code'
  ? TAuthorizationCodeReturn
  : never

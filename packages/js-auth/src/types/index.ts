import type {
  TAuthorizationCodeOptions,
  TAuthorizationCodeReturn
} from './authorizationCode.js'
import type { TBaseReturn } from './base.js'
import type { TClientCredentialsOptions } from './clientCredentials.js'
import type { TPasswordOptions, TPasswordReturn } from './password.js'
import type { TRefreshTokenOptions } from './refreshToken.js'

/**
 * The grant type.
 */
export type GrantType =
  | 'password'
  | 'refresh_token'
  | 'client_credentials'
  | 'authorization_code'

export type TOptions<TGrantType extends GrantType> =
  TGrantType extends 'password'
    ? TPasswordOptions
    : TGrantType extends 'refresh_token'
      ? TRefreshTokenOptions
      : TGrantType extends 'client_credentials'
        ? TClientCredentialsOptions
        : TGrantType extends 'authorization_code'
          ? TAuthorizationCodeOptions
          : never

export type TReturn<TGrantType extends GrantType> =
  TGrantType extends 'password'
    ? TPasswordReturn
    : TGrantType extends 'refresh_token'
      ? TPasswordReturn
      : TGrantType extends 'client_credentials'
        ? TBaseReturn
        : TGrantType extends 'authorization_code'
          ? TAuthorizationCodeReturn
          : never

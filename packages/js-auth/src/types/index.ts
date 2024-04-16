import type {
  TAuthorizationCodeOptions,
  TAuthorizationCodeReturn
} from './authorizationCode.js'
import type { TBaseOptions, TBaseReturn, TError } from './base.js'
import type { TClientCredentialsOptions } from './clientCredentials.js'
import type { TJwtBearerOptions, TJwtBearerReturn } from './jwtBearer.js'
import type { TPasswordOptions, TPasswordReturn } from './password.js'
import type { TRefreshTokenOptions } from './refreshToken.js'

/**
 * The type of OAuth 2.0 grant being used for authentication.
 */
export type GrantType =
  | 'password'
  | 'refresh_token'
  | 'client_credentials'
  | 'authorization_code'
  | 'urn:ietf:params:oauth:grant-type:jwt-bearer'

/** The options type for the `authenticate` helper. */
export type AuthenticateOptions<TGrantType extends GrantType> =
  TGrantType extends 'urn:ietf:params:oauth:grant-type:jwt-bearer'
    ? TJwtBearerOptions
    : TGrantType extends 'password'
      ? TPasswordOptions
      : TGrantType extends 'refresh_token'
        ? TRefreshTokenOptions
        : TGrantType extends 'client_credentials'
          ? TClientCredentialsOptions
          : TGrantType extends 'authorization_code'
            ? TAuthorizationCodeOptions
            : never

/** The return type of the `authenticate` helper. */
export type AuthenticateReturn<TGrantType extends GrantType> =
  TGrantType extends 'urn:ietf:params:oauth:grant-type:jwt-bearer'
    ? TJwtBearerReturn
    : TGrantType extends 'password'
      ? TPasswordReturn
      : TGrantType extends 'refresh_token'
        ? TPasswordReturn
        : TGrantType extends 'client_credentials'
          ? TBaseReturn
          : TGrantType extends 'authorization_code'
            ? TAuthorizationCodeReturn
            : never

/** The options type for the `revoke` helper. */
export type RevokeOptions = Pick<TBaseOptions, 'clientId' | 'domain'> & {
  /** Your application's client secret (required for confidential API credentials and non-confidential API credentials without a customer or a user in the JWT only). */
  clientSecret?: string
  /** A valid access or refresh token. */
  token: string
}

/** The return type of the `revoke` helper. */
export type RevokeReturn = Pick<TError, 'errors'>

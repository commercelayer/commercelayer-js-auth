import { Options, Token } from 'client-oauth2'

export type ClientId = string
export type ClientSecret = string
export type CallbackUrl = string
export type Endpoint = string

type TokenData = Token['data']

interface AuthData extends TokenData {
  owner_id?: string
  owner_type?: string
}

export type AuthReturnType = Promise<
  Token & {
    data: AuthData
  }
>

export interface AuthConfig {
  clientId: string
  clientSecret?: string
  accessTokenUri: string
  authorizationUri?: string
  redirectUri?: string
  username?: string
  password?: string
}

export type AuthType = 'clientCredentials' | 'owner' | 'authorizationCode'

export type AuthScope = string[] | string

export interface Authenticate {
  (
    type: AuthType,
    config: AuthConfig,
    scope?: AuthScope,
    code?: string
  ): AuthReturnType
}

export interface AuthOptions extends Options {
  clientId: string
  accessTokenUri: string
}

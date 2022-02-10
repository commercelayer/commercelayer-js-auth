import { Options, Token } from 'client-oauth2'

export type ClientId = string
export type ClientSecret = string
export type CallbackUrl = string
export type Endpoint = string

type TokenData = Token['data']

type AuthData = TokenData & {
  owner_id?: string
  owner_type?: string
}

export type AuthReturnType = Promise<
  | ((Omit<Token, 'refreshToken' | 'refresh'> & {
      data: AuthData
      expires?: Date
    }) &
      Partial<Pick<Token, 'refreshToken' | 'refresh'>>)
  | null
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

export type AuthType =
  | 'clientCredentials'
  | 'owner'
  | 'authorizationCode'
  | 'refreshToken'

export type AuthScope = string[] | string

type AuthenticateParams = {
  type: AuthType
  config: AuthConfig
  scope?: AuthScope
  code?: string
  refreshToken?: string
}

export interface Authenticate {
  (params: AuthenticateParams): AuthReturnType
}

export interface AuthOptions extends Options {
  clientId: string
  accessTokenUri: string
}

import authenticate from './authenticate'
import {
  AuthReturnType,
  AuthConfig,
  Endpoint,
  ClientId,
  AuthScope,
  ClientSecret,
} from './typings'

type RefreshTokenParams = {
  clientId: ClientId
  endpoint: Endpoint
  refreshToken: string
  scope?: AuthScope
  clientSecret?: ClientSecret
}

export default async function refreshToken({
  clientId,
  endpoint,
  scope,
  refreshToken,
  clientSecret = '',
}: RefreshTokenParams): AuthReturnType {
  const config: AuthConfig = {
    clientId,
    clientSecret,
    accessTokenUri: `${endpoint}/oauth/token`,
    redirectUri: undefined,
  }
  return authenticate({ type: 'refreshToken', config, scope, refreshToken })
}

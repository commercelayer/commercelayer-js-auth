import authenticate from './authenticate'
import {
  ClientId,
  ClientSecret,
  CallbackUrl,
  Endpoint,
  AuthReturnType,
  AuthConfig,
  AuthScope,
} from './typings'

export interface WebappCredentials {
  clientId: ClientId
  clientSecret: ClientSecret
  callbackUrl: CallbackUrl
  endpoint: Endpoint
  scope?: AuthScope
  callbackUrlWithCode?: string
}

export interface WebappCredentialsToken extends WebappCredentials {
  callbackUrlWithCode: string
}

export interface GetWebappToken {
  (credentials: WebappCredentialsToken): AuthReturnType
}

export interface Webapp {
  (credentials: WebappCredentials): AuthReturnType
}

const webapp: Webapp = async ({
  clientId,
  clientSecret,
  callbackUrl,
  endpoint,
  scope,
  callbackUrlWithCode,
}) => {
  const config: AuthConfig = {
    clientId,
    clientSecret,
    accessTokenUri: `${endpoint}/oauth/token`,
    authorizationUri: `${endpoint}/oauth/authorize`,
    redirectUri: callbackUrl,
  }
  return await authenticate({
    type: 'authorizationCode',
    config,
    scope,
    code: callbackUrlWithCode,
  })
}

export default webapp

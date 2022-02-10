import authenticate from './authenticate'
import {
  AuthConfig,
  AuthReturnType,
  AuthScope,
  ClientId,
  ClientSecret,
  Endpoint,
} from './typings'
import { User } from './salesChannel'

export interface IntegrationCredentials {
  clientId: ClientId
  clientSecret: ClientSecret
  endpoint: Endpoint
  scope?: AuthScope
}

export type Integration = (
  credentials: IntegrationCredentials,
  user?: User
) => AuthReturnType

const integration: Integration = async (
  { clientId, clientSecret, endpoint, scope },
  user
) => {
  const config: AuthConfig = {
    clientId,
    clientSecret,
    accessTokenUri: `${endpoint}/oauth/token`,
    redirectUri: '',
    username: user?.username,
    password: user?.password,
  }
  return user
    ? authenticate({ type: 'owner', config, scope })
    : authenticate({ type: 'clientCredentials', config, scope })
}

export default integration

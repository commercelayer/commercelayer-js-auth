import authenticate from './authenticate'
import {
  ClientId,
  Endpoint,
  AuthReturnType,
  AuthConfig,
  AuthScope,
} from './typings'

export interface User {
  username: string
  password: string
}

export interface ClientCredentials {
  clientId: ClientId
  endpoint: Endpoint
  scope: AuthScope
}

export type GetCustomerToken = (
  clientCredential: ClientCredentials,
  user: User
) => AuthReturnType

export interface SalesChannel {
  (clientCredentials: ClientCredentials, user?: User): AuthReturnType
}

const salesChannel: SalesChannel = async (
  { clientId, endpoint, scope },
  user
) => {
  if (!scope) throw new Error('scope param is required.')
  const credentials: AuthConfig = {
    clientId,
    clientSecret: '',
    accessTokenUri: `${endpoint}/oauth/token`,
    redirectUri: undefined,
    username: user?.username,
    password: user?.password,
  }
  return user
    ? authenticate('owner', credentials, scope)
    : authenticate('clientCredentials', credentials, scope)
}

export default salesChannel

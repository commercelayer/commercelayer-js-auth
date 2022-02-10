import authenticate from './authenticate'
import { ClientCredentials } from './clientCredentials'
import { AuthReturnType, AuthConfig } from './typings'

export interface User {
  username: string
  password: string
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
  const config: AuthConfig = {
    clientId,
    clientSecret: '',
    accessTokenUri: `${endpoint}/oauth/token`,
    redirectUri: undefined,
    username: user?.username,
    password: user?.password,
  }
  return user
    ? authenticate({ type: 'owner', config, scope })
    : authenticate({ type: 'clientCredentials', config, scope })
}

export default salesChannel

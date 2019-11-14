import { AuthScope } from './authenticate'
import { ClientId, Endpoint, AuthReturnType } from './index'

export interface User {
  username: string
  password: string
}

export interface ClientCredentials {
  clientId: ClientId
  endpoint: Endpoint
  scopes: AuthScope
}

export default interface SalesChannel {
  (clientCredentials: ClientCredentials, user?: User): AuthReturnType
}

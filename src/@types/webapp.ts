import {
  ClientId,
  ClientSecret,
  CallbackUrl,
  Endpoint,
  AuthReturnType
} from '.'

import { AuthScope } from './authenticate'

export interface WebappCredentials {
  clientId: ClientId
  clientSecret: ClientSecret
  callbackUrl: CallbackUrl
  endpoint: Endpoint
  scopes?: AuthScope
  location?: string
}

export default interface Webapp {
  (credentials: WebappCredentials): AuthReturnType
}

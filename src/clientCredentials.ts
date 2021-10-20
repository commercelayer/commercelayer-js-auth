import authenticate from './authenticate'
import {
  AuthConfig,
  AuthScope,
  ClientId,
  ClientSecret,
  Endpoint,
} from '#typings'

export type Credentials = {
  clientId: ClientId
  endpoint: Endpoint
} & (
  | {
      scope: AuthScope
      clientSecret?: ClientSecret
    }
  | {
      clientSecret: ClientSecret
      scope?: AuthScope
    }
)

export default async function ClientCredentials(args: Credentials) {
  const { scope, endpoint, clientSecret = '', ...obj } = args
  const credentials: AuthConfig = {
    ...obj,
    clientSecret,
    accessTokenUri: `${endpoint}/oauth/token`,
    redirectUri: '',
  }
  return authenticate('clientCredentials', credentials, scope)
}

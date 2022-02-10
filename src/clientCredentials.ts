import authenticate from './authenticate'
import {
  AuthConfig,
  AuthScope,
  ClientId,
  ClientSecret,
  Endpoint,
} from './typings'

export type ClientCredentials = {
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

export default async function clientCredentials(args: ClientCredentials) {
  const { scope, endpoint, clientSecret = '', ...obj } = args
  const config: AuthConfig = {
    ...obj,
    clientSecret,
    accessTokenUri: `${endpoint}/oauth/token`,
    redirectUri: '',
  }
  return authenticate({ type: 'clientCredentials', config, scope })
}

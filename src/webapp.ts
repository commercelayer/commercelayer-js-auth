import authenticate from './authenticate'
import { AuthConfig } from '#typings/authenticate'
import Webapp from '#typings/webapp'

const webapp: Webapp = async ({
  clientId,
  clientSecret,
  callbackUrl,
  endpoint,
  scope,
  callbackUrlWithCode,
}) => {
  const credentials: AuthConfig = {
    clientId,
    clientSecret,
    accessTokenUri: `${endpoint}/oauth/token`,
    authorizationUri: `${endpoint}/oauth/authorize`,
    redirectUri: callbackUrl,
  }
  return await authenticate(
    'authorizationCode',
    credentials,
    scope,
    callbackUrlWithCode
  )
}

export default webapp

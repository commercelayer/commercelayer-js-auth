import createAuth from './createAuth'
import authorizationCode from './authorizationCode'
import { Authenticate } from '#typings'
import ClientOAuth2 from 'client-oauth2'

const authenticate: Authenticate = async ({
  type,
  config,
  scope,
  code,
  refreshToken,
}) => {
  const auth = createAuth(config)
  let authRes = null
  const opts = {
    scopes: scope,
  } as ClientOAuth2.Options
  if (type === 'clientCredentials') {
    authRes = await auth.credentials.getToken(opts)
  }
  if (type === 'refreshToken' && refreshToken) {
    authRes = await auth
      .createToken('', refreshToken, 'refresh_token', {})
      .refresh()
  }
  if (type === 'owner') {
    authRes = await auth.owner.getToken(
      config.username as string,
      config.password as string,
      opts
    )
  }
  if (type === 'authorizationCode') {
    const uri = auth.code.getUri()
    authRes = await authorizationCode(auth, uri, code)
  }
  return authRes
}

export default authenticate

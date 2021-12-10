import createAuth from './createAuth'
import authorizationCode from './authorizationCode'
import { Authenticate } from '#typings'

const authenticate: Authenticate = async (type, credentials, scope, code) => {
  const auth = createAuth(credentials)
  let authRes = null
  const opts: any = {
    scopes: scope,
  }
  if (type === 'clientCredentials') {
    authRes = await auth.credentials.getToken(opts)
  }
  if (type === 'owner') {
    authRes = await auth.owner.getToken(
      credentials.username as string,
      credentials.password as string,
      opts
    )
  }
  if (type === 'authorizationCode') {
    const uri = auth.code.getUri()
    authRes = await authorizationCode(auth, uri, code)
  }
  console.log(authRes)
  return authRes
}

export default authenticate

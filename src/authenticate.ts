import createAuth from './createAuth'
import authorizationCode from './authorizationCode'
import { Authenticate } from '#typings'

const authenticate: Authenticate = async (type, credentials, scope, code) => {
  const auth = createAuth(credentials)
  let r = null
  const s: any = {
    body: {
      scope,
    },
  }
  if (type === 'clientCredentials') {
    r = await auth.credentials.getToken(s)
  }
  if (type === 'owner') {
    r = await auth.owner.getToken(
      credentials.username as string,
      credentials.password as string,
      s
    )
  }
  if (type === 'authorizationCode') {
    const uri = auth.code.getUri()
    r = await authorizationCode(auth, uri, code)
  }
  return r
}

export default authenticate

import createAuth from './createAuth'
import { Authenticate } from './@types/authenticate'
import authorizationCode from './authorizationCode'

const authenticate: Authenticate = async (type, credentials, scope, code) => {
  const auth = createAuth(credentials)
  let r = null
  const s = {
    body: {
      scope
    }
  }
  if (type === 'clientCredentials') {
    r = await auth.credentials.getToken(s)
  }
  if (type === 'owner') {
    r = await auth.owner.getToken(credentials.username, credentials.password, s)
  }
  if (type === 'authorizationCode') {
    const uri = auth.code.getUri()
    r = await authorizationCode(auth, uri, code)
  }
  return r
}

export default authenticate

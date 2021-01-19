import AuthorizationCode from '#typings/authorizationCode'

const authorizationCode: AuthorizationCode = async (auth, uri, code) => {
  if (code) {
    return await auth.code.getToken(code)
  }
  if (!window && !window.document) {
    throw new Error('Authorization code works only in a Web context')
  }
  window.open(uri)
  return null
}

export default authorizationCode

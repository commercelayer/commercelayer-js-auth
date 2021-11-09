import * as ClientOAuth2 from 'client-oauth2'
import { AuthReturnType } from './typings'

export interface AuthorizationCode {
  (auth: ClientOAuth2, uri: string, code?: string): AuthReturnType
}

const authorizationCode: AuthorizationCode = async (auth, uri, code) => {
  if (code) {
    return await auth.code.getToken(code)
  }
  if (!window) {
    throw new Error('Authorization code works only in a Web context')
  }
  window.open(uri)
  return null
}

export default authorizationCode

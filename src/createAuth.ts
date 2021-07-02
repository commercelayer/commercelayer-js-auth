import * as ClientOAuth2 from 'client-oauth2'

export interface AuthOptions extends ClientOAuth2.Options {
  clientId: string
  accessTokenUri: string
}

const createAuth = (credentials: AuthOptions) => new ClientOAuth2(credentials)
export default createAuth

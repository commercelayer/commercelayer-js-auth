import * as ClientOAuth2 from 'client-oauth2'
import Credentials from './@types/createAuth'

const createAuth = (credentials: Credentials) => new ClientOAuth2(credentials)
export default createAuth

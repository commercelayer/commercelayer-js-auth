import SalesChannel from './@types/salesChannel'
import authenticate from './authenticate'
import { AuthConfig } from './@types/authenticate'

const salesChannel: SalesChannel = async (
  { clientId, endpoint, scope },
  user
) => {
  if (!scope) throw new Error('scope param is required.')
  const credentials: AuthConfig = {
    clientId,
    clientSecret: '',
    accessTokenUri: `${endpoint}/oauth/token`,
    redirectUri: null,
    username: user?.username,
    password: user?.password
  }
  return user
    ? authenticate('owner', credentials, scope)
    : authenticate('clientCredentials', credentials, scope)
}

export default salesChannel

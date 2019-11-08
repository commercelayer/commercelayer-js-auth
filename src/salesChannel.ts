import SalesChannel from './@types/salesChannel'
import authenticate from './authenticate'
import { AuthConfig } from './@types/authenticate'

const salesChannel: SalesChannel = async (clientId, endpoint, scopes, user) => {
	const credentials: AuthConfig = {
		clientId,
		clientSecret: '',
		accessTokenUri: `${endpoint}/oauth/token`,
		redirectUri: '',
		username: user?.username,
		password: user?.password
	}
	return user ? authenticate('owner', credentials, scopes) : authenticate('clientCredentials', credentials, scopes)
}

export default salesChannel

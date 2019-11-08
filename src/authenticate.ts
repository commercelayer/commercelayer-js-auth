import createAuth from './createAuth'
import { Authenticate } from './@types/authenticate'
import authorizationCode from './authorizationCode'

// TODO: Add types
const authenticate: Authenticate = async (
	type,
	credentials,
	scope,
	serverSide,
	code
) => {
	const auth = createAuth(credentials)
	let r = null
	const s = {
		scope
	}
	if (type === 'clientCredentials') {
		r = await auth.credentials.getToken()
	}
	if (type === 'owner') {
		r = await auth.owner.getToken(credentials.username, credentials.password)
	}
	if (type === 'authorizationCode') {
		const uri = auth.code.getUri()
		if (serverSide) {
			r = auth.code
		} else {
			r = await authorizationCode(auth, uri, code)
		}
	}
	return r
}

export default authenticate

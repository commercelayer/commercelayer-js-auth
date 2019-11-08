import { ClientId, ClientSecret, Endpoint, AuthReturnType } from './index'
import { User } from './salesChannel'
import { AuthScope } from './authenticate'
import { Token } from 'client-oauth2'
export default interface Integration {
	(
		clientId: ClientId,
		clientSecret: ClientSecret,
		endpoint: Endpoint,
		scopes?: AuthScope,
		user?: User
	): AuthReturnType
}

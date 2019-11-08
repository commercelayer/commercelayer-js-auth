import { Token } from 'client-oauth2'
import { AuthScope } from './authenticate'
import { ClientId, Endpoint, AuthReturnType } from './index'

export interface User {
	username: string
	password: string
}

export default interface SalesChannel {
	(
		clientId: ClientId,
		endpoint: Endpoint,
		scopes: AuthScope,
		user?: User
	): AuthReturnType
}

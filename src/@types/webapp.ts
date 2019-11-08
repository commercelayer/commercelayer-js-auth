import {
	ClientId,
	ClientSecret,
	CallbackUrl,
	Endpoint,
	AuthReturnType
} from '.'

import { AuthScope } from './authenticate'

export default interface Webapp {
	(
		clientId: ClientId,
		clientSecret: ClientSecret,
		callbackUrl: CallbackUrl,
		endpoint: Endpoint,
		scopes?: AuthScope,
		serverSide?: boolean,
		code?: string
	): AuthReturnType
}

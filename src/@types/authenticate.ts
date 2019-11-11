import { Token, CodeFlow } from 'client-oauth2'

export interface AuthConfig {
	clientId: string
	clientSecret?: string
	accessTokenUri: string
	authorizationUri?: string
	redirectUri?: string
	username?: string
	password?: string
}

export type AuthType = 'clientCredentials' | 'owner' | 'authorizationCode'

export type AuthScope = string[] | string

export interface Authenticate {
	(
		type: AuthType,
		config: AuthConfig,
		scope?: AuthScope,
		code?: string
	): Promise<Token | CodeFlow | void>
}

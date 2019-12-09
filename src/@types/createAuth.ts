import { Options } from 'client-oauth2'

export default interface AuthOptions extends Options {
	clientId: string
	accessTokenUri: string
}
import { Token } from 'client-oauth2'
import SalesChannel from './salesChannel'
import Integration from './integration'
import Webapp from './webapp'

export type ClientId = string
export type ClientSecret = string
export type CallbackUrl = string
export type Endpoint = string
export type AuthReturnType = Promise<Token> | null

export default interface CLayerAuthInterface {
	salesChannel: SalesChannel
	integration: Integration
	webapp: Webapp
}

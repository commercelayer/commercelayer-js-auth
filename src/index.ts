import salesChannel, { GetCustomerToken, User } from './salesChannel'
import integration from './integration'
import webapp, { GetWebappToken } from './webapp'
import clientCredentials, { ClientCredentials } from './clientCredentials'
import { AuthReturnType, AuthScope, ClientId, ClientSecret } from './typings'

const getSalesChannelToken = salesChannel
const getCustomerToken: GetCustomerToken = salesChannel
const getIntegrationToken = integration
const authorizeWebapp = webapp
const getWebappToken: GetWebappToken = webapp

export {
  authorizeWebapp,
  clientCredentials,
  getCustomerToken,
  getIntegrationToken,
  getSalesChannelToken,
  getWebappToken,
  ClientCredentials,
  User,
  AuthReturnType,
  AuthScope,
  ClientId,
  ClientSecret
}

const CLayerAuth = {
  authorizeWebapp,
  clientCredentials,
  getCustomerToken,
  getIntegrationToken,
  getSalesChannelToken,
  getWebappToken,
}

export default CLayerAuth

import salesChannel, { GetCustomerToken, User } from './salesChannel'
import integration from './integration'
import webapp, { GetWebappToken } from './webapp'
import clientCredentials, { ClientCredentials } from './clientCredentials'
import { AuthReturnType, AuthScope, ClientId, ClientSecret } from './typings'
import getRefreshToken from './refreshToken'

const authorizeWebapp = webapp
const getCustomerToken: GetCustomerToken = salesChannel
const getIntegrationToken = integration
const getSalesChannelToken = salesChannel
const getWebappToken: GetWebappToken = webapp

export {
  AuthReturnType,
  AuthScope,
  ClientCredentials,
  ClientId,
  ClientSecret,
  User,
  authorizeWebapp,
  clientCredentials,
  getCustomerToken,
  getIntegrationToken,
  getRefreshToken,
  getSalesChannelToken,
  getWebappToken,
}

const CLayerAuth = {
  authorizeWebapp,
  clientCredentials,
  getCustomerToken,
  getIntegrationToken,
  getRefreshToken,
  getSalesChannelToken,
  getWebappToken,
}

export default CLayerAuth

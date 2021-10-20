import salesChannel, { GetCustomerToken } from './salesChannel'
import integration from './integration'
import webapp, { GetWebappToken } from './webapp'
import clientCredentials from './clientCredentials'

const getSalesChannelToken = salesChannel
const getCustomerToken: GetCustomerToken = salesChannel
const getIntegrationToken = integration
const authorizeWebapp = webapp
// TODO: new function
const getWebappToken: GetWebappToken = webapp

export {
  authorizeWebapp,
  clientCredentials,
  getCustomerToken,
  getIntegrationToken,
  getSalesChannelToken,
  getWebappToken,
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

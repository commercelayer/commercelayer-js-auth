import salesChannel, { GetCustomerToken } from './salesChannel'
import integration from './integration'
import webapp, { GetWebappToken } from './webapp'

const getSalesChannelToken = salesChannel
const getCustomerToken: GetCustomerToken = salesChannel
const getIntegrationToken = integration
const authorizeWebapp = webapp
// TODO: new function
const getWebappToken: GetWebappToken = webapp

export {
  getSalesChannelToken,
  getCustomerToken,
  getIntegrationToken,
  authorizeWebapp,
  getWebappToken,
}

const CLayerAuth = {
  getSalesChannelToken,
  getCustomerToken,
  getIntegrationToken,
  authorizeWebapp,
  getWebappToken,
}

export default CLayerAuth

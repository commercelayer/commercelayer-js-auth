import salesChannel from './salesChannel'
import integration from './integration'
import webapp from './webapp'
import CLayerAuthInterface from './@types'
import { GetCustomerToken } from './@types/salesChannel'
import { GetWebappToken } from './@types/webapp'

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
  getWebappToken
}

const CLayerAuth: CLayerAuthInterface = {
  getSalesChannelToken,
  getCustomerToken,
  getIntegrationToken,
  authorizeWebapp,
  getWebappToken
}

export default CLayerAuth

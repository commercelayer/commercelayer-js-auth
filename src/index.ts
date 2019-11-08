import salesChannel from './salesChannel'
import integration from './integration'
import webapp from './webapp'
import CLayerAuthInterface from './@types'

export { salesChannel, integration, webapp }

const CLayerAuth: CLayerAuthInterface = {
	salesChannel,
	integration,
	webapp
}

export default CLayerAuth

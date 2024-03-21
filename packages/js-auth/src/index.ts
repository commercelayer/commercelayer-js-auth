export { authenticate } from './authenticate.js'
export {
  jwtDecode,
  jwtIsDashboard,
  jwtIsIntegration,
  jwtIsProvisioning,
  jwtIsSalesChannel,
  jwtIsWebApp
} from './jwtDecode.js'

export type {
  AuthenticateOptions,
  AuthenticateReturn,
  GrantType
} from './types/index.js'

export { authenticate } from './authenticate.js'

export {
  jwtDecode,
  jwtIsDashboard,
  jwtIsIntegration,
  jwtIsUser,
  jwtIsSalesChannel,
  jwtIsWebApp
} from './jwtDecode.js'

export { createAssertion } from './jwtEncode.js'

export type {
  AuthenticateOptions,
  AuthenticateReturn,
  GrantType
} from './types/index.js'

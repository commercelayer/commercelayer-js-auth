export { authenticate } from './authenticate.js'
export { revoke } from './revoke.js'

export {
  jwtDecode,
  jwtIsDashboard,
  jwtIsIntegration,
  jwtIsSalesChannel,
  jwtIsUser,
  jwtIsWebApp
} from './jwtDecode.js'

export { createAssertion } from './jwtEncode.js'

export type {
  AuthenticateOptions,
  AuthenticateReturn,
  GrantType,
  RevokeOptions,
  RevokeReturn
} from './types/index.js'

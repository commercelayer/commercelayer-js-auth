export { authenticate } from './authenticate.js'
export { revoke } from './revoke.js'

export {
  jwtDecode,
  jwtIsDashboard,
  jwtIsIntegration,
  jwtIsSalesChannel,
  jwtIsUser,
  jwtIsWebApp,
  type JWTDashboard,
  type JWTIntegration,
  type JWTSalesChannel,
  type JWTUser,
  type JWTWebApp
} from './jwtDecode.js'

export { jwtVerify } from './jwtVerify.js'

export { createAssertion } from './jwtEncode.js'

export type {
  AuthenticateOptions,
  AuthenticateReturn,
  GrantType,
  RevokeOptions,
  RevokeReturn
} from './types/index.js'

export { InvalidTokenError } from './errors/InvalidTokenError.js'
export { TokenError } from './errors/TokenError.js'
export { TokenExpiredError } from './errors/TokenExpiredError.js'

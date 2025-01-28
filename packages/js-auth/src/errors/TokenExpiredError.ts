import { TokenError } from "./TokenError.js"

/**
 * The token expired.
 */
export class TokenExpiredError extends TokenError {
  constructor() {
    super("Token expired")
    this.name = "TokenExpiredError"
  }
}

import { TokenError } from "./TokenError.js"

/**
 * The token is not valid.
 */
export class InvalidTokenError extends TokenError {
  constructor(message: string) {
    super(message)
    this.name = "InvalidTokenError"
  }
}

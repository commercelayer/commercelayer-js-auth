import type { TBaseOptions } from '#types/index.js'

/**
 * The client credentials grant type is used by clients to obtain an access token outside of the context of a user.
 * @see https://docs.commercelayer.io/core/authentication/client-credentials
 */
export interface TClientCredentials extends TBaseOptions {
  clientSecret?: string
}

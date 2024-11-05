export interface TBaseOptions {
  /**
   * The application's client_id.
   */
  clientId: string
  /**
   * [The access token scope](https://docs.commercelayer.io/core/authentication#authorization-scopes) (market, store, and/or stock location).
   *
   * The access token scope is a string that can be composed in two ways:
   * * by **ID** — `{{resource_name}}:id:{{resource_id}}`\
   *   Where `{{resource_name}}` can be one of market, store, or stock_location, and `{{resource_id}}` is the id of the resource (e.g. `market:id:xYZkjABcde`, `store:id:bGvCXzYgNB`, `stock_location:id:WLgbSXqyoZ`).\
   *
   * * by **code** — `{{resource_name}}:code:{{resource_code}}`
   * Where `{{resource_name}}` can be one of market, store, or stock_location, and `{{resource_code}}` is the code of the resource (e.g. `market:code:europe`, `store:code:outlet_ny`, `stock_location:code:eu_warehouse`).
   */
  scope?: string
  /**
   * The Commerce Layer's domain.
   */
  domain?: string
  /**
   * An optional object containing the HTTP request headers to be sent with the request.
   */
  headers?: {
    /**
     * Optional header for backend authentication. This key is mandatory for using the `x-true-client-ip` header
     * to forward the client IP address, which helps in managing rate limits effectively by identifying
     * unique client requests.
     *
     * **Note: This is an enterprise feature.**
     */
    'x-backend-auth'?: string
    /**
     * Optional header to forward the client IP address in server-side requests. Its use requires the presence of
     * the `x-backend-auth` header for authentication. This approach helps to differentiate between client requests
     * and manage rate limits based on individual client IP addresses rather than the server's IP address alone.
     *
     * **Note: This is an enterprise feature.**
     */
    'x-true-client-ip'?: string
    /**
     * Allows for additional headers as needed, where each key is the header name and the value is the header content.
     * Header values should be strings, or `undefined` if the header is not set.
     */
    [key: string]: string | undefined
  }
}

export type TBaseReturn = {
  /**
   * The access token.
   */
  accessToken: string
  /**
   * The token type.
   */
  tokenType: 'bearer'
  /**
   * The access token expiration time in seconds.
   */
  expiresIn: number
  /**
   * The access token expiration date.
   */
  expires: Date
  /**
   * [The access token scope](https://docs.commercelayer.io/core/authentication#authorization-scopes) (market, store, and/or stock location).
   */
  scope: string
  /**
   * The creation date of the access token.
   */
  createdAt: number
} & TError

export interface TError {
  /**
   * The list of errors when something goes wrong.
   */
  errors?: Array<{
    code: string
    detail: string
    meta: Record<string, unknown>
    status: 401
    title: string
  }>
}

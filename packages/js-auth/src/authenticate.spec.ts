import { authenticate, createAssertion, jwtDecode } from './index.js'

const clientId = process.env.VITE_TEST_SALES_CHANNEL_CLIENT_ID
const integrationClientId = process.env.VITE_TEST_INTEGRATION_CLIENT_ID
const clientSecret = process.env.VITE_TEST_INTEGRATION_CLIENT_SECRET
const domain = process.env.VITE_TEST_DOMAIN
const scope = process.env.VITE_TEST_SCOPE
const username = process.env.VITE_TEST_USERNAME
const password = process.env.VITE_TEST_PASSWORD

describe('Organization auth', () => {
  it('should throw an error when the clientId is not valid.', async () => {
    const response = await authenticate('client_credentials', {
      clientId: 'wrong-client-id',
      domain,
      scope
    })

    expect(response).toHaveProperty('errors')
    expect(response.errors).toBeInstanceOf(Array)
    expect(response.errors?.[0]).toMatchObject({
      code: 'UNAUTHORIZED',
      detail:
        'Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.',
      status: 401,
      title: 'invalid_client'
    })

    expect(response).not.toHaveProperty('accessToken')
    expect(response).not.toHaveProperty('tokenType')
    expect(response).not.toHaveProperty('expiresIn')
    expect(response).not.toHaveProperty('scope')
    expect(response).not.toHaveProperty('createdAt')
  })

  it('should return an access token with the application kind `sales_channel` (grantType: `client_credentials`).', async () => {
    const response = await authenticate('client_credentials', {
      clientId,
      domain
    })

    expect(response).keys(
      'accessToken',
      'createdAt',
      'expires',
      'expiresIn',
      'scope',
      'tokenType'
    )

    expect(response.expires).toBeInstanceOf(Date)
    expect(response.expires.getTime()).toBeGreaterThan(Date.now())

    expect(jwtDecode(response.accessToken)).toMatchObject({
      header: {
        alg: 'RS512',
        typ: 'JWT'
      },
      payload: {
        application: {
          kind: 'sales_channel',
          public: true
        },
        organization: {
          slug: process.env.VITE_TEST_SLUG,
          enterprise: true,
          region: 'eu-west-1'
        },
        iss: 'https://commercelayer.io',
        scope: 'market:all',
        test: true
      }
    })

    expect(jwtDecode(response.accessToken).payload).toHaveProperty(
      'organization.id'
    )
    expect(jwtDecode(response.accessToken).payload).toHaveProperty(
      'application.id'
    )
  })

  it('should return an access token with the application kind `integration` (grantType: `client_credentials`).', async () => {
    const response = await authenticate('client_credentials', {
      clientId: integrationClientId,
      clientSecret,
      domain
    })

    expect(response).keys(
      'accessToken',
      'createdAt',
      'expires',
      'expiresIn',
      'scope',
      'tokenType'
    )

    expect(response.expires).toBeInstanceOf(Date)
    expect(response.expires.getTime()).toBeGreaterThan(Date.now())

    expect(jwtDecode(response.accessToken)).toMatchObject({
      header: {
        alg: 'RS512',
        typ: 'JWT'
      },
      payload: {
        application: {
          kind: 'integration',
          public: false
        },
        organization: {
          slug: process.env.VITE_TEST_SLUG,
          enterprise: true,
          region: 'eu-west-1'
        },
        iss: 'https://commercelayer.io',
        scope: 'market:all',
        test: true
      }
    })

    expect(jwtDecode(response.accessToken).payload).toHaveProperty(
      'organization.id'
    )
    expect(jwtDecode(response.accessToken).payload).toHaveProperty(
      'application.id'
    )
  })

  it('should return an access token with the application kind `sales_channel` (grantType: `password`).', async () => {
    const response = await authenticate('password', {
      clientId,
      domain,
      username,
      password,
      scope
    })

    expect(response).keys(
      'accessToken',
      'createdAt',
      'expires',
      'expiresIn',
      'scope',
      'tokenType',
      'ownerId',
      'ownerType',
      'refreshToken'
    )

    expect(response.expires).toBeInstanceOf(Date)
    expect(response.expires.getTime()).toBeGreaterThan(Date.now())

    expect(jwtDecode(response.accessToken)).toMatchObject({
      header: {
        alg: 'RS512',
        typ: 'JWT'
      },
      payload: {
        application: {
          kind: 'sales_channel',
          public: true
        },
        organization: {
          slug: process.env.VITE_TEST_SLUG,
          enterprise: true,
          region: 'eu-west-1'
        },
        owner: {
          type: 'Customer',
          id: process.env.VITE_TEST_CUSTOMER_ID
        },
        market: {
          geocoder_id: null,
          allows_external_prices: false
        },
        iss: 'https://commercelayer.io',
        scope,
        test: true
      }
    })

    expect(jwtDecode(response.accessToken).payload).toHaveProperty(
      'organization.id'
    )
    expect(jwtDecode(response.accessToken).payload).toHaveProperty(
      'application.id'
    )
    expect(jwtDecode(response.accessToken).payload).toHaveProperty('market.id')
    expect(jwtDecode(response.accessToken).payload).toHaveProperty(
      'market.price_list_id'
    )
    expect(jwtDecode(response.accessToken).payload).toHaveProperty(
      'market.stock_location_ids'
    )
  })

  it('should be able to refresh a customer token.', async () => {
    const customerResponse = await authenticate('password', {
      clientId,
      domain,
      username,
      password,
      scope
    })

    const refreshResponse = await authenticate('refresh_token', {
      clientId,
      domain,
      refreshToken: customerResponse.refreshToken,
      scope
    })

    expect(refreshResponse).keys(
      'accessToken',
      'createdAt',
      'expires',
      'expiresIn',
      'scope',
      'tokenType',
      'ownerId',
      'ownerType',
      'refreshToken'
    )

    expect(refreshResponse.expires).toBeInstanceOf(Date)
    expect(refreshResponse.expires.getTime()).toBeGreaterThan(Date.now())

    expect(jwtDecode(refreshResponse.accessToken)).toMatchObject({
      header: {
        alg: 'RS512',
        typ: 'JWT'
      },
      payload: {
        application: {
          kind: 'sales_channel',
          public: true
        },
        organization: {
          slug: process.env.VITE_TEST_SLUG,
          enterprise: true,
          region: 'eu-west-1'
        },
        owner: {
          type: 'Customer',
          id: process.env.VITE_TEST_CUSTOMER_ID
        },
        market: {
          geocoder_id: null,
          allows_external_prices: false
        },
        iss: 'https://commercelayer.io',
        scope,
        test: true
      }
    })

    expect(jwtDecode(refreshResponse.accessToken).payload).toHaveProperty(
      'organization.id'
    )
    expect(jwtDecode(refreshResponse.accessToken).payload).toHaveProperty(
      'application.id'
    )
    expect(jwtDecode(refreshResponse.accessToken).payload).toHaveProperty(
      'market.id'
    )
    expect(jwtDecode(refreshResponse.accessToken).payload).toHaveProperty(
      'market.price_list_id'
    )
    expect(jwtDecode(refreshResponse.accessToken).payload).toHaveProperty(
      'market.stock_location_ids'
    )
  })
})

describe.skip('authorization_code', () => {})

describe('Provisioning auth', () => {
  it('should return an access token with the application kind `user` (grantType: `client_credentials`)', async () => {
    const response = await authenticate('client_credentials', {
      domain: process.env.VITE_TEST_PROVISIONING_DOMAIN,
      clientId: process.env.VITE_TEST_PROVISIONING_CLIENT_ID,
      clientSecret: process.env.VITE_TEST_PROVISIONING_CLIENT_SECRET
    })

    expect(response).keys(
      'accessToken',
      'createdAt',
      'expires',
      'expiresIn',
      'scope',
      'tokenType'
    )

    expect(response.expires).toBeInstanceOf(Date)
    expect(response.expires.getTime()).toBeGreaterThan(Date.now())

    expect(jwtDecode(response.accessToken)).toMatchObject({
      header: {
        alg: 'RS512',
        typ: 'JWT'
      },
      payload: {
        iss: 'https://commercelayer.io',
        application: {
          kind: 'user',
          public: false
        },
        test: false
      }
    })

    expect(jwtDecode(response.accessToken).payload).toHaveProperty('user.id')
    expect(jwtDecode(response.accessToken).payload.scope).toContain(
      'provisioning-api'
    )
  })
})

describe('JWT Bearer', () => {
  describe('with a `sales_channel` grant type', () => {
    runJWTBearerTests(
      process.env.VITE_TEST_SALES_CHANNEL_CLIENT_ID,
      process.env.VITE_TEST_SALES_CHANNEL_CLIENT_SECRET,
      {
        application: {
          kind: 'sales_channel',
          public: true
        }
      }
    )
  })

  describe('with an `integration` grant type', () => {
    runJWTBearerTests(
      process.env.VITE_TEST_INTEGRATION_CLIENT_ID,
      process.env.VITE_TEST_INTEGRATION_CLIENT_SECRET,
      {
        application: {
          kind: 'integration',
          public: false
        }
      }
    )
  })

  describe('with an `authorization_code` grant type', () => {
    runJWTBearerTests(
      process.env.VITE_TEST_AUTHORIZATION_CODE_CLIENT_ID,
      process.env.VITE_TEST_AUTHORIZATION_CODE_CLIENT_SECRET,
      {
        application: {
          kind: 'webapp',
          public: false
        }
      }
    )
  })
})

function runJWTBearerTests(
  clientId: string,
  clientSecret: string,
  overridePayload: Record<string, unknown> = {}
): void {
  it('should throw an assertion error when the assertion is empty.', async () => {
    const response = await authenticate(
      'urn:ietf:params:oauth:grant-type:jwt-bearer',
      {
        clientId,
        clientSecret,
        domain: process.env.VITE_TEST_DOMAIN,
        assertion: await createAssertion({
          payload: {
            // @ts-expect-error I want to test this scenario
            'https://commercelayer.io/claims': {}
          }
        })
      }
    )

    expect(response).toHaveProperty('errors')
    expect(response.errors).toBeInstanceOf(Array)
    expect(response.errors?.[0]).toMatchObject({
      code: 'BAD_REQUEST',
      detail: 'The provided assertion is invalid.',
      status: 400,
      title: 'invalid_assertion'
    })
  })

  it('should return an access token with custom claims.', async () => {
    const response = await authenticate(
      'urn:ietf:params:oauth:grant-type:jwt-bearer',
      {
        clientId,
        clientSecret,
        domain: process.env.VITE_TEST_DOMAIN,
        assertion: await createAssertion({
          payload: {
            'https://commercelayer.io/claims': {
              custom_claim: {
                app: 'supabase'
              }
            }
          }
        })
      }
    )

    expect(response).keys(
      'accessToken',
      'createdAt',
      'expires',
      'expiresIn',
      'refreshToken',
      'scope',
      'tokenType'
    )

    expect(jwtDecode(response.accessToken)).toMatchObject({
      header: {
        alg: 'RS512',
        typ: 'JWT'
      },
      payload: {
        custom_claim: {
          app: 'supabase'
        },
        iss: 'https://commercelayer.io',
        organization: {
          enterprise: true,
          region: 'eu-west-1',
          slug: process.env.VITE_TEST_SLUG
        },
        scope: 'market:all',
        test: true,
        ...overridePayload
      }
    })

    expect(jwtDecode(response.accessToken).payload).not.toHaveProperty('owner')
  })

  it('should return an access token with a `User` as the owner.', async () => {
    const response = await authenticate(
      'urn:ietf:params:oauth:grant-type:jwt-bearer',
      {
        clientId,
        clientSecret,
        domain: process.env.VITE_TEST_DOMAIN,
        assertion: await createAssertion({
          payload: {
            'https://commercelayer.io/claims': {
              owner: {
                type: 'User',
                id: process.env.VITE_TEST_USER_ID
              }
            }
          }
        })
      }
    )

    expect(response).keys(
      'accessToken',
      'createdAt',
      'expires',
      'expiresIn',
      'refreshToken',
      'scope',
      'tokenType',
      'ownerType',
      'ownerId'
    )

    expect(response).toHaveProperty('ownerType', 'user')
    expect(response).toHaveProperty('ownerId', process.env.VITE_TEST_USER_ID)

    expect(jwtDecode(response.accessToken)).toMatchObject({
      header: {
        alg: 'RS512',
        typ: 'JWT'
      },
      payload: {
        owner: {
          type: 'User',
          id: process.env.VITE_TEST_USER_ID
        },
        iss: 'https://commercelayer.io',
        organization: {
          enterprise: true,
          region: 'eu-west-1',
          slug: process.env.VITE_TEST_SLUG
        },
        scope: 'market:all',
        test: true,
        ...overridePayload
      }
    })

    expect(jwtDecode(response.accessToken).payload).not.toHaveProperty(
      'custom_claim'
    )
  })

  it('should return an access token with a `Customer` as the owner.', async () => {
    const response = await authenticate(
      'urn:ietf:params:oauth:grant-type:jwt-bearer',
      {
        clientId,
        clientSecret,
        domain: process.env.VITE_TEST_DOMAIN,
        assertion: await createAssertion({
          payload: {
            'https://commercelayer.io/claims': {
              owner: {
                type: 'Customer',
                id: process.env.VITE_TEST_CUSTOMER_ID
              }
            }
          }
        })
      }
    )

    expect(response).keys(
      'accessToken',
      'createdAt',
      'expires',
      'expiresIn',
      'refreshToken',
      'scope',
      'tokenType',
      'ownerType',
      'ownerId'
    )

    expect(response).toHaveProperty('ownerType', 'customer')
    expect(response).toHaveProperty(
      'ownerId',
      process.env.VITE_TEST_CUSTOMER_ID
    )

    expect(jwtDecode(response.accessToken)).toMatchObject({
      header: {
        alg: 'RS512',
        typ: 'JWT'
      },
      payload: {
        owner: {
          type: 'Customer',
          id: process.env.VITE_TEST_CUSTOMER_ID
        },
        iss: 'https://commercelayer.io',
        organization: {
          enterprise: true,
          region: 'eu-west-1',
          slug: process.env.VITE_TEST_SLUG
        },
        scope: 'market:all',
        test: true,
        ...overridePayload
      }
    })

    expect(jwtDecode(response.accessToken).payload).not.toHaveProperty(
      'custom_claim'
    )
  })

  it('should return an access token with a `Customer` as the owner and custom claims.', async () => {
    const assertion = await createAssertion({
      payload: {
        'https://commercelayer.io/claims': {
          owner: {
            type: 'Customer',
            id: process.env.VITE_TEST_CUSTOMER_ID
          },
          custom_claim: {
            first_name: 'John',
            last_name: 'Doe'
          }
        }
      }
    })

    const response = await authenticate(
      'urn:ietf:params:oauth:grant-type:jwt-bearer',
      {
        clientId,
        clientSecret,
        domain: process.env.VITE_TEST_DOMAIN,
        assertion
      }
    )

    expect(response).keys(
      'accessToken',
      'createdAt',
      'expires',
      'expiresIn',
      'refreshToken',
      'scope',
      'tokenType',
      'ownerType',
      'ownerId'
    )

    expect(response).toHaveProperty('ownerType', 'customer')
    expect(response).toHaveProperty(
      'ownerId',
      process.env.VITE_TEST_CUSTOMER_ID
    )

    expect(jwtDecode(response.accessToken)).toMatchObject({
      header: {
        alg: 'RS512',
        typ: 'JWT'
      },
      payload: {
        owner: {
          type: 'Customer',
          id: process.env.VITE_TEST_CUSTOMER_ID
        },
        custom_claim: {
          first_name: 'John',
          last_name: 'Doe'
        },
        iss: 'https://commercelayer.io',
        organization: {
          enterprise: true,
          region: 'eu-west-1',
          slug: process.env.VITE_TEST_SLUG
        },
        scope: 'market:all',
        test: true,
        ...overridePayload
      }
    })
  })
}

import { authenticate, createAssertion, jwtDecode } from './index.js'

const clientId = process.env.VITE_TEST_SALES_CHANNEL_CLIENT_ID
const integrationClientId = process.env.VITE_TEST_INTEGRATION_CLIENT_ID
const clientSecret = process.env.VITE_TEST_INTEGRATION_CLIENT_SECRET
const domain = process.env.VITE_TEST_DOMAIN
const scope = process.env.VITE_TEST_SCOPE
const username = process.env.VITE_TEST_USERNAME
const password = process.env.VITE_TEST_PASSWORD

describe('Organization auth', () => {
  it('Get a sales channel token', async () => {
    const res = await authenticate('client_credentials', {
      clientId,
      domain
    })

    expect(res).toHaveProperty('accessToken')
    expect(res).toHaveProperty('tokenType')
    expect(res).toHaveProperty('expiresIn')
    expect(res).toHaveProperty('scope')
    expect(res).toHaveProperty('createdAt')
    expect(res).toHaveProperty('expires')
    expect(res.expires).toBeInstanceOf(Date)
    expect(res.expires.getTime()).toBeGreaterThan(Date.now())
  })

  it('Get an error requesting a sales channel token', async () => {
    const res = await authenticate('client_credentials', {
      clientId: 'wrong-client-id',
      domain,
      scope
    })

    expect(res).toHaveProperty('errors')
    expect(res.errors).toBeInstanceOf(Array)
    expect(res.errors?.[0]).toMatchObject({
      code: 'UNAUTHORIZED',
      detail:
        'Client authentication failed due to unknown client, no client authentication included, or unsupported authentication method.',
      status: 401,
      title: 'invalid_client'
    })

    expect(res).not.toHaveProperty('accessToken')
    expect(res).not.toHaveProperty('tokenType')
    expect(res).not.toHaveProperty('expiresIn')
    expect(res).not.toHaveProperty('scope')
    expect(res).not.toHaveProperty('createdAt')
  })

  it('Get a integration token', async () => {
    const res = await authenticate('client_credentials', {
      clientId: integrationClientId,
      clientSecret,
      domain
    })

    expect(res).toHaveProperty('accessToken')
    expect(res).toHaveProperty('tokenType')
    expect(res).toHaveProperty('expiresIn')
    expect(res).toHaveProperty('scope')
    expect(res).toHaveProperty('createdAt')
  })

  it('Get a customer token', async () => {
    const res = await authenticate('password', {
      clientId,
      domain,
      username,
      password,
      scope
    })

    expect(res).toHaveProperty('accessToken')
    expect(res).toHaveProperty('tokenType')
    expect(res).toHaveProperty('expiresIn')
    expect(res).toHaveProperty('scope')
    expect(res).toHaveProperty('createdAt')
    expect(res).toHaveProperty('ownerId')
    expect(res).toHaveProperty('ownerType')
    expect(res).toHaveProperty('refreshToken')
  })

  it('Refresh a customer token', async () => {
    const res = await authenticate('password', {
      clientId,
      domain,
      username,
      password,
      scope
    })

    expect(res).toHaveProperty('accessToken')
    expect(res).toHaveProperty('tokenType')
    expect(res).toHaveProperty('expiresIn')
    expect(res).toHaveProperty('scope')
    expect(res).toHaveProperty('createdAt')
    expect(res).toHaveProperty('ownerId')
    expect(res).toHaveProperty('ownerType')
    expect(res).toHaveProperty('refreshToken')

    const res2 = await authenticate('refresh_token', {
      clientId,
      domain,
      refreshToken: res.refreshToken,
      scope
    })

    expect(res2).toHaveProperty('accessToken')
    expect(res2).toHaveProperty('tokenType')
    expect(res2).toHaveProperty('expiresIn')
    expect(res2).toHaveProperty('scope')
    expect(res2).toHaveProperty('createdAt')
    expect(res2).toHaveProperty('ownerId')
    expect(res2).toHaveProperty('ownerType')
    expect(res2).toHaveProperty('refreshToken')
  })

  it('Set a custom header', async () => {
    const res = await authenticate('password', {
      clientId,
      domain,
      username,
      password,
      scope,
      headers: {
        'X-My-Header': 'My-Value'
      }
    })

    expect(res).toHaveProperty('accessToken')
    expect(res).toHaveProperty('tokenType')
    expect(res).toHaveProperty('expiresIn')
    expect(res).toHaveProperty('scope')
    expect(res).toHaveProperty('createdAt')
    expect(res).toHaveProperty('ownerId')
    expect(res).toHaveProperty('ownerType')
    expect(res).toHaveProperty('refreshToken')
  })
})

describe('Provisioning auth', () => {
  it('Get a provisioning token', async () => {
    const res = await authenticate('client_credentials', {
      domain: process.env.VITE_TEST_PROVISIONING_DOMAIN,
      clientId: process.env.VITE_TEST_PROVISIONING_CLIENT_ID,
      clientSecret: process.env.VITE_TEST_PROVISIONING_CLIENT_SECRET
    })

    expect(res).toHaveProperty('accessToken')
    expect(res).toHaveProperty('tokenType')
    expect(res).toHaveProperty('expiresIn')
    expect(res).toHaveProperty('scope')
    expect(res).toHaveProperty('createdAt')
    expect(res).toHaveProperty('expires')
    expect(res.expires).toBeInstanceOf(Date)
    expect(res.expires.getTime()).toBeGreaterThan(Date.now())
  })
})

describe('JWT Bearer', () => {
  it('should throw an assertion when the assertion is empty.', async () => {
    const response = await authenticate(
      'urn:ietf:params:oauth:grant-type:jwt-bearer',
      {
        clientId: process.env.VITE_TEST_SALES_CHANNEL_CLIENT_ID,
        clientSecret: process.env.VITE_TEST_SALES_CHANNEL_CLIENT_SECRET,
        domain: process.env.VITE_TEST_DOMAIN,
        assertion: await createAssertion({
          payload: {
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
        clientId: process.env.VITE_TEST_SALES_CHANNEL_CLIENT_ID,
        clientSecret: process.env.VITE_TEST_SALES_CHANNEL_CLIENT_SECRET,
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
        application: {
          kind: 'sales_channel',
          public: true
        },
        custom_claim: {
          app: 'supabase'
        },
        iss: 'https://commercelayer.io',
        organization: {
          enterprise: true,
          region: 'eu-west-1',
          slug: 'the-blue-brand-3'
        },
        scope: 'market:all',
        test: true
      }
    })
  })

  it('should return an access token with a `Customer` as the owner.', async () => {
    const response = await authenticate(
      'urn:ietf:params:oauth:grant-type:jwt-bearer',
      {
        clientId: process.env.VITE_TEST_SALES_CHANNEL_CLIENT_ID,
        clientSecret: process.env.VITE_TEST_SALES_CHANNEL_CLIENT_SECRET,
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
        application: {
          kind: 'sales_channel',
          public: true
        },
        owner: {
          type: 'Customer',
          id: process.env.VITE_TEST_CUSTOMER_ID
        },
        iss: 'https://commercelayer.io',
        organization: {
          enterprise: true,
          region: 'eu-west-1',
          slug: 'the-blue-brand-3'
        },
        scope: 'market:all',
        test: true
      }
    })
  })

  it('should return an access token with a `User` as the owner.', async () => {
    const response = await authenticate(
      'urn:ietf:params:oauth:grant-type:jwt-bearer',
      {
        clientId: process.env.VITE_TEST_SALES_CHANNEL_CLIENT_ID,
        clientSecret: process.env.VITE_TEST_SALES_CHANNEL_CLIENT_SECRET,
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
        application: {
          kind: 'sales_channel',
          public: true
        },
        owner: {
          type: 'User',
          id: process.env.VITE_TEST_USER_ID
        },
        iss: 'https://commercelayer.io',
        organization: {
          enterprise: true,
          region: 'eu-west-1',
          slug: 'the-blue-brand-3'
        },
        scope: 'market:all',
        test: true
      }
    })
  })
})

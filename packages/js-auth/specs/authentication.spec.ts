import { core } from '../src/index.js'

const clientId = process.env.VITE_TEST_CLIENT_ID
const integrationClientId = process.env.VITE_TEST_INTEGRATION_CLIENT_ID
const clientSecret = process.env.VITE_TEST_CLIENT_SECRET
const domain = process.env.VITE_TEST_DOMAIN
const scope = process.env.VITE_TEST_SCOPE
const username = process.env.VITE_TEST_USERNAME
const password = process.env.VITE_TEST_PASSWORD

describe('Authentication', () => {
  it('Get a sales channel token', async () => {
    const res = await core.authentication('client_credentials', {
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
    const res = await core.authentication('client_credentials', {
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
    const res = await core.authentication('client_credentials', {
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
    const res = await core.authentication('password', {
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
    const res = await core.authentication('password', {
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
    const res2 = await core.authentication('refresh_token', {
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
    const res = await core.authentication('password', {
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

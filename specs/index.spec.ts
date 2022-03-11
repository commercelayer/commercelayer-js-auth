import {
  getSalesChannelToken,
  getCustomerToken,
  getIntegrationToken,
  authorizeWebapp,
  clientCredentials,
  getRefreshToken,
} from '../src'

const S_CREDENTIALS = {
  clientId: process.env.SALES_CHANNEL_ID,
  endpoint: process.env.ENDPOINT,
  scope: process.env.SCOPE,
}

const I_CREDENTIALS = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  endpoint: process.env.ENDPOINT,
}

const W_CREDENTIALS = {
  clientId: process.env.WEBAPP_CLIENT_ID,
  clientSecret: process.env.WEBAPP_CLIENT_SECRET,
  callbackUrl: process.env.CALLBACK_URL,
  endpoint: process.env.ENDPOINT,
  scope: process.env.SCOPE,
}

const user = {
  username: 'alessandro@example.com',
  password: '123456',
}

describe('Sales Channel mode', () => {
  test('Client credentials', async () => {
    const auth = await getSalesChannelToken(S_CREDENTIALS)
    expect(auth).toHaveProperty('accessToken')
    expect(auth).toHaveProperty('refresh')
    expect(auth).toHaveProperty('refreshToken')
    expect(auth).toHaveProperty('expires')
    expect(auth).toHaveProperty('tokenType')
    expect(auth.refreshToken).not.toBeDefined()
    expect(typeof auth.accessToken).toBe('string')
    expect(auth.tokenType).toEqual('bearer')
    expect(auth.refreshToken).not.toBeDefined()
  })
  test('Password', async () => {
    const auth = await getCustomerToken(S_CREDENTIALS, user)
    expect(auth).toHaveProperty('accessToken')
    expect(auth).toHaveProperty('refresh')
    expect(auth).toHaveProperty('refreshToken')
    expect(auth.refreshToken).toBeDefined()
    expect(auth).toHaveProperty('expires')
    expect(auth).toHaveProperty('tokenType')
    expect(auth.data).toHaveProperty('owner_id')
    expect(auth.data).toHaveProperty('owner_type')
    expect(typeof auth.accessToken).toBe('string')
    expect(auth.tokenType).toEqual('bearer')
    expect(auth.refreshToken).toBeDefined()
  })
  test('Error Password', async () => {
    const errorUser = {
      username: 'alessandro@example.com',
      password: '12345',
    }
    try {
      await getCustomerToken(S_CREDENTIALS, errorUser)
    } catch (e) {
      expect(e).toHaveProperty('body')
      expect(e.body).toHaveProperty('error')
      expect(e.body.error).toEqual('invalid_grant')
    }
  })
  test('Password - Refresh token', async () => {
    const auth = await getCustomerToken(S_CREDENTIALS, user)
    expect(auth).toHaveProperty('accessToken')
    expect(auth).toHaveProperty('refresh')
    expect(auth).toHaveProperty('refreshToken')
    expect(auth.refreshToken).toBeDefined()
    expect(auth).toHaveProperty('expires')
    expect(auth).toHaveProperty('tokenType')
    expect(auth.data).toHaveProperty('owner_id')
    expect(auth.data).toHaveProperty('owner_type')
    expect(typeof auth.accessToken).toBe('string')
    expect(auth.tokenType).toEqual('bearer')
    expect(auth.refreshToken).toBeDefined()
    const refreshAuth = await getRefreshToken({
      ...S_CREDENTIALS,
      refreshToken: auth.refreshToken,
    })
    expect(refreshAuth).toHaveProperty('accessToken')
    expect(refreshAuth).toHaveProperty('refresh')
    expect(refreshAuth).toHaveProperty('refreshToken')
    expect(refreshAuth.refreshToken).toBeDefined()
    expect(refreshAuth).toHaveProperty('expires')
    expect(refreshAuth).toHaveProperty('tokenType')
    expect(refreshAuth.data).toHaveProperty('owner_id')
    expect(refreshAuth.data).toHaveProperty('owner_type')
    expect(typeof refreshAuth.accessToken).toBe('string')
    expect(refreshAuth.tokenType).toEqual('bearer')
    expect(refreshAuth.refreshToken).toBeDefined()
  })
})

describe('Integration mode', () => {
  test('Client credentials', async () => {
    const auth = await getIntegrationToken(I_CREDENTIALS)
    expect(auth).toHaveProperty('accessToken')
    expect(auth).toHaveProperty('refresh')
    expect(auth).toHaveProperty('refreshToken')
    expect(auth).toHaveProperty('expires')
    expect(auth).toHaveProperty('tokenType')
    expect(typeof auth.accessToken).toBe('string')
    expect(auth.tokenType).toEqual('bearer')
    expect(auth.refreshToken).not.toBeDefined()
  })
  test('Password', async () => {
    const auth = await getIntegrationToken(I_CREDENTIALS, user)
    expect(auth).toHaveProperty('accessToken')
    expect(auth).toHaveProperty('refresh')
    expect(auth).toHaveProperty('refreshToken')
    expect(auth).toHaveProperty('expires')
    expect(auth).toHaveProperty('tokenType')
    expect(typeof auth.accessToken).toBe('string')
    expect(auth.tokenType).toEqual('bearer')
    expect(auth.refreshToken).toBeDefined()
  })
  test('Password - Refresh token', async () => {
    const auth = await getIntegrationToken(I_CREDENTIALS, user)
    expect(auth).toHaveProperty('accessToken')
    expect(auth).toHaveProperty('refresh')
    expect(auth).toHaveProperty('refreshToken')
    expect(auth).toHaveProperty('expires')
    expect(auth).toHaveProperty('tokenType')
    expect(typeof auth.accessToken).toBe('string')
    expect(auth.tokenType).toEqual('bearer')
    expect(auth.refreshToken).toBeDefined()
    const refreshAuth = await getRefreshToken({
      ...I_CREDENTIALS,
      refreshToken: auth.refreshToken,
    })
    expect(refreshAuth).toHaveProperty('accessToken')
    expect(refreshAuth).toHaveProperty('refresh')
    expect(refreshAuth).toHaveProperty('refreshToken')
    expect(refreshAuth.refreshToken).toBeDefined()
    expect(refreshAuth).toHaveProperty('expires')
    expect(refreshAuth).toHaveProperty('tokenType')
    expect(refreshAuth.data).toHaveProperty('owner_id')
    expect(refreshAuth.data).toHaveProperty('owner_type')
    expect(typeof refreshAuth.accessToken).toBe('string')
    expect(refreshAuth.tokenType).toEqual('bearer')
    expect(refreshAuth.refreshToken).toBeDefined()
  })
})

describe('Webapp mode', () => {
  test('browser mode', async () => {
    const jsdomOpen = window.open
    window.open = () => undefined
    const auth = await authorizeWebapp(W_CREDENTIALS)
    expect(auth).toBeNull()
    window.open = jsdomOpen
  })
})

describe('Client credentials', () => {
  test('sales channel mode', async () => {
    const auth = await clientCredentials(S_CREDENTIALS)
    expect(auth).toHaveProperty('accessToken')
    expect(auth).toHaveProperty('refresh')
    expect(auth).toHaveProperty('refreshToken')
    expect(auth).toHaveProperty('expires')
    expect(auth).toHaveProperty('tokenType')
    expect(typeof auth.accessToken).toBe('string')
    expect(auth.tokenType).toEqual('bearer')
    expect(auth.refreshToken).not.toBeDefined()
  })

  test('integration mode', async () => {
    const auth = await clientCredentials(I_CREDENTIALS)
    expect(auth).toHaveProperty('accessToken')
    expect(auth).toHaveProperty('refresh')
    expect(auth).toHaveProperty('refreshToken')
    expect(auth).toHaveProperty('expires')
    expect(auth).toHaveProperty('tokenType')
    expect(typeof auth.accessToken).toBe('string')
    expect(auth.tokenType).toEqual('bearer')
    expect(auth.refreshToken).not.toBeDefined()
  })
})

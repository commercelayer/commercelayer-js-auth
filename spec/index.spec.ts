import webapp from '../src/webapp'
import salesChannel from '../src/salesChannel'
import integration from '../src/integration'

const S_CREDENTIALS = {
  clientId: process.env.SALES_CHANNEL_ID,
  endpoint: 'https://the-blue-brand-2.commercelayer.co',
  scopes: 'market:49'
}

const I_CREDENTIALS = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  endpoint: 'https://the-blue-brand-2.commercelayer.co'
}

const W_CREDENTIALS = {
  clientId: 'e7b8677322a437ee17c0f082afeee27c5722af4d12e8e8551acab00676cb73c5',
  clientSecret:
    '682e2ab4f68f96b4722a3bea503965b7bfa1b31d962a87f0e1ed6726413d7c1c',
  callbackUrl: 'https://localhost:8080',
  endpoint: 'https://the-indigo-brand-2.commercelayer.co',
  scopes: 'market:56'
}

const user = {
  username: 'demo@commercelayer.co',
  password: 'accountdemo'
}

describe('Sales Channel mode', () => {
  test('Client credentials', async () => {
    const auth: any = await salesChannel(S_CREDENTIALS)
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
    const auth: any = await salesChannel(S_CREDENTIALS, user)
    expect(auth).toHaveProperty('accessToken')
    expect(auth).toHaveProperty('refresh')
    expect(auth).toHaveProperty('refreshToken')
    expect(auth).toHaveProperty('expires')
    expect(auth).toHaveProperty('tokenType')
    expect(typeof auth.accessToken).toBe('string')
    expect(auth.tokenType).toEqual('bearer')
    expect(auth.refreshToken).toBeDefined()
  })
})

describe('Integration mode', () => {
  test('Client credentials', async () => {
    const auth: any = await integration(I_CREDENTIALS)
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
    const auth: any = await integration(I_CREDENTIALS, user)
    expect(auth).toHaveProperty('accessToken')
    expect(auth).toHaveProperty('refresh')
    expect(auth).toHaveProperty('refreshToken')
    expect(auth).toHaveProperty('expires')
    expect(auth).toHaveProperty('tokenType')
    expect(typeof auth.accessToken).toBe('string')
    expect(auth.tokenType).toEqual('bearer')
    expect(auth.refreshToken).toBeDefined()
  })
})

describe('Webapp mode', () => {
  test('browser mode', async () => {
    const jsdomOpen = window.open
    window.open = (): any => {}
    const auth = await webapp(W_CREDENTIALS)
    expect(auth).toBeNull()
    window.open = jsdomOpen
  })
})

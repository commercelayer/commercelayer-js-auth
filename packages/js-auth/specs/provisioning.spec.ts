import { provisioning } from 'src'

const clientId = process.env.VITE_TEST_PROVISIONING_CLIENT_ID
const clientSecret = process.env.VITE_TEST_PROVISIONING_CLIENT_SECRET
const domain = process.env.VITE_TEST_PROVISIONING_DOMAIN

describe('Provisioning', () => {
  it('Get a provisioning token', async () => {
    const res = await provisioning.authentication({
      domain,
      clientId,
      clientSecret
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

  it('Can passthrough headers when provisiong a token', async () => {
    const headers = { 'Forwarded': 'for=unknown;by:127.0.0.1' }
    const res = await provisioning.authentication({
      domain,
      clientId,
      clientSecret,
      headers
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

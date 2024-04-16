import { authenticate, revoke } from './index.js'

const integrationClientId = process.env.VITE_TEST_INTEGRATION_CLIENT_ID
const clientSecret = process.env.VITE_TEST_INTEGRATION_CLIENT_SECRET
const domain = process.env.VITE_TEST_DOMAIN

describe('Revoke', () => {
  it('should be able to revoke a valid integration accessToken', async () => {
    const authenticateResponse = await authenticate('client_credentials', {
      clientId: integrationClientId,
      clientSecret,
      domain
    })

    expect(authenticateResponse).toHaveProperty('accessToken')

    const revokeResponse = await revoke({
      clientId: integrationClientId,
      clientSecret,
      token: authenticateResponse.accessToken,
      domain
    })

    expect(revokeResponse).toStrictEqual({})
  })

  it('should respond with error when something goes wrong', async () => {
    // @ts-expect-error I need to test this scenario
    const revokeResponse = await revoke({
      clientSecret,
      token: '1234',
      domain
    })

    expect(revokeResponse).toHaveProperty('errors')
    expect(revokeResponse.errors).toBeInstanceOf(Array)
    expect(revokeResponse.errors?.[0]).toMatchObject({
      code: 'FORBIDDEN',
      detail: 'You are not authorized to revoke this token',
      status: 403,
      title: 'unauthorized_client'
    })
  })
})

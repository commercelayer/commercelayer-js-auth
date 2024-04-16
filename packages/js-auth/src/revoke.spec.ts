import {
  authenticate,
  jwtDecode,
  jwtIsIntegration,
  jwtIsSalesChannel,
  revoke
} from './index.js'

describe('Revoke', () => {
  it('should respond with error when something goes wrong', async () => {
    // @ts-expect-error I want to test this scenario
    const revokeResponse = await revoke({
      clientSecret: process.env.VITE_TEST_INTEGRATION_CLIENT_SECRET,
      domain: process.env.VITE_TEST_DOMAIN,
      token: '1234'
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

  it('should be able to revoke a valid `integration` accessToken', async () => {
    const authenticateResponse = await authenticate('client_credentials', {
      domain: process.env.VITE_TEST_DOMAIN,
      clientId: process.env.VITE_TEST_INTEGRATION_CLIENT_ID,
      clientSecret: process.env.VITE_TEST_INTEGRATION_CLIENT_SECRET
    })

    expect(authenticateResponse).toHaveProperty('accessToken')

    const decoded = jwtDecode(authenticateResponse.accessToken)
    if (!jwtIsIntegration(decoded.payload)) {
      throw new Error('Something went wrong!')
    }

    const slug = decoded.payload.organization.slug

    const skusResponse1 = await fetch(
      `https://${slug}.${process.env.VITE_TEST_DOMAIN}/api/skus?page[size]=1`,
      {
        headers: {
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${authenticateResponse.accessToken}`
        }
      }
    ).then(async (response) => await response.json())

    expect(skusResponse1).toHaveProperty('data')
    expect(skusResponse1).toHaveProperty('meta')
    expect(skusResponse1).toHaveProperty('links')

    const revokeResponse = await revoke({
      domain: process.env.VITE_TEST_DOMAIN,
      clientId: process.env.VITE_TEST_INTEGRATION_CLIENT_ID,
      clientSecret: process.env.VITE_TEST_INTEGRATION_CLIENT_SECRET,
      token: authenticateResponse.accessToken
    })

    expect(revokeResponse).toStrictEqual({})

    const skusResponse2 = await fetch(
      `https://${slug}.${process.env.VITE_TEST_DOMAIN}/api/skus?page[size]=2`,
      {
        headers: {
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${authenticateResponse.accessToken}`
        }
      }
    ).then(async (response) => await response.json())

    expect(skusResponse2).toMatchObject({
      errors: [
        {
          title: 'Invalid token',
          detail: 'The access token you provided is invalid.',
          code: 'INVALID_TOKEN',
          status: '401'
        }
      ]
    })
  })

  it('should be able to revoke a valid `sales_channel` accessToken', async () => {
    const authenticateResponse = await authenticate('client_credentials', {
      domain: process.env.VITE_TEST_DOMAIN,
      clientId: process.env.VITE_TEST_SALES_CHANNEL_CLIENT_ID,
      scope: process.env.VITE_TEST_SCOPE
    })

    expect(authenticateResponse).toHaveProperty('accessToken')

    const decoded = jwtDecode(authenticateResponse.accessToken)
    if (!jwtIsSalesChannel(decoded.payload)) {
      throw new Error('Something went wrong!')
    }

    const slug = decoded.payload.organization.slug

    const skusResponse1 = await fetch(
      `https://${slug}.${process.env.VITE_TEST_DOMAIN}/api/skus?page[size]=1`,
      {
        headers: {
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${authenticateResponse.accessToken}`
        }
      }
    ).then(async (response) => await response.json())

    expect(skusResponse1).toHaveProperty('data')
    expect(skusResponse1).toHaveProperty('meta')
    expect(skusResponse1).toHaveProperty('links')

    const revokeResponse = await revoke({
      domain: process.env.VITE_TEST_DOMAIN,
      clientId: process.env.VITE_TEST_SALES_CHANNEL_CLIENT_ID,
      clientSecret: process.env.VITE_TEST_SALES_CHANNEL_CLIENT_SECRET,
      token: authenticateResponse.accessToken
    })

    expect(revokeResponse).toStrictEqual({})

    const skusResponse2 = await fetch(
      `https://${slug}.${process.env.VITE_TEST_DOMAIN}/api/skus?page[size]=2`,
      {
        headers: {
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${authenticateResponse.accessToken}`
        }
      }
    ).then(async (response) => await response.json())

    expect(skusResponse2).toMatchObject({
      errors: [
        {
          title: 'Invalid token',
          detail: 'The access token you provided is invalid.',
          code: 'INVALID_TOKEN',
          status: '401'
        }
      ]
    })
  })
})

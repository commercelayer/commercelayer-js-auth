import { authenticate, revoke } from './index.js'

describe('Revoke', () => {
  it('should respond with error when something goes wrong', async () => {
    // @ts-expect-error I want to test this scenario without the "clientId"
    const revokeResponse = await revoke({
      clientSecret: process.env.VITE_TEST_INTEGRATION_CLIENT_SECRET,
      token:
        'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYTRjYzYyOGQxZmNlM2ZiOTNhM2VlNTU4MjZlNDFjZmFmMThkYzJkZmYzYjA3MjIyNzQwMzgwZTkxOTlkNWQifQ.eyJ1c2VyIjp7ImlkIjoiZ2Jsb3dTeVZlcSJ9LCJhcHBsaWNhdGlvbiI6eyJpZCI6Im5HVnFhaWxWeU4iLCJraW5kIjoiZGFzaGJvYXJkIiwicHVibGljIjpmYWxzZX0sInNjb3BlIjoicHJvdmlzaW9uaW5nLWFwaSBtZXRyaWNzLWFwaSIsImV4cCI6MTcxMDk3NjY5NSwidGVzdCI6ZmFsc2UsInJhbmQiOjAuNzY1MjgwMDc2MDY1MjMwNywiaWF0IjoxNzEwOTY5NDk1LCJpc3MiOiJodHRwczovL2F1dGguY29tbWVyY2VsYXllci5pbyJ9.N_P1naMuMILbPnQDqp-mNIDAa8zQKVetroRZ76FLMroxSrs59uvTglNUlPOCuPI3lk9iYYka9NXfthxvjj5YdLoUxwwtQO5mmKv9HMz5e8ATAb1mP3SAluWCpL618HB4CuUQPj_2gXsv76Yf2wNRlEmaiy7FORX49egjcXgIdCb_x0J1odv_7aV_STJjheefDC4LckGf0sxrfaAWvNKd5BGnIJaXeJzrjU_WMRcxjqmGMLS87wu7SuggxbaR1O2oU8NiSeNX-2mnBXdFTfb1f2xC40GfCQKzh8ARCJPQPRSr-dTxZHZUqmV_IJmmZxG4cR76vlxje8Qw9lD7IjDkamN1MGgYI55vULrYdNmBFWB8bF7XFdHWij2sSKjk4fPJ7ZC_XzkOQroLEvw4H20Nipkw8FHlGySHwh8-5waxmG_P0CtOcoNHZvGiy302np9G5eYZ6JXiYKhjvlmTdXVZr9-GdxMI8H7jDfw9iB50sneSJoKLmuUDVCTr7fli3TB1W7-yeAuGCWI-iXrVDzl1mT4o8f9GHWsjGdM3s8idijgfdTX9xDciDFlrNPyWvYB408wHzuM6ypJ9-K2x-u__ukKEocZKpF-VJCCigQh7UbZGK2r72AMuxQolW5jc3nHfS2S4XO9rjJU1cVwTIMah9xM_ZrDTD3nj24yFV1geGvg'
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

    const skusResponse1 = await fetch(
      `https://${process.env.VITE_TEST_SLUG}.${process.env.VITE_TEST_DOMAIN}/api/skus?page[size]=1`,
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
      clientId: process.env.VITE_TEST_INTEGRATION_CLIENT_ID,
      clientSecret: process.env.VITE_TEST_INTEGRATION_CLIENT_SECRET,
      token: authenticateResponse.accessToken
    })

    expect(revokeResponse).toStrictEqual({})

    const skusResponse2 = await fetch(
      `https://${process.env.VITE_TEST_SLUG}.${process.env.VITE_TEST_DOMAIN}/api/skus?page[size]=2`,
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

    const skusResponse1 = await fetch(
      `https://${process.env.VITE_TEST_SLUG}.${process.env.VITE_TEST_DOMAIN}/api/skus?page[size]=1`,
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
      clientId: process.env.VITE_TEST_SALES_CHANNEL_CLIENT_ID,
      clientSecret: process.env.VITE_TEST_SALES_CHANNEL_CLIENT_SECRET,
      token: authenticateResponse.accessToken
    })

    expect(revokeResponse).toStrictEqual({})

    const skusResponse2 = await fetch(
      `https://${process.env.VITE_TEST_SLUG}.${process.env.VITE_TEST_DOMAIN}/api/skus?page[size]=2`,
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

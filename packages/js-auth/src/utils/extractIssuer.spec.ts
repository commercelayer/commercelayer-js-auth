import { extractIssuer } from './extractIssuer.js'

describe('extractIssuer', () => {
  it('should be able to extract the issuer from a token without the `iss` key', () => {
    expect(
      extractIssuer(
        // @ts-expect-error I want to test this scenario
        {}
      )
    ).toEqual('https://auth.commercelayer.io')
  })

  it('should be able to extract the issuer from a token with a wrong `iss` key', () => {
    expect(
      extractIssuer({
        // @ts-expect-error I want to test this scenario
        payload: {
          iss: 'https://commercelayer.io'
        }
      })
    ).toEqual('https://auth.commercelayer.io')
  })

  it('should be able to extract the issuer from a token with a valid `iss` key', () => {
    expect(
      extractIssuer({
        // @ts-expect-error I want to test this scenario
        payload: {
          iss: 'https://auth.commercelayer.io'
        }
      })
    ).toEqual('https://auth.commercelayer.io')

    expect(
      extractIssuer({
        // @ts-expect-error I want to test this scenario
        payload: {
          iss: 'https://auth.commercelayer.co'
        }
      })
    ).toEqual('https://auth.commercelayer.co')
  })
})

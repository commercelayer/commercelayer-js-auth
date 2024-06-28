import jwt from 'jsonwebtoken'
import { createAssertion } from './jwtEncode.js'

describe('createAssertion', () => {
  it('should be able to create a JWT assertion with and empty payload.', async () => {
    const payload = {
      'https://commercelayer.io/claims': {}
    } as const

    const jsonwebtokenAssertion = jwt.sign(payload, 'cl', {
      algorithm: 'HS512'
    })

    const assertion = await createAssertion({
      payload: {
        // @ts-expect-error I want to test this scenario
        'https://commercelayer.io/claims': {}
      }
    })

    expect(jwt.verify(assertion, 'cl')).toMatchObject({
      'https://commercelayer.io/claims': {}
    })

    expect(assertion).toStrictEqual(jsonwebtokenAssertion)
  })

  it('should be able to create a JWT assertion with an `owner`.', async () => {
    const payload = {
      'https://commercelayer.io/claims': {
        owner: {
          type: 'User',
          id: '1234'
        }
      }
    } as const

    const jsonwebtokenAssertion = jwt.sign(payload, 'cl', {
      algorithm: 'HS512'
    })

    const assertion = await createAssertion({ payload })

    expect(assertion).toStrictEqual(jsonwebtokenAssertion)
  })

  it('should be able to create a JWT assertion with a `custom_claim`.', async () => {
    const payload = {
      'https://commercelayer.io/claims': {
        custom_claim: {
          name: 'John'
        }
      }
    } as const

    const jsonwebtokenAssertion = jwt.sign(payload, 'cl', {
      algorithm: 'HS512'
    })

    const assertion = await createAssertion({ payload })

    expect(assertion).toStrictEqual(jsonwebtokenAssertion)
  })

  it('should be able to create a JWT assertion with an `owner` and a `custom_claim`.', async () => {
    const payload = {
      'https://commercelayer.io/claims': {
        owner: {
          type: 'User',
          id: '1234'
        },
        custom_claim: {
          name: 'John'
        }
      }
    } as const

    const jsonwebtokenAssertion = jwt.sign(payload, 'cl', {
      algorithm: 'HS512'
    })

    const assertion = await createAssertion({ payload })

    expect(assertion).toStrictEqual(jsonwebtokenAssertion)
  })
})

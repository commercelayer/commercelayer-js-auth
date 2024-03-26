import jwt from 'jsonwebtoken'
import { createAssertion } from './jwtEncode.js'

describe('createAssertion', () => {
  it('should be able to create a JWT assertion.', async () => {
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

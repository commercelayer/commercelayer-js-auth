import jwt from 'jsonwebtoken'
import { vi } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'
import { InvalidTokenError } from './errors/InvalidTokenError.js'
import { TokenError } from './errors/TokenError.js'
import { TokenExpiredError } from './errors/TokenExpiredError.js'
import { jwtDecode, type CommerceLayerJWT } from './jwtDecode.js'
import { jwtVerify } from './jwtVerify.js'
import { encodeBase64URLSafe } from './utils/base64.js'
const fetchMocker = createFetchMock(vi)

afterEach(() => {
  // changes default behavior of fetchMock to use the real 'fetch' implementation and not mock responses
  fetchMocker.dontMock()
})

describe('jwtVerify', () => {
  it('should throw when token expired.', async () => {
    void expect(async () => await jwtVerify(accessTokenIo)).rejects.toThrow(
      TokenExpiredError
    )
  })

  it('should be able to verify a JWT.', async () => {
    const jsonwebtokenDecoded = jwt.decode(accessTokenIo, {
      complete: true
    })

    const verification = await jwtVerify(accessTokenIo, {
      ignoreExpiration: true
    })

    expect(verification).toStrictEqual(jsonwebtokenDecoded)
  })

  it('should be able to verify a JWT from a different domain.', async () => {
    const jsonwebtokenDecoded = jwt.decode(accessTokenCo, {
      complete: true
    })

    const verification = await jwtVerify(accessTokenCo, {
      ignoreExpiration: true
    })

    expect(verification).toStrictEqual(jsonwebtokenDecoded)
  })

  it('should be able to verify a JWT with custom claims and special chars.', async () => {
    const jsonwebtokenDecoded = jwt.decode(accessTokenCustomClaims, {
      complete: true
    })

    const verification = await jwtVerify(accessTokenCustomClaims, {
      ignoreExpiration: true
    })

    expect(verification).toStrictEqual(jsonwebtokenDecoded)
  })

  it('should cache in-memory the response from "jwks.json".', async () => {
    // adds the 'fetchMock' global variable and rewires 'fetch' global to call 'fetchMock' instead of the real implementation
    fetchMocker.enableMocks()

    fetchMocker.mockIf(
      'https://auth.commercelayer.io/.well-known/jwks.json',
      () => {
        return JSON.stringify({
          keys: [
            {
              kty: 'RSA',
              n: 'rhMhwqeLIU1HTubDdY2-_gIzo57tKyF6oKnV7FgAN5RpLKqRoHt3W6h0hHFZtfqjAFnM901P9v3zdAcZVbBA_TfNuXYEoTJsJRhW4_L0fcXGt2yLyuH3xO1keCJrz4sbfe-md45snzVDGUPeYnEWipy7ySfbJsU5S_KfypsIvkRtctgqw5Excs-qjoDCSkkbiQZzkyJEJQ4PSi0fyx6ZIAmYJ1zwucUdpaYstXwyRik6u48vS07ctEHTbZL4p4LYbxoGzapHd_zlqw6KJ_wjpEANMjTAr0SCfQ3hOm19so-6G3N3s51ZabPvn_cAjnhkFnvXAhX38JuiUiGJuwU6ZFW_793qnSLclfCY0eeUekrYt7Btl1zuPvVkOM_WL4HVlrLR1Q4P0_nuBUZEdMJjhsdX8r508GPZI2OT_AQvjpOCNo0Ug0KvL1Tm2-l6YGc2Fs7b0uP_o3qQ-IVQ50C0ZAZA5gEOtLhWFEj9SUIm9-P8KDpffYBvSSMtxLwdkRBsc05xac9x53B-TF_Jwitgpm01R-W5AQC-qd6cXCwEQRKrFNWutjfVwbU67Z1kX1M1tM2197xhmXgScOOnGJob3P9FfFYPjjfU2OPaLl8_yxvF4cxXn_XKx271Ln6LtIDI409k6kA0L-n4sosyj4kV8tfrydyHWdmj4po9ghVfyZs',
              e: 'AQAB',
              ext: true,
              kid: '8d12f36956c1dc8d2308',
              alg: 'RS512',
              use: 'sig'
            }
          ]
        })
      }
    )

    const jsonwebtokenDecoded = jwt.decode(accessTokenWithFakeKid1, {
      complete: true
    })

    const verification1 = await jwtVerify(accessTokenWithFakeKid1, {
      ignoreExpiration: true
    })

    const verification2 = await jwtVerify(accessTokenWithFakeKid1, {
      ignoreExpiration: true
    })

    expect(verification1).toStrictEqual(jsonwebtokenDecoded)
    expect(verification2).toStrictEqual(jsonwebtokenDecoded)
    expect(fetchMocker.requests().length).toEqual(1)
  })

  it('should use the provided JWK.', async () => {
    const jsonwebtokenDecoded = jwt.decode(accessTokenWithFakeKid2, {
      complete: true
    })

    const verification = await jwtVerify(accessTokenWithFakeKid2, {
      ignoreExpiration: true,
      jwk: {
        kty: 'RSA',
        n: 'rhMhwqeLIU1HTubDdY2-_gIzo57tKyF6oKnV7FgAN5RpLKqRoHt3W6h0hHFZtfqjAFnM901P9v3zdAcZVbBA_TfNuXYEoTJsJRhW4_L0fcXGt2yLyuH3xO1keCJrz4sbfe-md45snzVDGUPeYnEWipy7ySfbJsU5S_KfypsIvkRtctgqw5Excs-qjoDCSkkbiQZzkyJEJQ4PSi0fyx6ZIAmYJ1zwucUdpaYstXwyRik6u48vS07ctEHTbZL4p4LYbxoGzapHd_zlqw6KJ_wjpEANMjTAr0SCfQ3hOm19so-6G3N3s51ZabPvn_cAjnhkFnvXAhX38JuiUiGJuwU6ZFW_793qnSLclfCY0eeUekrYt7Btl1zuPvVkOM_WL4HVlrLR1Q4P0_nuBUZEdMJjhsdX8r508GPZI2OT_AQvjpOCNo0Ug0KvL1Tm2-l6YGc2Fs7b0uP_o3qQ-IVQ50C0ZAZA5gEOtLhWFEj9SUIm9-P8KDpffYBvSSMtxLwdkRBsc05xac9x53B-TF_Jwitgpm01R-W5AQC-qd6cXCwEQRKrFNWutjfVwbU67Z1kX1M1tM2197xhmXgScOOnGJob3P9FfFYPjjfU2OPaLl8_yxvF4cxXn_XKx271Ln6LtIDI409k6kA0L-n4sosyj4kV8tfrydyHWdmj4po9ghVfyZs',
        e: 'AQAB',
        ext: true,
        kid: '367a4928f8988e8f120183c7',
        alg: 'RS512',
        use: 'sig'
      }
    })

    expect(verification).toStrictEqual(jsonwebtokenDecoded)
  })

  it('should throw an "InvalidTokenError" exception when the "kid" is not valid.', async () => {
    const doVerify = async (): Promise<CommerceLayerJWT> =>
      await jwtVerify(accessTokenWithFakeKid2, {
        ignoreExpiration: true,
        jwk: {
          kty: 'RSA',
          n: 'rhMhwqeLIU1HTubDdY2-_gIzo57tKyF6oKnV7FgAN5RpLKqRoHt3W6h0hHFZtfqjAFnM901P9v3zdAcZVbBA_TfNuXYEoTJsJRhW4_L0fcXGt2yLyuH3xO1keCJrz4sbfe-md45snzVDGUPeYnEWipy7ySfbJsU5S_KfypsIvkRtctgqw5Excs-qjoDCSkkbiQZzkyJEJQ4PSi0fyx6ZIAmYJ1zwucUdpaYstXwyRik6u48vS07ctEHTbZL4p4LYbxoGzapHd_zlqw6KJ_wjpEANMjTAr0SCfQ3hOm19so-6G3N3s51ZabPvn_cAjnhkFnvXAhX38JuiUiGJuwU6ZFW_793qnSLclfCY0eeUekrYt7Btl1zuPvVkOM_WL4HVlrLR1Q4P0_nuBUZEdMJjhsdX8r508GPZI2OT_AQvjpOCNo0Ug0KvL1Tm2-l6YGc2Fs7b0uP_o3qQ-IVQ50C0ZAZA5gEOtLhWFEj9SUIm9-P8KDpffYBvSSMtxLwdkRBsc05xac9x53B-TF_Jwitgpm01R-W5AQC-qd6cXCwEQRKrFNWutjfVwbU67Z1kX1M1tM2197xhmXgScOOnGJob3P9FfFYPjjfU2OPaLl8_yxvF4cxXn_XKx271Ln6LtIDI409k6kA0L-n4sosyj4kV8tfrydyHWdmj4po9ghVfyZs',
          e: 'AQAB',
          ext: true,
          kid: '1234',
          alg: 'RS512',
          use: 'sig'
        }
      })

    void expect(doVerify).rejects.toThrow(InvalidTokenError)
    void expect(doVerify).rejects.toThrow(TokenError)
    void expect(doVerify).rejects.toThrow('Invalid token "kid"')
  })

  describe('when the access token is modified', () => {
    it('should success when the payload did not change', async () => {
      const [header = '', , signature = ''] = accessTokenIo.split('.')
      const decodedJWT = jwtDecode(accessTokenIo)
      const { payload: newPayload } = decodedJWT

      const newAccessToken = [
        header,
        encodeBase64URLSafe(JSON.stringify(newPayload), 'utf-8'),
        signature
      ].join('.')

      expect(
        await jwtVerify(newAccessToken, {
          ignoreExpiration: true
        })
      ).toStrictEqual(decodedJWT)
    })

    it('should reject when the payload has been changed', async () => {
      const [header = '', , signature = ''] = accessTokenIo.split('.')
      const decodedJWT = jwtDecode(accessTokenIo)
      const { payload: newPayload } = decodedJWT

      // I'm changing the original payload
      newPayload.application.id = '12345'

      const newAccessToken = [
        header,
        encodeBase64URLSafe(JSON.stringify(newPayload), 'utf-8'),
        signature
      ].join('.')

      const doVerify = async (): Promise<CommerceLayerJWT> =>
        await jwtVerify(newAccessToken, {
          ignoreExpiration: true
        })

      void expect(doVerify).rejects.toThrow(InvalidTokenError)
      void expect(doVerify).rejects.toThrow(TokenError)
      void expect(doVerify).rejects.toThrow('Invalid signature')
    })
  })
})

const accessTokenIo =
  'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjliN2JiZmVlMzQzZDVkNDQ5ZGFkODhmMjg0MGEyZTM3YzhkZWFlZTg5NjM4MGQ1ODA2YTc4NWVkMWQ1OTc5ZjAifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJPblZOcUZPTUpuIiwic2x1ZyI6ImRyb3AtaW4tanMiLCJlbnRlcnByaXNlIjp0cnVlLCJyZWdpb24iOiJldS13ZXN0LTEifSwiYXBwbGljYXRpb24iOnsiaWQiOiJkTm5XbWl4eEtHIiwiY2xpZW50X2lkIjoia3VTS1BiZUtiVTlMRzlMam5kemllS1dSY2ZpWEZ1RWZPME9ZSFhLSDlKOCIsImtpbmQiOiJzYWxlc19jaGFubmVsIiwicHVibGljIjp0cnVlfSwibWFya2V0Ijp7ImlkIjpbIkJvd2RHaHdYZGoiXSwic3RvY2tfbG9jYXRpb25faWRzIjpbIkRuZ2VwdU5tT2siLCJLR3lPanV5S1hNIl0sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sInNjb3BlIjoibWFya2V0OmNvZGU6dXNhIiwiZXhwIjoxNzI3Mzg2NzA2LCJ0ZXN0Ijp0cnVlLCJyYW5kIjowLjMzNTg3Njk5NDMxMjc4NzA2LCJpYXQiOjE3MjczNzk1MDYsImlzcyI6Imh0dHBzOi8vYXV0aC5jb21tZXJjZWxheWVyLmlvIn0.aiNjUiX1U0SpLGsVMkQsmDsAvdZysK_waVBtIdcJyXhA9jppmlLuvm9oY6EQbpRachBMcj3I6Hn5R0nI4vo-IAJY4DrYSWfCmiDceWhmrkfEMNk3eMGn74stMbN_B1tlCOTk_wB6_uLEgdxGeelZk2aY2J_VztYqxzNCuOPqX95qESdTqwYrgj7Iop9XeCqwbwKKo6mVn-k0ktdvHirCrv40xTK3bVEDOep5_kXcjaYLez4vijy06_zGlh5BB8GCelD082VJ_ZoIih2FFBuACIFG5usRN7ifEnvNJT1SbZom3JfvwRIZfejfl0S_l3EYqaVbNPAJ_Ia4vdY2LKj65XCrXFP6sEV26fg9z76kWvxW81hB2Bm43jrdYsAJ1CbbS6j4xqH6ZxDxTKc99G9EClgLqRnaDkIGRTKP9PINbtKfElT_NlcN7cBonCZ5y_2iIZqRTlLiaQLq2vWJS9TkqcKVDfHNjrhiz_T3ETR34_anBiLf8bx9mOuQYS4jbTGmcWV7mXEXs3yY2HTPMNOlB-tT7Ddy-xLfCCuiHU5Pt7_D78we8Rnh4pn5Xh4m8QRBJPbSj4UQ5rBgt0Fc_dt4QQ6-nRlC7P4rol-B-Wc8ZMOb8qp8Rieto-_bNJO1eBSvCgR4T1PQ0VhLC8OQU0hQynR57z2rSfgGwJMx9rHtkvE'

const accessTokenCo =
  'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYTRjYzYyOGQxZmNlM2ZiOTNhM2VlNTU4MjZlNDFjZmFmMThkYzJkZmYzYjA3MjIyNzQwMzgwZTkxOTlkNWQifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJXWGxFT0ZiT25yIiwic2x1ZyI6ImRyb3AtaW4tanMtc3RnIiwiZW50ZXJwcmlzZSI6dHJ1ZSwicmVnaW9uIjoiZXUtd2VzdC0xIn0sImFwcGxpY2F0aW9uIjp7ImlkIjoiZ3BaYkRpZEtZcCIsImNsaWVudF9pZCI6ImdRTVNJTkx5TW0yVHJabzBVR0VFZHViQzd1U2dtOS1RVEc0ZVRWVVRWMW8iLCJraW5kIjoic2FsZXNfY2hhbm5lbCIsInB1YmxpYyI6dHJ1ZX0sIm1hcmtldCI6eyJpZCI6WyJxZ0xkQmhkbWdBIl0sInN0b2NrX2xvY2F0aW9uX2lkcyI6WyJKblZQZ3VEVmthIiwiQm5hSlF1dndHdyJdLCJnZW9jb2Rlcl9pZCI6bnVsbCwiYWxsb3dzX2V4dGVybmFsX3ByaWNlcyI6ZmFsc2V9LCJzY29wZSI6Im1hcmtldDppZDpxZ0xkQmhkbWdBIiwiZXhwIjoxNzI3MzkzMDM3LCJ0ZXN0Ijp0cnVlLCJyYW5kIjowLjY3MTMxNzc5Mjc4MTc0MjYsImlhdCI6MTcyNzM3ODYzNywiaXNzIjoiaHR0cHM6Ly9hdXRoLmNvbW1lcmNlbGF5ZXIuY28ifQ.kOf-6mwLCjn_dlFxc5SeaTE-4mFSq1JaVW7GCX_afUWSb5FZtb1OAjogqLqOBcm0nLb5XWdl8ZZyTvcgLlQenb8Cg-XX4r1Znd63nkBuHE3cRdbaMqlsGdbzixGzL3-puGCO1RmGBO2GcYoFQQMgSGMeLVLiadu4-NmSelMwQuLMGWmVVUFDZ99tn_6nWGInfBP_slKMwTrF7N3hXJHQIh3ZnwfTxGDC-rA_NZlHdWNMWFvLbfhwv_MrPkv0-sD0sTpndolK95ZKXm7L90dgL2HIrzpdS_gaWbCoqJTKLUPODHRYW6MWLoKwvo1pWT7biZncKF_4REGQiMVW7MivA4B-R5C_GRCEmDChdl9420f5cGXW1tZOge4r7mzYWyy5tIyiSjxg3MTpmCSvMadrtXgZ5d0ZRrQttPlr6B1Fi_6Um8WmImg64UQOYI4GgO3hJ23washNMW3O2M6pQMMcM1OaH3S7p2qtmlmqbYjXqeBrthDHpdjTPdsQzIc33fyg9GPSOIbCUGYzEFRnlXEpJer9E1Rm1FAlX8t5dWTUJcw_73broWzjd6VKwAnVWMNb6WjMc2xkfQu-8bJhM5hScY_Iy1Ui-HRBcoSfmrqXlhgM258ZamU6huiWzqQXUZOqWtupjQUz_K358mpSL_WuMHOfj-pZ70W7cnMxJCa3rbY'

const accessTokenCustomClaims =
  'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYTRjYzYyOGQxZmNlM2ZiOTNhM2VlNTU4MjZlNDFjZmFmMThkYzJkZmYzYjA3MjIyNzQwMzgwZTkxOTlkNWQifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJXWGxFT0ZiT25yIiwic2x1ZyI6ImRyb3AtaW4tanMtc3RnIiwiZW50ZXJwcmlzZSI6dHJ1ZSwicmVnaW9uIjoiZXUtd2VzdC0xIn0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYU5hS21pZW9rTSIsImNsaWVudF9pZCI6IkVELVNYa3gybzJpTUUyM3lXc1dHY1M4VzFyWURrVVRBOW5UYW1TdkFBdEkiLCJraW5kIjoiaW50ZWdyYXRpb24iLCJwdWJsaWMiOmZhbHNlfSwiY3VzdG9tX2NsYWltIjp7ImN1c3RvbWVyIjp7ImZpcnN0X25hbWUiOiJKw7ZyZyIsImxhc3RfbmFtZSI6IkRvZSJ9fSwic2NvcGUiOiJtYXJrZXQ6YWxsIiwiZXhwIjoxNzI5Nzg5Mjk5LCJ0ZXN0Ijp0cnVlLCJyYW5kIjowLjgxMzE0MjI2ODMxNDY2NzcsImlhdCI6MTcyOTc4MjA5OSwiaXNzIjoiaHR0cHM6Ly9hdXRoLmNvbW1lcmNlbGF5ZXIuY28ifQ.Al5NKzAlka2V42c1nx8AQu7xX5DAx-elQvAiEsI5cXEBB3ZoBX4YEolizATj9e3eTuoQ6rolgPmNdR2_WF8-BnDvhiIDpUpdJ7O3DryNPauH0974d6UGBP9lXoIcHkosUtEu88yyPWhRAoIOPcoxgHVbKJCnREBqRSexPLuARImphYPex7VQwDKsoN1KE-fz40pPgFawr-OLx5nd0xQlkh1HW5wV-7WOtFKPX24ofzSy7pna8yiEsWSQ67_2NJ0XZ5_fhRYxUiy6ZSEWwPV8kXJHAYCbWSyX1gcwKrVnfO7-QuTjImZ7LzSTwYoQv1U68h6DPoy0kjd1q7K6htklcW7gjdDjowE8EP0_ZNpzQ1oErP8A70z4bnLV7SqU6zaTzEeJ4r1dj90luoY4l7Zo-12gDOtOZAd32SWDdJk_PvnZyt44050Zkx6a2qXO7EaSq2w-LcOSihDTI-NRQPLdbS4nRvRbM0UEOTGVWZlQ3iUFduImDaek3Vbi-BdRs37Gm-48pBb9_mfSzF4KQVPZM10FIKkX6R27OSw7oJ-_UkTKFfdUE2ifsJMhG7Q_ZqZnKcqICKID5TBL2GBbTQj62i6Nreq2pRtglkNHMoVEaJ4-t_i7J3og4a5Vg2zIujE2MhwSyhQP01YoEt7i61-UhorBA-ngXZTmpT_GkxtJZrk'

/**
 * Generate private key: openssl genrsa -out ./packages/js-auth/src/private.key 4096
 * Generate public key: openssl rsa -in ./packages/js-auth/src/private.key -pubout -outform PEM -out ./packages/js-auth/src/public.key
 * PEM to JWK: https://pem2jwk.vercel.app/
 */
const accessTokenWithFakeKid1 =
  'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjhkMTJmMzY5NTZjMWRjOGQyMzA4In0.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJPblZOcUZPTUpuIiwic2x1ZyI6ImRyb3AtaW4tanMiLCJlbnRlcnByaXNlIjp0cnVlLCJyZWdpb24iOiJldS13ZXN0LTEifSwiYXBwbGljYXRpb24iOnsiaWQiOiJkTm5XbWl4eEtHIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJtYXJrZXQiOnsiaWQiOlsiQm93ZEdod1hkaiJdLCJzdG9ja19sb2NhdGlvbl9pZHMiOlsiRG5nZXB1Tm1PayIsIktHeU9qdXlLWE0iXSwiZ2VvY29kZXJfaWQiOm51bGwsImFsbG93c19leHRlcm5hbF9wcmljZXMiOmZhbHNlfSwic2NvcGUiOiJtYXJrZXQ6Y29kZTp1c2EiLCJleHAiOjE3MTk2MDgxODEsInRlc3QiOnRydWUsInJhbmQiOjAuNTEyMzk3ODczNDU5MjE2MSwiaWF0IjoxNzE5NTkzNzgxLCJpc3MiOiJodHRwczovL2F1dGguY29tbWVyY2VsYXllci5pbyJ9.PhPITeKORkhY6sUhTiUqDxt4kV-CSFy0o7h9p1uHZu_OjuDHKCi8kryDsAuoPjmKODIgRP2v1hd3w0FlLLDE1AOjOuvPX09ADryiXADVWdHE6nGaYr4I7Mn2ClqDPk4jczemTv5EoTVh6YO5SvMV-Uv6p9mpN_694uslrG23Dqy7iZj0zntiyxOmzUJaVQz8v_YUVk8PMXruVA6mhgMtBu9FAz5ETPUMbSWC3_o_G4lqvUddqsnQYWcDpZiOr3C5K3QUZW5oiOxxisgk1qOOL1Aj4EtNd9h0J6voDhoRR_kL7jw0m0REWrzAKYPIS2y35M8jz9smOa6EqNmWxhdpgm4uG2PgKI9892kjezBm81Yok8brE4kYBCzLCg__wx2KwuGFQxA0GPkJf-JhMod2RQPTwr7QT3RzGXOroL5x9VZRLPkVrbrrAFxdiBWnuOAOWnJHZttd-n2thsw-a85KwXYJH_hKrrus00Gq4zafjb25elxF1PN4qd-1C-TGT6wqY4HwWkjYM1U7w12W3YvyUn0R58Od33vB-zjrLiqTG72uz88RZttSeEU-uW7rtd8NIqihVqEkqOz93KSyaQ_9N5N591Hw6vFzZmLZ2rHzLXiq71j0nn2tIW7qWVb7E0PMHG_eDbtWJ6JeMry2__tBW0kuwdBYe9tpIV8vtYY3uWw'

const accessTokenWithFakeKid2 =
  'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjM2N2E0OTI4Zjg5ODhlOGYxMjAxODNjNyJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJPblZOcUZPTUpuIiwic2x1ZyI6ImRyb3AtaW4tanMiLCJlbnRlcnByaXNlIjp0cnVlLCJyZWdpb24iOiJldS13ZXN0LTEifSwiYXBwbGljYXRpb24iOnsiaWQiOiJkTm5XbWl4eEtHIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJtYXJrZXQiOnsiaWQiOlsiQm93ZEdod1hkaiJdLCJzdG9ja19sb2NhdGlvbl9pZHMiOlsiRG5nZXB1Tm1PayIsIktHeU9qdXlLWE0iXSwiZ2VvY29kZXJfaWQiOm51bGwsImFsbG93c19leHRlcm5hbF9wcmljZXMiOmZhbHNlfSwic2NvcGUiOiJtYXJrZXQ6Y29kZTp1c2EiLCJleHAiOjE3MTk2MDgxODEsInRlc3QiOnRydWUsInJhbmQiOjAuNTEyMzk3ODczNDU5MjE2MSwiaWF0IjoxNzE5NTkzNzgxLCJpc3MiOiJodHRwczovL2F1dGguY29tbWVyY2VsYXllci5pbyJ9.VvnSwxhehxRLCXvJANE1Mh7Ckx3EXYrvWfhrDcxWr6dFgyVeCUDQcVmWDWG2OA_NTAsHfLDlRr9rpiBsVhnkMWQaLgjS_AohIklMeNY9sxZ9MorCdO2wig5u0nToqd8HOITQFZtHyMSrHJf2qCEFZV_vutZ5r_d8QGZXQDKthY8bXkranBzDgp3qi0333k2_LdngiQzGqzDYY7Dzh8cybHgTG-L_vI-hz3-GRF563kxRGaz4Yga0bbTb6d06SXYiAF03CuyWMTMPiXL8gvzZhPHrc7AUrXkmWkfCcLT8RQs6Jmh1bOXDAzxD_XNNjNnC43W3Du54jYW-YQnkLRc1OmR4QuqsBB49jMOn6yreeuuWYIwy3mjDWhfqrhUOYhLLBUKcteyR32dPkiUW79OOArHh35ZsDQaCDE8b9yzHAjAzayIYeYQNxb-0TptZ_p2Sn9D_4jBa8X_g0Q9D1oxs5o9h_-EQVja0gCLOa4Ufb1ZxZZxZBgK_N2YrEpxRWIBgXE_e26NMlNcQtiLal0O5qzIeJJyck6eQUIyCJI_bSoM3ba4l4GlfafbexmZfEf2SHHq5JOqz698nn-Az_XcZDmc52whD-CK77t6ZClfE4T-AhiCRUBMCFhVpRcmTCNra14ZJoUE2FSk74uuP2HAeqVu2uMt8WyPh1pJhlE-CWNk'

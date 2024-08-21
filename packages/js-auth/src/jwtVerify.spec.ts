import jwt from 'jsonwebtoken'
import { TokenExpiredError } from './errors/TokenExpiredError.js'
import { jwtDecode } from './jwtDecode.js'
import { jwtVerify } from './jwtVerify.js'
import { encodeBase64URLSafe } from './utils/base64.js'
import { TokenError } from './errors/TokenError.js'
import createFetchMock from 'vitest-fetch-mock'
import { vi } from 'vitest'
const fetchMocker = createFetchMock(vi)

afterEach(() => {
  // changes default behavior of fetchMock to use the real 'fetch' implementation and not mock responses
  fetchMocker.dontMock()
})

describe('jwtVerify', () => {
  it('should throw when token expired.', async () => {
    void expect(async () => await jwtVerify(accessToken)).rejects.toThrow(
      TokenExpiredError
    )
  })

  it('should be able to verify a JWT.', async () => {
    const jsonwebtokenDecoded = jwt.decode(accessToken, {
      complete: true
    })

    const verification = await jwtVerify(accessToken, {
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

  describe('when the access token is modified', () => {
    it('should success when the payload did not change', async () => {
      const [header = '', , signature = ''] = accessToken.split('.')
      const decodedJWT = jwtDecode(accessToken)
      const { payload: newPayload } = decodedJWT

      const newAccessToken = [
        header,
        encodeBase64URLSafe(JSON.stringify(newPayload)),
        signature
      ].join('.')

      expect(
        await jwtVerify(newAccessToken, {
          ignoreExpiration: true
        })
      ).toStrictEqual(decodedJWT)
    })

    it('should reject when the payload has been changed', async () => {
      const [header = '', , signature = ''] = accessToken.split('.')
      const decodedJWT = jwtDecode(accessToken)
      const { payload: newPayload } = decodedJWT

      // I'm changing the original payload
      newPayload.application.id = '12345'

      const newAccessToken = [
        header,
        encodeBase64URLSafe(JSON.stringify(newPayload)),
        signature
      ].join('.')

      void expect(
        async () =>
          await jwtVerify(newAccessToken, {
            ignoreExpiration: true
          })
      ).rejects.toThrow(TokenError)

      void expect(
        async () =>
          await jwtVerify(newAccessToken, {
            ignoreExpiration: true
          })
      ).rejects.toThrow('Invalid signature')
    })
  })
})

const accessToken =
  'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjliN2JiZmVlMzQzZDVkNDQ5ZGFkODhmMjg0MGEyZTM3YzhkZWFlZTg5NjM4MGQ1ODA2YTc4NWVkMWQ1OTc5ZjAifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJPblZOcUZPTUpuIiwic2x1ZyI6ImRyb3AtaW4tanMiLCJlbnRlcnByaXNlIjp0cnVlLCJyZWdpb24iOiJldS13ZXN0LTEifSwiYXBwbGljYXRpb24iOnsiaWQiOiJkTm5XbWl4eEtHIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJtYXJrZXQiOnsiaWQiOlsiQm93ZEdod1hkaiJdLCJzdG9ja19sb2NhdGlvbl9pZHMiOlsiRG5nZXB1Tm1PayIsIktHeU9qdXlLWE0iXSwiZ2VvY29kZXJfaWQiOm51bGwsImFsbG93c19leHRlcm5hbF9wcmljZXMiOmZhbHNlfSwic2NvcGUiOiJtYXJrZXQ6Y29kZTp1c2EiLCJleHAiOjE3MTk2MDgxODEsInRlc3QiOnRydWUsInJhbmQiOjAuNTEyMzk3ODczNDU5MjE2MSwiaWF0IjoxNzE5NTkzNzgxLCJpc3MiOiJodHRwczovL2NvbW1lcmNlbGF5ZXIuaW8ifQ.SlcD_gUeitqCxiSgjm0JAUqX1xeLnjXs0DOOnbGMhViwMz6YBvQqGC4AozQVtWpwuW1KLKUkGWL4tONFK6PHF9TU8O0QbZ5Y62YI-HkU1j82fojCZYhHWDeX5VmM5r7nm-j7QCd89eu_ayKBmlXMdfUOO1vV5s1a-tocpPIixmjX2nLBnIMqgehesDOXUqO3XHzlVD5AgLG-kGl81Aa7aEfBRwMfo7TihyfRPvsEMnmNtZ6zbwcF8x1tn34ar3MfhBXA3KrY9koARGemFSnAsJrwtDh3Lqe8-If3LzFotQrdDj59vFc85-vfhvi-Zphk52hRtUEnhHtynHN63CA0Z43t2eqegcVEHCH7h7S4szcfUhxmMwBZ_ALxREMjG8-at8XesoMSjHgsjmrIL3Eh681Wmg0WPf8Z_227ZBqiOILJyPtxKkPeW8vsOYQdUOGROkvwTb16tcAoDkJ8H0wk3LAs9JTh-2ymfLVGxPiY0ts0t7tOQtEdg7HO73hIbM0RttkCiPPHYQWaMwcAgWux07Wh3JIIi37-yykJB--TgYuUT88rGTG54F1bwrpmNtSVAu_H4zo0gpUK1uM742jRpudv1iVltJSbhScJEYjfwydCflC-E1MEqUndA_JLtaLN70NETzH28maYdEMj4gQqae0P8VLz8o5YVuItA8jzO8Y'

/**
 * Generate private key: openssl genrsa -out ./packages/js-auth/src/private.key 4096
 * Generate public key: openssl rsa -in ./packages/js-auth/src/private.key -pubout -outform PEM -out ./packages/js-auth/src/public.key
 * PEM to JWK: https://pem2jwk.vercel.app/
 */
const accessTokenWithFakeKid1 =
  'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjhkMTJmMzY5NTZjMWRjOGQyMzA4In0.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJPblZOcUZPTUpuIiwic2x1ZyI6ImRyb3AtaW4tanMiLCJlbnRlcnByaXNlIjp0cnVlLCJyZWdpb24iOiJldS13ZXN0LTEifSwiYXBwbGljYXRpb24iOnsiaWQiOiJkTm5XbWl4eEtHIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJtYXJrZXQiOnsiaWQiOlsiQm93ZEdod1hkaiJdLCJzdG9ja19sb2NhdGlvbl9pZHMiOlsiRG5nZXB1Tm1PayIsIktHeU9qdXlLWE0iXSwiZ2VvY29kZXJfaWQiOm51bGwsImFsbG93c19leHRlcm5hbF9wcmljZXMiOmZhbHNlfSwic2NvcGUiOiJtYXJrZXQ6Y29kZTp1c2EiLCJleHAiOjE3MTk2MDgxODEsInRlc3QiOnRydWUsInJhbmQiOjAuNTEyMzk3ODczNDU5MjE2MSwiaWF0IjoxNzE5NTkzNzgxLCJpc3MiOiJodHRwczovL2NvbW1lcmNlbGF5ZXIuaW8ifQ.Zl-_UWl3zhVq-A89SHFcGmsX7PStAtA_DU0N1Shb4pHdCJNvBop3KjKUXteh_r4IfxCjfb4vnP2unxGWQQHKZB0b_X42-_zctAf_QzCSVmABtVt0HiRG-h4nqD7y5KFU9O_XbSMFlSRK4bbv95bPx79LwkxDwnGz9MkuG2V952JroffQ8rvQ8vyD-gUYzz_77kWLbPWc5H4g8xe1G9zkunHkknLwsRpfcl7i9u4NPv8YECDr3hdGD_xtWv3MX1GuytLMn9YZBWVYm-kH4jBi7Qw7JLX8NvmnVnp1Hnbz7_4xAFLoly_nknrkqLXEhUE7ZrlLtvnZA-J4bvkUR6H_xKuLJa4P9XIpzffH404dcy4ih3u1hUUq6BWokpHwCVzUQVXNd1Cwufvt69DsO55he_UNXwfKz0sUDH6SLOlrJaovLModoqGE4b4XpslzVIFfP9w-83EgTtarWQxZWg_NHSi4PZolIHnE7y9PtXmTxBZf0tfa9cQ6il8b8AfF2NFqJpX91xj8OtYZGpGpP8xWPlLzJjVNNT7w3BL8Re_9J965jGJVNSVBN_fEVHLWXDVD88_OZmBUNeA60tXVsu8TfR9_7EqwZpNHkA-krIdVl37SQXtpozFULmjv5u0S_0LACQs1KGOtR6xHz_cq2FkdZrAlvVZNTOMjugI9Q44hZIc'

const accessTokenWithFakeKid2 =
  'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjM2N2E0OTI4Zjg5ODhlOGYxMjAxODNjNyJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJPblZOcUZPTUpuIiwic2x1ZyI6ImRyb3AtaW4tanMiLCJlbnRlcnByaXNlIjp0cnVlLCJyZWdpb24iOiJldS13ZXN0LTEifSwiYXBwbGljYXRpb24iOnsiaWQiOiJkTm5XbWl4eEtHIiwia2luZCI6InNhbGVzX2NoYW5uZWwiLCJwdWJsaWMiOnRydWV9LCJtYXJrZXQiOnsiaWQiOlsiQm93ZEdod1hkaiJdLCJzdG9ja19sb2NhdGlvbl9pZHMiOlsiRG5nZXB1Tm1PayIsIktHeU9qdXlLWE0iXSwiZ2VvY29kZXJfaWQiOm51bGwsImFsbG93c19leHRlcm5hbF9wcmljZXMiOmZhbHNlfSwic2NvcGUiOiJtYXJrZXQ6Y29kZTp1c2EiLCJleHAiOjE3MTk2MDgxODEsInRlc3QiOnRydWUsInJhbmQiOjAuNTEyMzk3ODczNDU5MjE2MSwiaWF0IjoxNzE5NTkzNzgxLCJpc3MiOiJodHRwczovL2NvbW1lcmNlbGF5ZXIuaW8ifQ.qRK1m9PrbXhDROjGIgRP3s-eNtes4QVXjCOIYKOQrNvP0UrUrs-6KsN4eW44K525I-jCOw23U6wKhannI_l1LZgMjW2VZ2wymZXWg8bwTv-imvMo6dv9U_BwuQ1cuRLHzizOq73oun4dhqyEkZVWNNccE3YieaU3anbO7qRGadTlSStOZAiu_TTK8ZyFbdr3LY5OUgW-2kooUKw5k2dSD1vWkpeZ84WR-QclvaTv1X7RQmnvRTykAEruNOwP9g16K-Y1GEiSIW4JXr2Dx70ytRlphwoV97psMrYUozGiAlroZs_DeQ8S3gZdX-7bgLXyRoqB0CzoLHgqB5NVyMc_vge9Gp7jbXKTjALTE9VVFs6ESZWdQtLGJ79ddZWBQfWrkQweLrgw0Ug5SU5Jy1b8Adee2L0jHMu5LPUs5ZFfk0P9gc0X_vR4PdttZqamSnEHXYBvJGmfOyDGHpk8rZKT_ZbUy0DfzYM3mC8wKYXGFBQoKDrEFQ_FA8gkmbSVHwqjnOLNm8xmjCLJtV7ovSSl-0ULt82JCAiJ-9rsVEQE0x_uYhyG3-kpfGqwmi6DqDlaDKAL-5q8rp3W1nBtcIZJkSXKt_Ji_MC6xc1W96bEuKGOeAgaqdDOGjN0R1UaSfKbmiR1k0mCc3lxeHV0BQuOj7oQX7kc938RD1s6iSDrO5o'

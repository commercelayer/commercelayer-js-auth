import jwt from 'jsonwebtoken'
import { TokenExpiredError } from './errors/TokenExpiredError.js'
import { jwtDecode } from './jwtDecode.js'
import { jwtVerify } from './jwtVerify.js'
import { encodeBase64URLSafe } from './utils/base64.js'
import { TokenError } from './errors/TokenError.js'

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

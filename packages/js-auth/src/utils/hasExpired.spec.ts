import { jwtDecode } from "../jwtDecode.js"
import { encodeBase64URLSafe } from "./base64.js"
import { hasExpired } from "./hasExpired.js"

describe("hasExpired", () => {
  it("should return true for an expired token", () => {
    const decodedJWT = jwtDecode(accessTokenExpired)
    expect(hasExpired(decodedJWT)).toBe(true)
  })

  it("should return false for a non-expired token", () => {
    const decodedJWT = jwtDecode(accessTokenNotExpired)
    expect(hasExpired(decodedJWT)).toBe(false)
  })
})

const accessTokenExpired =
  "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjliN2JiZmVlMzQzZDVkNDQ5ZGFkODhmMjg0MGEyZTM3YzhkZWFlZTg5NjM4MGQ1ODA2YTc4NWVkMWQ1OTc5ZjAifQ.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJPblZOcUZPTUpuIiwic2x1ZyI6ImRyb3AtaW4tanMiLCJlbnRlcnByaXNlIjp0cnVlLCJyZWdpb24iOiJldS13ZXN0LTEifSwiYXBwbGljYXRpb24iOnsiaWQiOiJkTm5XbWl4eEtHIiwiY2xpZW50X2lkIjoia3VTS1BiZUtiVTlMRzlMam5kemllS1dSY2ZpWEZ1RWZPME9ZSFhLSDlKOCIsImtpbmQiOiJzYWxlc19jaGFubmVsIiwicHVibGljIjp0cnVlfSwibWFya2V0Ijp7ImlkIjpbIkJvd2RHaHdYZGoiXSwic3RvY2tfbG9jYXRpb25faWRzIjpbIkRuZ2VwdU5tT2siLCJLR3lPanV5S1hNIl0sImdlb2NvZGVyX2lkIjpudWxsLCJhbGxvd3NfZXh0ZXJuYWxfcHJpY2VzIjpmYWxzZX0sInNjb3BlIjoibWFya2V0OmNvZGU6dXNhIiwiZXhwIjoxNzI3Mzg2NzA2LCJ0ZXN0Ijp0cnVlLCJyYW5kIjowLjMzNTg3Njk5NDMxMjc4NzA2LCJpYXQiOjE3MjczNzk1MDYsImlzcyI6Imh0dHBzOi8vYXV0aC5jb21tZXJjZWxheWVyLmlvIn0.aiNjUiX1U0SpLGsVMkQsmDsAvdZysK_waVBtIdcJyXhA9jppmlLuvm9oY6EQbpRachBMcj3I6Hn5R0nI4vo-IAJY4DrYSWfCmiDceWhmrkfEMNk3eMGn74stMbN_B1tlCOTk_wB6_uLEgdxGeelZk2aY2J_VztYqxzNCuOPqX95qESdTqwYrgj7Iop9XeCqwbwKKo6mVn-k0ktdvHirCrv40xTK3bVEDOep5_kXcjaYLez4vijy06_zGlh5BB8GCelD082VJ_ZoIih2FFBuACIFG5usRN7ifEnvNJT1SbZom3JfvwRIZfejfl0S_l3EYqaVbNPAJ_Ia4vdY2LKj65XCrXFP6sEV26fg9z76kWvxW81hB2Bm43jrdYsAJ1CbbS6j4xqH6ZxDxTKc99G9EClgLqRnaDkIGRTKP9PINbtKfElT_NlcN7cBonCZ5y_2iIZqRTlLiaQLq2vWJS9TkqcKVDfHNjrhiz_T3ETR34_anBiLf8bx9mOuQYS4jbTGmcWV7mXEXs3yY2HTPMNOlB-tT7Ddy-xLfCCuiHU5Pt7_D78we8Rnh4pn5Xh4m8QRBJPbSj4UQ5rBgt0Fc_dt4QQ6-nRlC7P4rol-B-Wc8ZMOb8qp8Rieto-_bNJO1eBSvCgR4T1PQ0VhLC8OQU0hQynR57z2rSfgGwJMx9rHtkvE"

const payloadNotExpired = {
  organization: {
    id: "OnVNqFOMJn",
    slug: "drop-in-js",
    enterprise: true,
    region: "eu-west-1",
  },
  application: {
    id: "dNnWmixxKG",
    client_id: "kuSKPbeKbU9LG9LjndzieKWRcfiXFuEfO0OYHXKH9J8",
    kind: "sales_channel",
    public: true,
  },
  scope: "market:code:usa",
  exp: Date.now() / 1000 + 3600, // 1 hour from now
  test: true,
  rand: Math.random(),
  iat: Date.now() / 1000,
  iss: "https://auth.commercelayer.io",
}

const accessTokenNotExpired = `eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjliN2JiZmVlMzQzZDVkNDQ5ZGFkODhmMjg0MGEyZTM3YzhkZWFlZTg5NjM4MGQ1ODA2YTc4NWVkMWQ1OTc5ZjAifQ.${encodeBase64URLSafe(JSON.stringify(payloadNotExpired), "utf-8")}.aiNjUiX1U0SpLGsVMkQsmDsAvdZysK_waVBtIdcJyXhA9jppmlLuvm9oY6EQbpRachBMcj3I6Hn5R0nI4vo-IAJY4DrYSWfCmiDceWhmrkfEMNk3eMGn74stMbN_B1tlCOTk_wB6_uLEgdxGeelZk2aY2J_VztYqxzNCuOPqX95qESdTqwYrgj7Iop9XeCqwbwKKo6mVn-k0ktdvHirCrv40xTK3bVEDOep5_kXcjaYLez4vijy06_zGlh5BB8GCelD082VJ_ZoIih2FFBuACIFG5usRN7ifEnvNJT1SbZom3JfvwRIZfejfl0S_l3EYqaVbNPAJ_Ia4vdY2LKj65XCrXFP6sEV26fg9z76kWvxW81hB2Bm43jrdYsAJ1CbbS6j4xqH6ZxDxTKc99G9EClgLqRnaDkIGRTKP9PINbtKfElT_NlcN7cBonCZ5y_2iIZqRTlLiaQLq2vWJS9TkqcKVDfHNjrhiz_T3ETR34_anBiLf8bx9mOuQYS4jbTGmcWV7mXEXs3yY2HTPMNOlB-tT7Ddy-xLfCCuiHU5Pt7_D78we8Rnh4pn5Xh4m8QRBJPbSj4UQ5rBgt0Fc_dt4QQ6-nRlC7P4rol-B-Wc8ZMOb8qp8Rieto-_bNJO1eBSvCgR4T1PQ0VhLC8OQU0hQynR57z2rSfgGwJMx9rHtkvE`

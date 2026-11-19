import { extractIssuer } from "./extractIssuer.js"

describe("extractIssuer", () => {
  it("should be able to extract the issuer from a token without the `iss` key", () => {
    expect(
      extractIssuer(
        // @ts-expect-error I want to test this scenario
        {},
      ),
    ).toEqual("https://auth.commercelayer.io")
  })

  it("should be able to extract the issuer from a token with a wrong `iss` key", () => {
    expect(
      extractIssuer({
        // @ts-expect-error I want to test this scenario
        payload: {
          iss: "https://commercelayer.io",
        },
      }),
    ).toEqual("https://auth.commercelayer.io")
  })

  it("should be able to extract the issuer from a token with a valid `iss` key", () => {
    expect(
      extractIssuer({
        // @ts-expect-error I want to test this scenario
        payload: {
          iss: "https://auth.commercelayer.io",
        },
      }),
    ).toEqual("https://auth.commercelayer.io")

    expect(
      extractIssuer({
        // @ts-expect-error I want to test this scenario
        payload: {
          iss: "https://auth.commercelayer.co",
        },
      }),
    ).toEqual("https://auth.commercelayer.co")

    expect(
      extractIssuer({
        // @ts-expect-error I want to test this scenario
        payload: {
          iss: "https://auth.stg.commercelayer.co",
        },
      }),
    ).toEqual("https://auth.stg.commercelayer.co")

    expect(
      extractIssuer({
        // @ts-expect-error I want to test this scenario
        payload: {
          iss: "https://auth.stg3.commercelayer.co",
        },
      }),
    ).toEqual("https://auth.stg3.commercelayer.co")
  })

  it.each([
    "https://auth.commercelayer.dev",
    "https://auth.stg1.commercelayer.io",
    "https://auth.qa-2.commercelayer.dev",
  ])("should keep the trusted issuer %s", (iss) => {
    expect(
      extractIssuer({
        // @ts-expect-error I want to test this scenario
        payload: { iss },
      }),
    ).toEqual(iss)
  })

  it.each([
    "https://auth.localhost:8443",
    "https://auth.attacker.example",
    "https://auth.commercelayer.io.attacker.example",
    "https://auth.commercelayer.io:8443",
    "https://auth.commercelayer.io/",
    "https://auth.commercelayer.io@attacker.example",
    "https://auth.commercelayer.io/../attacker",
    "http://auth.commercelayer.io",
    "https://auth.stg1.commercelayer.co.attacker.example",
    "https://auth.commercelayer.co\n",
    "https://auth.commercelayer.com",
    "https://auth.a.b.commercelayer.io",
    "https://auth..commercelayer.io",
    "https://auth.attacker-commercelayer.io",
    "https://auth.STG1.commercelayer.co",
    "https://evil.auth.commercelayer.io",
  ])("should fall back to the default issuer when `iss` is %s", (iss) => {
    expect(
      extractIssuer({
        // @ts-expect-error I want to test this scenario
        payload: { iss },
      }),
    ).toEqual("https://auth.commercelayer.io")
  })
})

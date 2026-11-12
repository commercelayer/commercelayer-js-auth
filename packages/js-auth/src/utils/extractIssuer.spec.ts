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
    "https://auth.localhost:8443",
    "https://auth.attacker.example",
    "https://auth.commercelayer.io.attacker.example",
    "https://auth.commercelayer.io:8443",
    "https://auth.commercelayer.io/",
    "https://auth.commercelayer.io@attacker.example",
    "https://auth.commercelayer.io/../attacker",
    "http://auth.commercelayer.io",
    "https://auth.stg1.commercelayer.io",
    "https://auth.stgx.commercelayer.co",
    "https://auth.stg1.commercelayer.co.attacker.example",
    "https://auth.commercelayer.co\n",
  ])("should fall back to the default issuer when `iss` is %s", (iss) => {
    expect(
      extractIssuer({
        // @ts-expect-error I want to test this scenario
        payload: { iss },
      }),
    ).toEqual("https://auth.commercelayer.io")
  })
})

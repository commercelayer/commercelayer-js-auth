# Inspecting tokens

Reading, verifying, and revoking a token you already hold. Obtaining tokens:
[`grant-types.md`](grant-types.md).

## Decode vs verify

**A token your code just obtained can be decoded. A token handed to you (request header, client,
webhook) must be verified.** Deciding trust from `jwtDecode` accepts any well-formed JWT, including
one an attacker constructed.

`jwtDecode` is synchronous and checks no signature:

```ts
import { jwtDecode, jwtIsSalesChannel } from "@commercelayer/js-auth"

const decoded = jwtDecode(accessToken)

if (jwtIsSalesChannel(decoded.payload)) {
  console.log(decoded.payload.organization.slug)
}
```

`jwtVerify` is async and checks the signature against Commerce Layer's public key:

```ts
const decoded = await jwtVerify(accessToken, { ignoreExpiration: true })
```

## Narrowing the payload

The payload shape depends on the issuing credential, so reading `payload.organization` or
`payload.owner` requires narrowing. Each guard is a TypeScript type predicate.

| Guard | Token from |
| --- | --- |
| `jwtIsSalesChannel` | sales channel credential |
| `jwtIsIntegration` | integration credential |
| `jwtIsWebApp` | webapp credential |
| `jwtIsDashboard` | dashboard login |
| `jwtIsUser` | a user, for Provisioning API |

`getTokenType(accessToken)` returns the kind as a `TokenType` string when that is more convenient.

Payload types: `CommerceLayerJWT`, `JWTSalesChannel`, `JWTIntegration`, `JWTWebApp`, `JWTDashboard`,
`JWTUser`.

## Base endpoints

Synchronous, derived from the payload. Derive rather than hardcoding or duplicating the organization
slug in configuration; the token already knows it.

```ts
import { getCoreApiBaseEndpoint, getProvisioningApiBaseEndpoint } from "@commercelayer/js-auth"

getCoreApiBaseEndpoint(accessToken) //= "https://yourdomain.commercelayer.io"
getProvisioningApiBaseEndpoint(accessToken) //= "https://provisioning.commercelayer.io"
```

Each throws `InvalidTokenError` when the token cannot serve that API: `getCoreApiBaseEndpoint` on a
token with no `organization` (a provisioning token), `getProvisioningApiBaseEndpoint` on a Core API
token.

## Errors

| Class | Meaning |
| --- | --- |
| `TokenError` | base class for the two below |
| `InvalidTokenError` | malformed, or missing the claims the operation needs |
| `TokenExpiredError` | signature valid, expiry passed |

Thrown by the JWT and endpoint helpers. `authenticate()` and `revoke()` do not throw; they resolve
with an `errors` array ([`grant-types.md`](grant-types.md#errors-do-not-throw)).

## Revoking

Works on refresh tokens too, which makes it the real logout for a "remember me" session: an
unrevoked refresh token outlives the access token it replaced.

```ts
import { revoke } from "@commercelayer/js-auth"

await revoke({
  clientId: "<your_client_id>",
  clientSecret: "<your_client_secret>",
  token: "<a_generated_access_token>",
})
```

**When a helper manages the token, use `salesChannel.logoutCustomer()` or
`integration.revokeAuthorization()` instead.** Both revoke *and* clear the cache; a bare `revoke()`
leaves the dead token in storage, where the next `getAuthorization()` reads it back and treats it as
valid until expiry.

# Credentials and grant types

## Pick the credential

Created in the Commerce Layer dashboard. Determines what a token reaches, and where the code may
run.

| Credential | Client secret | Runs in a browser | Reaches |
| --- | --- | --- | --- |
| **Sales channel** | no | yes | Core API |
| **Integration** | yes | no | Core API, Metrics API |
| **Webapp** | yes | yes, via authorization code | Core API, Metrics API |
| **Provisioning** | yes | no | Provisioning API |

**A client secret must never reach a browser bundle.** Sales channels have none by design, which
is what makes them the only credential safe in client-side code. An integration secret in a
storefront bundle exposes full Core API access to anyone opening devtools. If a project has an
integration `clientSecret` in a `NEXT_PUBLIC_*` or `VITE_*` variable, say so before writing
anything.

## Pick the grant

| Grant | Used by | Produces |
| --- | --- | --- |
| `client_credentials` | sales channel, integration, provisioning | guest or app token |
| `password` | sales channel | customer token + refresh token |
| `refresh_token` | sales channel | renewed customer token |
| `authorization_code` | webapp | user token |
| `urn:ietf:params:oauth:grant-type:jwt-bearer` | sales channel, webapp | delegated customer token |

`makeSalesChannel` and `makeIntegration` issue `client_credentials` and handle `refresh_token`
themselves from a required `storage`, covering every guest and integration token. Use the helper
and [choose a storage](storage-decision.md) rather than calling those grants by hand.

What remains for `authenticate()`: customer login, the webapp exchange, provisioning. Each leaves
caching to the caller.

Auditing code that already calls `authenticate()`: [`audit.md`](audit.md).

## Errors do not throw

`authenticate()` resolves with an `errors` array instead of rejecting. Code handling only rejection
treats a failure as success and passes `undefined` as the token.

```ts
const auth = await authenticate("client_credentials", {
  clientId: "<your_client_id>",
  scope: "market:code:europe",
})

if (auth.errors != null) {
  // { code, detail, meta, status: 400 | 401 | 429 | 500, title }
  throw new Error(auth.errors[0].detail)
}
```

`status: 429` is the rate limit, 30 requests / minute. Hitting it in normal traffic means tokens are
not cached → [`storage-decision.md`](storage-decision.md).

Success carries `accessToken`, `tokenType`, `expiresIn`, `expires` (a `Date`), `scope`, `createdAt`.

## Provisioning: client credentials

The one `client_credentials` exchange with no helper behind it. Credentials come from the
dashboard's provisioning application; the token reaches the Provisioning API only.

```ts
const auth = await authenticate("client_credentials", {
  clientId: "<your_client_id>",
  clientSecret: "<your_client_secret>",
})
```

Cache the result: `expires` is a `Date`, and the 30 req/min limit applies here too.

Sales channel and integration tokens use this same grant through
`makeSalesChannel({ clientId, scope }, { storage })` and
`makeIntegration({ clientId, clientSecret }, { storage })`, which cache it. Hand-writing the raw
call for either is how an app hits the rate limit.

## Customer login: password

```ts
const auth = await authenticate("password", {
  clientId: "<your_client_id>",
  scope: "market:code:europe",
  username: "john@example.com",
  password: "secret",
})
```

Returns a `refreshToken`. Pass the result to `salesChannel.setCustomer()` so the helper handles
refresh → [`customer-tokens.md`](customer-tokens.md). Refreshing by hand:

```ts
const auth = await authenticate("refresh_token", {
  clientId: "<your_client_id>",
  scope: "market:code:europe",
  refreshToken: "<your_refresh_token>",
})
```

## Delegated customer login: JWT bearer

Authenticating a customer without their password: an external identity provider (Okta, Auth0), or
any backend that already knows who they are. Two steps, both server-side since the second needs the
client secret.

```ts
import { authenticate, createAssertion } from "@commercelayer/js-auth"

const assertion = await createAssertion({
  payload: {
    "https://commercelayer.io/claims": {
      owner: { type: "Customer", id: "4tepftJsT2" },
      custom_claim: {
        customer: { first_name: "John", last_name: "Doe" },
      },
    },
  },
})

const auth = await authenticate("urn:ietf:params:oauth:grant-type:jwt-bearer", {
  clientId: "<your_client_id>",
  clientSecret: "<your_client_secret>",
  scope: "market:code:europe",
  assertion,
})
```

**Validate whatever resolved the customer ID before this point**, whether an IdP-issued JWT or a
session record. Nothing downstream re-checks it.

Running server-side, the resulting customer token needs a per-visitor home →
[`customer-tokens.md`](customer-tokens.md).

## Webapp: authorization code

Browser applications only. Authorize URL:

```text
https://dashboard.commercelayer.io/oauth/authorize?client_id={{client_id}}&redirect_uri={{redirect_uri}}&scope=market:id:xYZkjABcde&response_type=code&state=1a2b3c
```

The callback receives a `code` to exchange:

```ts
const auth = await authenticate("authorization_code", {
  clientId: "<your_client_id>",
  clientSecret: "<your_client_secret>",
  callbackUrl: "https://yourdomain.com/callback",
  code: "<your_auth_code>",
})
```

## Shared options

- **`scope`**: `{resource}:id:{id}` or `{resource}:code:{code}`, resource being `market`, `store`,
  or `stock_location` (e.g. `market:code:europe`). Required for sales channels; omitted by
  integrations acting on the whole organization.
- **`domain`**: defaults to `commercelayer.io`; requests go to `https://auth.{domain}/oauth/token`.
  Set only for a non-standard environment.
- **`headers`**: `x-true-client-ip` with `x-backend-auth` forwards the real client IP so rate
  limits count per visitor rather than per server. Both are enterprise features.

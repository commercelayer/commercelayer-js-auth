# Customer tokens

Sales channels only: `makeIntegration` accepts no `customerStorage`.

Storages named here (`memoryStorage`, `cookieStorage`, `redisStorage`) are in
[`storage-adapters.md`](storage-adapters.md).

## Guest vs customer

A **guest** token is anonymous: one cached copy can serve every visitor.

A **customer** token identifies one person. `getAuthorization()` prefers it over the guest token
whenever a valid one is in storage, refreshing it first when it has expired and a `refreshToken`
is present.

Both are stored under:

```text
cl_${type}-${clientId}-${scope}
```

`type` is `guest` or `customer`. **The default key carries no customer identity.**

## The leak

Shared storage + default key + customer tokens = every visitor reads
`cl_customer-<clientId>-<scope>` and gets whichever customer wrote it last. Redis, Cloudflare KV,
and a module-scope `Map` are all shared this way.

Browsers are immune: `localStorage` already belongs to one visitor.

### Remedy 1: per-visitor customerStorage

Guest token stays shared; customer token goes somewhere belonging to one visitor. The default key
is then correct, because the storage itself provides the isolation. Reach for this first; it is
the natural fit for server-rendered storefronts.

```ts
const salesChannel = makeSalesChannel(
  { clientId: "<your_client_id>", scope: "market:code:europe" },
  {
    storage: memoryStorage(),
    customerStorage: cookieStorage(),
  },
)
```

### Remedy 2: shared storage, identifying key

To cache customer tokens in Redis or KV too, put a customer or session identifier in the key.
`getKey` receives only client ID, scope, and type, so request context arrives by closure: build
the helper per request, keep the backend shared.

```ts
import { createCompositeStorage, makeSalesChannel } from "@commercelayer/js-auth"

// Process-level: where tokens actually live.
const sharedStorage = createCompositeStorage({
  name: "bff",
  storages: [memoryStorage(), redisStorage],
})

// Per request. Construction is cheap: no network calls, no timers.
function salesChannelFor(customerId: string) {
  return makeSalesChannel(
    { clientId: "<your_client_id>", scope: "market:code:europe" },
    {
      storage: sharedStorage,
      getKey: async ({ clientId, scope }, type) =>
        type === "customer"
          ? `cl_customer-${clientId}-${scope}-${customerId}`
          : `cl_guest-${clientId}-${scope}`,
    },
  )
}
```

The guest branch keeps the plain key; that is what lets one guest token stay shared while customer
tokens separate.

## Login and logout

`setCustomer` stores a customer token obtained elsewhere: a `password` grant, JWT bearer assertion,
or delegated login from an external identity provider. It validates that the token carries a
customer owner before storing.

```ts
const auth = await authenticate("password", {
  clientId: "<your_client_id>",
  scope: "market:code:europe",
  username: "customer@example.com",
  password: "<password>",
})

await salesChannel.setCustomer({
  accessToken: auth.accessToken,
  scope: auth.scope,
  refreshToken: auth.refreshToken, // enables silent refresh, the "remember me" case
})
```

Pass `refreshToken` when the session should outlive the access token; without it the customer is
silently demoted to guest on expiry.

```ts
await salesChannel.logoutCustomer()
```

`logoutCustomer` clears the customer authorization from every configured storage **and** revokes
the token. Later `getAuthorization()` calls return the guest token.

To clear cached state without revoking: `removeAuthorization("customer")`, or
`removeAuthorization("all")` for both kinds.

## Instance lifetime

`makeSalesChannel` and `makeIntegration` return objects holding no token state and performing no
I/O at construction. One per request is safe as long as the storage backend is shared. A long-lived
instance adds exactly one thing: deduplication of concurrent `getAuthorization()` calls that would
otherwise authenticate in parallel.

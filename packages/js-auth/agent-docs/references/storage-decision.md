# Choosing a storage

Which backend holds the token cache for `makeSalesChannel` / `makeIntegration`.
Implementations: [`storage-adapters.md`](storage-adapters.md).

One axis decides everything:

- **per-visitor**: cookies, `localStorage`, `sessionStorage`. Belongs to one person.
- **shared**: module-scope `Map`, Redis, Cloudflare KV. Every visitor reads the same keys.

A **guest** token carries no identity, so one cached copy serves everyone: shared is ideal. A
**customer** token is personal. Customer tokens in shared storage under the default key **leak**:
the next visitor is served the previous customer's token.

## Step 1: Ground the decisions

This choice rests on who the token is for, where the calling code runs, whether customers log in,
and whether the cache must survive a restart. Each must be grounded in the project or confirmed by
the developer; see [before writing code](../README.md#before-writing-code).

Two consequences worth carrying: `makeIntegration` accepts no `customerStorage`, and customer login
makes Step 3 mandatory.

**Done when** none of the four is a guess. Recommend nothing while one is; a wrong guess here
produces a leak.

## Step 2: Recommend

| Runtime | Guest / integration | Customer |
| --- | --- | --- |
| Browser-only SPA, no server of your own | `localStorage` | `localStorage`, default key is fine |
| Long-lived Node server (SSR, Next.js) | in-memory `Map` | cookies |
| Serverless / edge (Workers, Lambda) | composite: memory + KV or Redis | cookies |
| Integration, any server runtime | composite: memory + Redis | n/a |

Use `createCompositeStorage` whenever a persistent backend is involved: memory absorbs the hits,
the persistent layer survives cold starts.

```ts
import { createCompositeStorage, makeSalesChannel } from "@commercelayer/js-auth"

const salesChannel = makeSalesChannel(
  { clientId: "<your_client_id>", scope: "market:code:europe" },
  {
    storage: createCompositeStorage({
      name: "storefront",
      storages: [memoryStorage(), kvStorage],
    }),
  },
)

const { accessToken } = await salesChannel.getAuthorization()
```

**Done when** each token kind has a storage, and every recommended dependency either already
exists in the project or has been proposed explicitly.

## Step 3: Close the leak

Only when customer tokens land in a **shared** storage. Two remedies, both in
[`customer-tokens.md`](customer-tokens.md):

- a per-visitor `customerStorage` (cookies), keeping the default key, or
- the shared storage plus a `getKey` carrying a customer or session identifier.

**Done when** you can name, for each customer token, the identifier that makes its key unique to
one visitor, or the per-visitor storage that makes an identifier unnecessary.

## Verify the wiring

```ts
makeSalesChannel(
  { clientId: "<your_client_id>", scope: "market:code:europe", debug: { logLevel: "info" } },
  { storage: memoryStorage() },
)
```

`"info"` logs misses, refreshes, and writes; `"verbose"` adds every read.

A second `getAuthorization()` that logs a miss means the storage is not persisting, usually an
instance created per request instead of at module scope, or a cold start with no persistent layer.

`maskToken` defaults to `true`. `false` prints whole tokens, so keep it local: serverless and
edge logs are commonly forwarded to external aggregators.

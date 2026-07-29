# Storage adapters

Implementing `Storage` for use as `storage` or `customerStorage`. Pick a backend via
[`storage-decision.md`](storage-decision.md) first.

## The interface

Authoritative declarations: `Storage` and `StorageValue` in `dist/index.d.mts`.

```ts
interface Storage {
  name?: string
  getItem: (key: string) => Promise<StorageValue | null>
  // Authoritative: Promise<(StorageValue & { storageName?: string }) | null>
  // `storageName` is added by createCompositeStorage; implementations don't set it.
  setItem: (key: string, value: StorageValue) => Promise<void>
  removeItem: (key: string) => Promise<void>
  dispose?: () => Promise<void>
}

type StorageValue = {
  accessToken: string
  scope: string
  refreshToken?: string
}
```

**Always set `name`.** `createCompositeStorage` reports it as `storageName`, the only way to tell
which layer answered a read.

**`StorageValue` holds no expiry**: the library reads it from the token. A backend TTL is
optional; if set, keep it at or above the token lifetime, since a shorter one only forces extra
authentication calls.

**A read that cannot produce a valid value returns `null`.** Wrap `JSON.parse` in a `try`/`catch`
returning `null`, with no guards in front of it: a missing value, an empty string, a truncated
value, and non-JSON all belong in the same place. A corrupt entry must send the library to the
auth endpoint, never throw into the caller.

Deletion is the case that bites: many frameworks clear a cookie by setting it to `""`, so a read
in the same request sees an empty string, and `JSON.parse("")` throws.

## The worked example: in-memory

Shared within one process. Correct for guest and integration tokens on a long-lived server; lost
on every cold start. Every other adapter is this shape with a different backend.

```ts
import type { Storage, StorageValue } from "@commercelayer/js-auth"

export function memoryStorage(): Storage {
  const store = new Map<string, StorageValue>()
  return {
    name: "in-memory",
    async getItem(key) {
      return store.get(key) ?? null
    },
    async setItem(key, value) {
      store.set(key, value)
    },
    async removeItem(key) {
      store.delete(key)
    },
  }
}
```

**Create it once at module scope.** Constructed inside a request handler it is empty on every
request, a cache miss in every log line.

## localStorage

Same shape over `localStorage.getItem` / `setItem` / `removeItem`, with the `try`/`catch` around
the parse. Per-visitor, survives reloads.

Browser only: guard on `typeof window` if the module is also evaluated on the server. Use
`sessionStorage` to drop the token when the tab closes.

## Cookies

Per-visitor on the server: the default answer for customer tokens. Example is Next.js; any
framework with a request-scoped cookie store works the same way.

```ts
import type { Storage } from "@commercelayer/js-auth"
import { cookies } from "next/headers"

export function cookieStorage(): Storage {
  return {
    name: "cookies",
    async getItem(key) {
      const raw = (await cookies()).get(key)?.value
      try {
        // `"null"` parses to null, so a missing cookie costs no exception.
        return JSON.parse(raw ?? "null")
      } catch {
        return null
      }
    },
    async setItem(key, value) {
      ;(await cookies()).set(key, JSON.stringify(value), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      })
    },
    async removeItem(key) {
      ;(await cookies()).delete(key)
    },
  }
}
```

`httpOnly` keeps the token out of client-side JavaScript. Two limits: ~4KB per cookie, and most
frameworks only allow writes while headers can still be set, and a Server Component rendering
after streaming has begun cannot.

## Cloudflare KV

`kv.get(key, "json")` / `kv.put(key, JSON.stringify(value))` / `kv.delete(key)`. The `"json"`
argument parses, so no manual round-trip. Shared across the deployment; pair with memory so a warm
isolate stops reading KV every request.

The namespace arrives on the request `env`, not at import time: build the KV storage per request,
keep the memory layer at module scope, and take a `KVNamespace` as an argument.

## unstorage (Redis, Upstash, ~30 more drivers)

Compatible with [unstorage](https://unstorage.unjs.io), which does not set `name`. Wrap it once:

```ts
import type { Storage } from "@commercelayer/js-auth"
import type { CreateStorageOptions } from "unstorage"
import { createStorage as unstorageCreateStorage } from "unstorage"

function createStorage(
  options: CreateStorageOptions & { name?: string },
): Storage {
  return {
    name: options.name ?? options.driver?.name,
    ...unstorageCreateStorage(options),
  }
}
```

Then ordinary unstorage:
`createStorage({ name: "redis-persistent", driver: redisDriver({ url }) })`, with `redisDriver`
from `unstorage/drivers/redis`.

## Composing layers

`createCompositeStorage` returns the first hit and backfills the faster layers. Writes and removals
go to all of them.

```ts
import { createCompositeStorage } from "@commercelayer/js-auth"

const storage = createCompositeStorage({
  name: "storefront",
  storages: [memoryStorage(), redisStorage],
  debug: { logLevel: "info" },
})
```

Order fastest to slowest. `logLevel: "info"` reports only fallbacks (a read served by Redis rather
than memory), so steady-state traffic stays quiet.

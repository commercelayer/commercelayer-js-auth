# Auditing an existing setup

The project already authenticates and it works. Produce **findings and a proposal**: verify the
token cache is correct, and where it isn't, name the smallest change that fixes it. Apply only what
the developer agrees to.

Rewriting working auth is the last resort on the ladder below, not the opening move.

## Checks

Take these in order. Record a verdict for each with the file and line supporting it.

**1. Is a client secret reachable from the browser?** Check this first and report it immediately;
it is a credential exposure, not a defect to weigh against alternatives. This happens in the wild:
storefronts shipping an integration secret to every visitor.

Look for `clientSecret` in anything that reaches the client: files marked `"use client"`, modules
they import, and `NEXT_PUBLIC_*` / `VITE_*` / `PUBLIC_*` / `REACT_APP_*` variables. A `grep` for
`clientSecret` plus a read of the env files usually settles it. An integration or webapp credential
powering a storefront is the same finding even when the secret looks server-side.

**Deleting the line does not un-expose it.** Anyone who loaded the page already has the secret, so
the credential must be treated as compromised and rotated in the dashboard. Client-side code uses a
**sales channel** credential, which has no secret by design; work that genuinely needs a secret
moves behind a route handler or server action.

**2. Is there a cache?** Find every `authenticate()` call site and establish how often it runs. A
call inside a request handler, React component, or API-client factory runs per request, which is
what reaches 30 req/min under ordinary traffic.

A single call at startup (script, build step, one-shot job) needs no cache. *"No cache, and none
needed"* is a valid verdict.

**3. Is expiry respected?** A cached token needs something invalidating it. `expires` is a `Date` on
the result; `expiresIn` is seconds. No expiry check means eventually serving a dead token and a
`401`.

**4. Is the storage shared or per-visitor?** Only when a cache exists, and the most serious of the
cache defects. Shared: module-scope `Map`, Redis, KV. Per-visitor: cookies, `localStorage`.

- guest or integration token in shared storage → correct
- **customer token in shared storage under a key with no customer identity → a leak.** The next
  visitor is served the previous customer's token.
- customer token in per-visitor storage → correct, no identifier needed

Remedies and the `getKey` shape: [`customer-tokens.md`](customer-tokens.md).

**5. Is the storage instance long-lived?** A `Map`, or any storage object, constructed inside a
request handler is empty every request, so the cache never hits even though the code looks like it
caches. The instance belongs at module scope; only request-bound parts (a `KVNamespace` from `env`,
a cookie jar) are built per request.

**6. Does persistence match the runtime?** In-memory alone is fine on a long-lived server. On
serverless or edge each cold start re-authenticates, a slower path to the same rate limit. Those
runtimes need a persistent layer → [`storage-decision.md`](storage-decision.md).

**7. Are customer refresh tokens used?** A `refreshToken` that nothing refreshes silently demotes
the customer to guest on expiry. The reported symptom is "users get logged out".

## Reporting

An exposed client secret is reported on its own, first, with rotation as the required action. It is
not a tradeoff and does not belong on the ladder below.

For the cache findings, lead with the smallest change per finding, roughly in order of cost:

1. **Fix the cache in place**: add an expiry check, move the instance to module scope, add a
   customer identifier to the key. Keeps `authenticate()` and the current shape.
2. **Add a persistent layer** to what exists, when the runtime needs one.
3. **Adopt `makeSalesChannel` / `makeIntegration`** for guest and integration tokens. Retires the
   cache, expiry, instance-lifetime, and refresh checks at once because `storage` is required, but it
   changes how the app obtains tokens, so state that cost and reserve it for an audit that found
   several defects together.

Customer login stays on `authenticate()` in every case; the improvement there is passing the result
to `setCustomer()` so the helper takes over refresh.

**Done when** every check has a verdict backed by a file and line, each finding is paired with the
smallest change that resolves it, and nothing has been edited that the developer hasn't agreed to.

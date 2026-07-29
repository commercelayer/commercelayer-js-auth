# @commercelayer/js-auth agent guide

For coding agents. Humans: read [`../README.md`](../README.md) instead.

The types in `dist/*.d.mts` win over this document. If they disagree, follow the types and say
this file is stale.

## Caching is mandatory

Auth endpoint limit: **30 requests / minute**. Authenticating per API call hits it under mild
traffic.

`makeSalesChannel` and `makeIntegration` cache the token (lookup, expiry check, refresh,
write-back), and their `storage` option is **required**, so the cache cannot be skipped.
**Every guest and every integration token comes from one of them.**

`authenticate()` is the escape hatch: one exchange, no cache, no refresh. Correct in three
cases, and the caller owns caching in all of them:

- customer login (`password` or JWT bearer) → pass the result to `salesChannel.setCustomer()`,
  which returns refresh to the helper
- webapp `authorization_code` exchange
- provisioning application

Any other reach for `authenticate()` belongs to a helper.

## Before writing code

Both entry points come before the routing table below.

**Auth already in the project** → audit the cache and propose the smallest fix. Do not migrate
working code. → [`references/audit.md`](references/audit.md)

**Nothing in place yet** → settle the shape before implementing. Start by reading what the project
already commits to: framework and existing storage dependencies in `package.json`, a
`wrangler.toml` / `wrangler.jsonc` and its `kv_namespaces`, and whether the code that will call
Commerce Layer sits in client or server files.

An implementation commits to these decisions:

- which credential, and so whether a client secret is involved at all
- where the calling code runs, which decides the legal storages and whether cookies exist
- guest tokens only, or customer login as well
- which storage backend, and per-visitor or shared for customer tokens
- whether the cache must survive a restart or deploy

**Each one is either grounded in something the project already states, or confirmed by the
developer. Nothing is guessed.**

Put the whole set to the developer as a recap before implementing:

- **Grounded**: state the finding and the default it implies, rather than asking. *"`wrangler.toml`
  declares a `kv_namespaces` binding, so guest tokens go to KV behind a memory layer."* They can
  override it; they cannot override what they were never shown.
- **Open**: ask, in your own words, framed around what you actually found rather than a checklist.

**Write no code until the developer has confirmed the recap.** Guessing a storage is how a customer
token ends up in one shared by every visitor.

## Routing

| Task | File |
| --- | --- |
| pick a credential or grant type | [`grant-types.md`](references/grant-types.md) |
| audit auth code that already exists | [`audit.md`](references/audit.md) |
| decide where cached tokens live | [`storage-decision.md`](references/storage-decision.md) |
| implement a `Storage` | [`storage-adapters.md`](references/storage-adapters.md) |
| log customers in, isolate their tokens | [`customer-tokens.md`](references/customer-tokens.md) |
| decode, verify, derive an endpoint, revoke | [`jwt.md`](references/jwt.md) |

Read one. They stand alone; follow a link only when the file says the decision depends on it.

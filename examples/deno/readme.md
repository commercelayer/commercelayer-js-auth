# "Deno" example

## Get started

First of all you need to install [Deno](https://docs.deno.com/runtime/manual) on your machine.

```sh
deno run --allow-net index.ts

# or

deno task start
```

### Import from JSR

This library is also published at [jsr.io](https://jsr.io/@commercelayer/js-auth).

```ts
import { authenticate } from 'jsr:@commercelayer/js-auth'

const auth = await authenticate('client_credentials', {
  clientId: 'BISG8bb3GWpC8_D7Nt1SuWWdieS5bJq831A50LgB_Ig',
  scope: 'market:id:KoaJYhMVVj'
})

console.log(auth)
```

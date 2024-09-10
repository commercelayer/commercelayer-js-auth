// @deno-types="../../packages/js-auth/dist/index.d.ts"
import { authenticate, getCoreApiBaseEndpoint, jwtVerify } from '../../packages/js-auth/dist/index.js'

const auth = await authenticate('client_credentials', {
  clientId: 'BISG8bb3GWpC8_D7Nt1SuWWdieS5bJq831A50LgB_Ig',
  scope: 'market:id:KoaJYhMVVj'
})

console.log(auth)

const decodedJWT = await jwtVerify(auth.accessToken)

if ('organization' in decodedJWT.payload) {
  console.log('organization slug is', decodedJWT.payload.organization.slug)
  console.log('base endpoint is', getCoreApiBaseEndpoint(auth.accessToken))
}

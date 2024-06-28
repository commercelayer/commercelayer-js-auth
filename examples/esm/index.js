// @ts-check

import { authenticate, jwtVerify } from '@commercelayer/js-auth'

const auth = await authenticate('client_credentials', {
  clientId: 'BISG8bb3GWpC8_D7Nt1SuWWdieS5bJq831A50LgB_Ig',
  scope: 'stock_location:id:DGzAouppwn'
})

console.log(auth)

const decodedJWT = await jwtVerify(auth.accessToken)

if ('organization' in decodedJWT.payload) {
  console.log('organization slug is', decodedJWT.payload.organization.slug)
}

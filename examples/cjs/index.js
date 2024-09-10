// @ts-check

const { authenticate, jwtVerify, jwtIsSalesChannel, getCoreApiBaseEndpoint } = require('@commercelayer/js-auth')

async function run() {
  const auth = await authenticate('client_credentials', {
    clientId: 'BISG8bb3GWpC8_D7Nt1SuWWdieS5bJq831A50LgB_Ig',
    scope: 'market:id:KoaJYhMVVj'
  })

  console.log(auth)

  const decodedJWT = await jwtVerify(auth.accessToken)

  if (jwtIsSalesChannel(decodedJWT.payload)) {
    console.log('organization slug is', decodedJWT.payload.organization.slug)
    console.log('base endpoint is', getCoreApiBaseEndpoint(auth.accessToken))
  }

}

run()

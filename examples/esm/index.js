// @ts-check

import { authenticate } from '@commercelayer/js-auth'

async function run() {
  const auth = await authenticate('client_credentials', {
    clientId: 'BISG8bb3GWpC8_D7Nt1SuWWdieS5bJq831A50LgB_Ig',
    scope: 'market:id:KoaJYhMVVj'
  })

  console.log(auth)
}

run()

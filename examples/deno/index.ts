import { authenticate } from 'https://esm.sh/@commercelayer/js-auth'

const auth = await authenticate('client_credentials', {
  clientId: 'BISG8bb3GWpC8_D7Nt1SuWWdieS5bJq831A50LgB_Ig',
  scope: 'market:11279'
})

console.log(auth)

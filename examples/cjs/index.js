const { core } = require('@commercelayer/js-auth')

async function run() {
  const auth = await core.authentication('client_credentials', {
    clientId: 'BISG8bb3GWpC8_D7Nt1SuWWdieS5bJq831A50LgB_Ig',
    scope: 'market:11279'
  })

  console.log(auth)
}

run()

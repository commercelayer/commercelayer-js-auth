import { salesChannel, integration, webapp } from './src'
import * as query from 'query-string'

const f = async () => {
	// const credentials = {
	// 	clientId: process.env.SALES_CHANNEL_ID,
	// 	// clientSecret: process.env.CLIENT_SECRET,
	// 	clientSecret: '',
	// 	redirectUri: '',
	// 	username: 'demo@commercelayer.co',
	// 	password: 'accountdemo',
	// 	accessTokenUri: 'https://the-blue-brand-2.commercelayer.co/oauth/token',
	// 	authorizationUri:
	// 		'https://the-blue-brand-2.commercelayer.co/oauth/authorize'
	// }
	const user = {
		username: 'demo@commercelayer.co',
		password: 'accountdemo'
	}
	try {
		// const oauth = await salesChannel(
		// 	process.env.SALES_CHANNEL_ID,
		// 	'https://the-blue-brand-2.commercelayer.co',
		// 	'market:48'
		// )
		// const oauthUser = await salesChannel(
		// 	process.env.SALES_CHANNEL_ID,
		// 	'https://the-blue-brand-2.commercelayer.co',
		// 	'market:49',
		// 	user
		// )
		// const oauthInt = await integration(
		// 	process.env.CLIENT_ID,
		// 	process.env.CLIENT_SECRET,
		// 	'https://the-blue-brand-2.commercelayer.co'
		// )
		// const oauthIntUser = await integration(
		// 	process.env.CLIENT_ID,
		// 	process.env.CLIENT_SECRET,
		// 	'https://the-blue-brand-2.commercelayer.co',
		// 	'',
		// 	user
		// )
		const parse = location.search !== '' && query.parse(location.search)
		console.log('parse :', parse)
		if (!parse) {
			const oauthWebapp = await webapp(
				'e7b8677322a437ee17c0f082afeee27c5722af4d12e8e8551acab00676cb73c5',
				'682e2ab4f68f96b4722a3bea503965b7bfa1b31d962a87f0e1ed6726413d7c1c',
				'https://localhost:8080',
				'https://the-indigo-brand-2.commercelayer.co',
				'market:56'
			)
			// Server side
			// const oauthWebapp = await webapp(
			// 	process.env.WEBAPP_CLIENT_ID,
			// 	process.env.WEBAPP_CLIENT_SECRET,
			// 	'https://localhost:8080',
			// 	'https://the-blue-brand-2.commercelayer.co',
			// 	'market:48',
			// 	true
			// )
			console.log('oauthWebApp :', oauthWebapp)
		}
		const code = document.createElement('code')
		if (parse) {
			console.log('location.href :', location.href)
			const oauthWebapp = await webapp(
				'e7b8677322a437ee17c0f082afeee27c5722af4d12e8e8551acab00676cb73c5',
				'682e2ab4f68f96b4722a3bea503965b7bfa1b31d962a87f0e1ed6726413d7c1c',
				'https://localhost:8080',
				'https://the-indigo-brand-2.commercelayer.co',
				'market:56',
				false,
				location.href
			)
			// const oauthWebapp = await webapp(
			// 	process.env.WEBAPP_CLIENT_ID,
			// 	process.env.WEBAPP_CLIENT_SECRET,
			// 	'https://localhost:8080',
			// 	'https://the-blue-brand-2.commercelayer.co',
			// 	'market:48',
			// 	false,
			// 	location.href
			// )
			console.log('oauthWebApp :', oauthWebapp)
			code.append(`Code: ${parse.code}`)
		}
		// code.append(`Access Token: ${oauth.accessToken}`)
		// code.append('\n')
		// code.append(`User Access Token: ${oauthUser.accessToken}`)
		// code.append('\n')
		// code.append(`Integration Access Token: ${oauthInt.accessToken}`)
		// code.append('\n')
		// code.append(`Integration User Access Token: ${oauthIntUser.accessToken}`)
		document.body.appendChild(code)
		// console.log('oauth :', oauth)
		// console.log('oauthUser :', oauthUser)
		// console.log('oauthIntegration :', oauthInt)
		// console.log('oauthIntegrationUser :', oauthIntUser)
		// const token = await authenticate('clientCredentials', credentials)
		// console.log('token', credentials)
	} catch (e) {
		console.log('error -> :', e)
		const code = document.createElement('code')
		code.append(`User Access Token: ${e}`)
		document.body.appendChild(code)
	}
}

window.onload = () => {
	f()
}

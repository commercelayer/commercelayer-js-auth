import webapp from '../src/webapp'
import salesChannel from '../src/salesChannel'
import integration from '../src/integration'

const user = {
	username: 'demo@commercelayer.co',
	password: 'accountdemo'
}

describe('Sales Channel mode', () => {
	test('Client credentials', async () => {
		const auth: any = await salesChannel(
			process.env.SALES_CHANNEL_ID,
			'https://the-blue-brand-2.commercelayer.co',
			'market:48'
		)
		expect(auth).toHaveProperty('accessToken')
		expect(auth).toHaveProperty('refresh')
		expect(auth).toHaveProperty('refreshToken')
		expect(auth).toHaveProperty('expires')
		expect(auth).toHaveProperty('tokenType')
		expect(typeof auth.accessToken).toBe('string')
		expect(auth.tokenType).toEqual('bearer')
		expect(auth.refreshToken).not.toBeDefined()
	})
	test('Password', async () => {
		const auth: any = await salesChannel(
			process.env.SALES_CHANNEL_ID,
			'https://the-blue-brand-2.commercelayer.co',
			'market:49',
			user
		)
		expect(auth).toHaveProperty('accessToken')
		expect(auth).toHaveProperty('refresh')
		expect(auth).toHaveProperty('refreshToken')
		expect(auth).toHaveProperty('expires')
		expect(auth).toHaveProperty('tokenType')
		expect(typeof auth.accessToken).toBe('string')
		expect(auth.tokenType).toEqual('bearer')
		expect(auth.refreshToken).toBeDefined()
	})
})

describe('Integration mode', () => {
	test('Client credentials', async () => {
		const auth: any = await integration(
			process.env.CLIENT_ID,
			process.env.CLIENT_SECRET,
			'https://the-blue-brand-2.commercelayer.co'
		)
		expect(auth).toHaveProperty('accessToken')
		expect(auth).toHaveProperty('refresh')
		expect(auth).toHaveProperty('refreshToken')
		expect(auth).toHaveProperty('expires')
		expect(auth).toHaveProperty('tokenType')
		expect(typeof auth.accessToken).toBe('string')
		expect(auth.tokenType).toEqual('bearer')
		expect(auth.refreshToken).not.toBeDefined()
	})
	test('Password', async () => {
		const auth: any = await integration(
			process.env.CLIENT_ID,
			process.env.CLIENT_SECRET,
			'https://the-blue-brand-2.commercelayer.co',
			'',
			user
		)
		expect(auth).toHaveProperty('accessToken')
		expect(auth).toHaveProperty('refresh')
		expect(auth).toHaveProperty('refreshToken')
		expect(auth).toHaveProperty('expires')
		expect(auth).toHaveProperty('tokenType')
		expect(typeof auth.accessToken).toBe('string')
		expect(auth.tokenType).toEqual('bearer')
		expect(auth.refreshToken).toBeDefined()
	})
})

describe('Webapp mode', () => {
	test('server side mode', async () => {
		const auth = await webapp(
			'e7b8677322a437ee17c0f082afeee27c5722af4d12e8e8551acab00676cb73c5',
			'682e2ab4f68f96b4722a3bea503965b7bfa1b31d962a87f0e1ed6726413d7c1c',
			'https://localhost:8080',
			'https://the-indigo-brand-2.commercelayer.co',
			'market:56',
			true
		)
		expect(auth).toHaveProperty('getUri')
		expect(auth).toHaveProperty('getToken')
	})
	test('browser mode', async () => {
		const jsdomOpen = window.open
		window.open = (): any => {}
		const auth = await webapp(
			'e7b8677322a437ee17c0f082afeee27c5722af4d12e8e8551acab00676cb73c5',
			'682e2ab4f68f96b4722a3bea503965b7bfa1b31d962a87f0e1ed6726413d7c1c',
			'https://localhost:8080',
			'https://the-indigo-brand-2.commercelayer.co',
			'market:56'
		)
		expect(auth).toBeUndefined()
		window.open = jsdomOpen
	})

	// FIXME: Maybe with cypress (not urgent)
	// test('browser callback mode', async () => {
	// 	const auth = await webapp(
	// 		'e7b8677322a437ee17c0f082afeee27c5722af4d12e8e8551acab00676cb73c5',
	// 		'682e2ab4f68f96b4722a3bea503965b7bfa1b31d962a87f0e1ed6726413d7c1c',
	// 		'https://localhost:8080',
	// 		'https://the-indigo-brand-2.commercelayer.co',
	// 		'market:56',
	// 		false,
	// 		'https://localhost:8080/?code=7ad971802209832e1bcf847062f1b076727dc16e1e32058c2ff1e8f2deecb3e1'
	// 	)
	// 	console.log('auth :', auth)
	// })
})

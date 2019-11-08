const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')
require('dotenv').config()

module.exports = merge(common, {
	mode: 'development',
	plugins: [
		new webpack.DefinePlugin({
			process: {
				env: {
					AUTH_URL: JSON.stringify(process.env.AUTH_URL),
					GRANT_TYPE: JSON.stringify(process.env.GRANT_TYPE),
					CLIENT_ID: JSON.stringify(process.env.CLIENT_ID),
					CLIENT_SECRET: JSON.stringify(process.env.CLIENT_SECRET),
					SCOPE: JSON.stringify(process.env.SCOPE),
					SALES_CHANNEL_ID: JSON.stringify(process.env.SALES_CHANNEL_ID),
					WEBAPP_CLIENT_ID: JSON.stringify(process.env.WEBAPP_CLIENT_ID),
					WEBAPP_CLIENT_SECRET: JSON.stringify(
						process.env.WEBAPP_CLIENT_SECRET
					),
					CALLBACK_URL: JSON.stringify(process.env.CALLBACK_URL)
				}
			}
		})
	]
})

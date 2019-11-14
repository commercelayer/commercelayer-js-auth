# Commerce Layer JS Auth

>A JavaScript Library wrapper that helps you to use the Commerce Layer API for [Authentication](https://docs.commercelayer.io/api/authentication).

### What is Commerce Layer?

[Commerce Layer](https://commercelayer.io/) is a headless platform that makes it easy to build enterprise-grade ecommerce into any website, by using the language, CMS, and tools you already master and love.

## Installation

Commerce Layer JS Auth is available as an npm package.

```js
// npm
npm install @commercelayer/js-auth

// yarn
yarn add @commercelayer/js-auth
```

## Authorization flows

To get an access token, you need to execute an [OAuth 2.0](https://oauth.net/2/) authorization flow by using a valid application as the client.

| Grant type             | Sales channel | Integration | Webapp |
| ---------------------- | ------- | ----------- | ------ |
| **Client credentials** | ✅       | ✅           |        |
| **Password**           | ✅       |             |        |
| **Refresh token**      | ✅       |             | ✅      |
| **Authorization code** |         |             | ✅      |

> Remember that, for security reasons, access tokens expire after **2 hours**. Refresh tokens expire after **2 weeks**. 

## Getting started

```js
import CLayerAuth from '@commercelayer/js-auth'

// or

import { salesChannel, integration, webapp } from '@commercelayer/js-auth'
```

## Use cases

Based on the authorization flow and application you want to use, you can get your access token in a few simple steps. These are the most common use cases:

1. [Sales channel application with client credentials flow](#1-sales-channel-client-credentials)
2. [Sales channel application with password flow](#2-sales-channel-password)
3. [Integration application with client credentials flow](#3-integration-client-credentials)
4. [Webapp application with authorization code flow](#4-webapp-authorization-code)

## 1. Sales Channel (Client credentials)

Sales channel applications use the [client credentials](https://docs.commercelayer.io/api/authentication/client-credentials) grant type to get a "guest" access token. 

To get your access token in this case:

- Create a **sales channel** application on Commerce Layer and take note of your API credentials (base endpoint, client ID and the ID of the market you want to put in scope)

- Add this code to your application:

  ```typescript
  const auth = await salesChannel({
    clientId: 'your-client-id',
    endpoint: 'https://yourdomain.commercelayer.io',
    scopes: 'market:{id}'
  })
  
  console.log('My access token: ', auth.accessToken) // Easy!
  ```

## 2. Sales Channel (Password)

Sales channel applications can use the [password](https://docs.commercelayer.io/api/authentication/password) grant type to exchange a customer credentials for an access token (i.e. to get a "logged" access token).

To get your access token in this case:

- Create a **sales channel** application on Commerce Layer and take note of your API credentials (base endpoint, client ID)

- Add this code to your application (changing user name and password with the customer credentials):

  ```typescript
  const user = {
    username: 'john@example.com',
    password: 'secret'
  }
  const auth = await salesChannel(
    {
      clientId: 'your-client-id',
      endpoint: 'https://yourdomain.commercelayer.io',
      scopes: 'market:{id}'
  	},
    user
  )
  
  console.log('My access token: ', auth.accessToken)
  ```

Sales channel applications can use the [refresh token](https://docs.commercelayer.io/api/authentication/refresh-token) grant type to refresh a customer's access token with a "remember me" option. So in this case, if the token is expired, you can refresh it by using the `refresh()` method:

  ```js
  const newToken = await auth.refresh()
  ```

## 3. Integration (Client credentials)

Integration applications use the [client credentials](https://docs.commercelayer.io/api/authentication/client-credentials) grant type to get an access token for themselves.

To get your access token in this case:

- Create an **integration** application on Commerce Layer and take note of your API credentials (client ID, client secret, base endpoint)

- Add this code to your application:

  ```typescript
  const auth = await integration({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    endpoint: 'https://yourdomain.commercelayer.io'
  })
  
  console.log('My access token: ', auth.accessToken)
  ```

## 4. Webapp (Authorization code)

> Available only for browser applications

Webapp applications use the [authorization code](https://docs.commercelayer.io/api/authentication/authorization-code) grant type to exchange an authorization code for an access token.

To get your access token in this case first you need to get an authorization code, then you can exchange it with an access token:

- Create a **webapp** application on Commerce Layer and take note of your API credentials (client ID, client secret, callback URL, base endpoint and the ID of the market you want to put in scope)

- Add this code to your base application:

  ```typescript
  const auth = await webapp({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    callbackUrl: 'your-callback-url',
    endpoint: 'https://yourdomain.commercelayer.io',
    scopes: 'market:{id}'
  })
  ```
  
  this method opens a window where you can log in to authorize your application.
  
- After you've been redirected to the callback URL you can get the access token:
  
  ```js
  // https://your-domain.com/your-callback-url
  
  const auth = await webapp({
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret',
      callbackUrl: 'your-callback-url',
      endpoint: 'https://yourdomain.commercelayer.io',
      scopes: 'market:{id}'
  	},
    location.href
  ) // return undefined
  
  console.log('My access token: ', auth.accessToken)
  ```

## License

This repository is published under the [MIT](LICENSE) license.
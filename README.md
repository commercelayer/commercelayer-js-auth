# Commerce Layer JS Auth

>A JavaScript Library wrapper that helps you to use the Commerce Layer API for [Authentication](https://docs.commercelayer.io/api/authentication).

### What is Commerce Layer?

[Commerce Layer](https://commercelayer.io/) is a headless platform that makes it easy to build enterprise-grade ecommerce into any website, by using the language, CMS, and tools you already master and love.

## Installation

Commerce Layer JS Auth is available as an npm package.

```
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

```
import CLayerAuth from '@commercelayer/js-auth'

// or

import { salesChannel, integration, webapp } from '@commercelayer/js-auth'
```

## Use cases

Based on the authorization flow and application you want to use, you can get your access token in a few simple steps. These are the most common use cases:

- [Sales channel application with client credentials flow](#sales-channel-client-credentials)
- [Sales channel application with password flow](#sales-channel-password)
- [Integration application with client credentials flow](#integration-client-credentials)
- [Webapp application with authorization code flow](#webapp-authorization-code)

## Sales channel (client credentials)

Sales channel applications use the [client credentials](https://docs.commercelayer.io/api/authentication/client-credentials) grant type to get a "guest" access token.

### Steps

1. Create a **sales channel** application on Commerce Layer and take note of your API credentials (base endpoint, client ID, and the ID of the market you want to put in scope)

2. Use this code to get your access token:

    ```
    const auth = await salesChannel({
        clientId: 'your-client-id',
        endpoint: 'https://yourdomain.commercelayer.io',
        scopes: 'market:{id}'
      })

    console.log('My access token: ', auth.accessToken)
    ```

## Sales channel (password)

Sales channel applications can use the [password](https://docs.commercelayer.io/api/authentication/password) grant type to exchange a customer credentials for an access token (i.e. to get a "logged" access token).

### Steps

1. Create a **sales channel** application on Commerce Layer and take note of your API credentials (base endpoint, client ID, and the ID of the market you want to put in scope)

2. Use this code (changing user name and password with the customer credentials) to get the access token:

    ```
    const auth = await salesChannel(
      {
        clientId: 'your-client-id',
        endpoint: 'https://yourdomain.commercelayer.io',
        scopes: 'market:{id}'
      },
      {
        username: 'john@example.com',
        password: 'secret'
      }
    )
    
    console.log('My access token: ', auth.accessToken)
    ```

Sales channel applications can use the [refresh token](https://docs.commercelayer.io/api/authentication/refresh-token) grant type to refresh a customer access token with a "remember me" option. So in this case, if the token is expired, you can refresh it by using the `refresh()` method:

  ```js
  const newToken = await auth.refresh()
  ```

## Integration (client credentials)

Integration applications use the [client credentials](https://docs.commercelayer.io/api/authentication/client-credentials) grant type to get an access token for themselves.

### Steps

1. Create an **integration** application on Commerce Layer and take note of your API credentials (client ID, client secret, and base endpoint)

2. Use this code to get the access token:

    ```
    const auth = await integration({
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret',
      endpoint: 'https://yourdomain.commercelayer.io'
    })
    
    console.log('My access token: ', auth.accessToken)
    ```

## Webapp (authorization code)

> Available only for browser applications

Webapp applications use the [authorization code](https://docs.commercelayer.io/api/authentication/authorization-code) grant type to exchange an authorization code for an access token.

### Steps

In this case, first you need to get an authorization code, then you can exchange it with an access token:

1. Create a **webapp** application on Commerce Layer and take note of your API credentials (client ID, client secret, callback URL, base endpoint, and the ID of the market you want to put in scope)

2. Use this code to open a new window and authorize your webapp on Commerce Layer:

    ```
    const auth = await webapp({
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret',
      callbackUrl: 'your-callback-url',
      endpoint: 'https://yourdomain.commercelayer.io',
      scopes: 'market:{id}'
    })
    ```
  
3. Once you've authorized the application, you will be redirected to the callback URL. Use this code to get the access token:
  
    ```
    // https://your-domain.com/your-callback-url
    
    const auth = await webapp({
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret',
      callbackUrl: 'your-callback-url',
      endpoint: 'https://yourdomain.commercelayer.io',
      scopes: 'market:{id}',
      location: 'location.href' // triggers the access token request
    }) // return undefined
    
    console.log('My access token: ', auth.accessToken)
    ```


## License

This repository is published under the [MIT](LICENSE) license.
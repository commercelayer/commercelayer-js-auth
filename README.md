# Commerce Layer JS Auth

A JavaScript Library wrapper that helps you to use the [Commerce Layer API Authentication](https://docs.commercelayer.io/api/authentication)

### What is Commerce Layer?

[Commerce Layer](https://commercelayer.io/) is a headless platform that makes it easy to build enterprise-grade ecommerce into any website, by using the language, CMS, and tools you already master and love.

## Installation

Commerce Layer JS SDK is available as an npm package.

```js
// npm
npm install @commercelayer/js-auth

// yarn
yarn add @commercelayer/js-auth
```

## Getting started

```js
import CLayerAuth from '@commercelayer/js-auth'

// or

import { salesChannel, integration, webapp } from '@commercelayer/js-auth'
```

## Use cases

You can get your access token in few simple steps.

First all, we want to remember our **authorization flows**: 

| Grant type             | Channel | Integration | Webapp |
| ---------------------- | ------- | ----------- | ------ |
| **Client credentials** | ✅       | ✅           |        |
| **Password**           | ✅       |             |        |
| **Refresh token**      | ✅       |             | ✅      |
| **Authorization code** |         |             | ✅      |

> For security reasons, access tokens expire after **2 hours**. Refresh tokens expire after **2** 


### 1. Sales Channel (Client credentials)

- Create a **sales channel** application on [Commerce Layer](https://commercelayer.io/) and take note of your API credentials (base endpoint, client ID)

- Write this code in your application:

  ```typescript
  const auth = await salesChannel(
    'YOUR_CLIENT_ID',
    'https://your-brand-name.commercelayer.io',
    'market:{id}'
  )
  
  console.log('My access token: ', auth.accessToken) // Easy!
  ```

### 2. Sales Channel (Password)
- Create a **sales channel** application on [Commerce Layer](https://commercelayer.io/) and take note of your API credentials (base endpoint, client ID)

- Write this code in your application:

  ```typescript
  const user = {
    username: 'MY_USERNAME',
    password: 'MY_PASSWORD'
  }
  const auth = await salesChannel(
    'YOUR_CLIENT_ID',
    'https://your-brand-name.commercelayer.io',
    'market:{id}',
    user
  )
  
  console.log('My access token: ', auth.accessToken)
  ```
  
- In this case, if your token is expired. You can refresh it with a simple method. Follow this example:

  ```js
  const newToken = await auth.refresh()
  ```

### 3. Integration (Client credentials)

- Create a **integration** application on [Commerce Layer](https://commercelayer.io/) and take note of your API credentials (base endpoint, client ID, secret ID)

- Write this code in your application:

  ```typescript
  const auth = await integration(
    'YOUR_CLIENT_ID',
    'YOUR_SECRET_ID',
    'https://your-brand-name.commercelayer.io'
  )
  
  console.log('My access token: ', auth.accessToken)
  ```

### 4. Webapp

- Create a **webapp** application on [Commerce Layer](https://commercelayer.io/) and take note of your API credentials (base endpoint, client ID, secret ID, callback URL)

- Write this code in your base application:

  ```typescript
  const auth = webapp(
    'YOUR_CLIENT_ID',
    'YOUR_CLIENT_SECRET',
    'YOUR_CALLBACK_URL',
    'https://your-brand-name.commercelayer.io',
    'market:{id}'
  ) // return undefined
  ```
  
  this method will open a window where you can log in to authorise your application.
  
  After, you will redirect to your **callback URL** and you have to follow this example:
  
  ```js
  // https://your-domain.com/{your-callback-url}
  
  const auth = await webapp(
    'YOUR_CLIENT_ID',
    'YOUR_CLIENT_SECRET',
    'YOUR_CALLBACK_URL',
    'https://your-brand-name.commercelayer.io',
    'market:{id}',
    false,
    location.href
  ) // return undefined
  
  console.log('My access token: ', auth.accessToken)
  ```

## License

This repository is published under the [MIT](LICENSE) license.
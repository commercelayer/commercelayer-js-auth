import {
  authenticate,
  makeSalesChannel,
  type Storage,
  type StorageValue,
} from "@commercelayer/js-auth"

/**
 * A valid storage must implement the `Storage` interface
 */
function memoryStorage(): Storage {
  const store = new Map<string, StorageValue>()
  return {
    name: "in-memory",
    async getItem(key) {
      return store.get(key) ?? null
    },
    async setItem(key: string, value: StorageValue) {
      store.set(key, value)
    },
    async removeItem(key: string) {
      store.delete(key)
    },
  }
}

const salesChannel = makeSalesChannel(
  {
    clientId: "<your_client_id>",
    scope: "<your_scope>",
    debug: true, // useful to understand what happens behind the scene
  },
  {
    storage: memoryStorage(),
  },
)

/**
 * At the beginning, you'll get a guest token
 */
const authorization1 = await salesChannel.getAuthorization()

console.log("Guest access token:", authorization1.accessToken)

/**
 * At some point, a customer logs in
 */
const customerAuth = await authenticate("password", {
  clientId: "<your_client_id>",
  scope: "<your_scope>",
  username: "<customer_email>",
  password: "<customer_password>",
})

/**
 * After customer login, set the customer token (+ optional refreshToken)
 */
await salesChannel.setCustomer({
  accessToken: customerAuth.accessToken,
  refreshToken: customerAuth.refreshToken, // optional for "remember me"
  scope: customerAuth.scope,
})

/**
 * After setting the customer, you'll get a customer token
 */
const authorization2 = await salesChannel.getAuthorization()

console.log("Customer access token:", authorization2.accessToken)

/**
 * Logout (revokes and clears storage for customer)
 */
await salesChannel.logoutCustomer()

/**
 * After logout, you'll get the previous guest token or a new one if expired
 */
const authorization3 = await salesChannel.getAuthorization()

console.log("Guest access token after logout:", authorization3.accessToken)

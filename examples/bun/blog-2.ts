import { createCompositeStorage, makeIntegration } from "@commercelayer/js-auth"

// The `Storage` interface is fully-compatible with the `unstorage` library.
import { createStorage } from "unstorage"
import memoryDriver from "unstorage/drivers/memory"
import redisDriver from "unstorage/drivers/redis"

const memoryStorage = createStorage({
  driver: memoryDriver(),
})

const redisStorage = createStorage({
  driver: redisDriver({
    url: "<your_redis_connection_string>",
  }),
})

const compositeStorage = createCompositeStorage([memoryStorage, redisStorage])

const integration = makeIntegration(
  {
    clientId: "<your_client_id>",
    clientSecret: "<your_client_secret>",
    debug: true,
  },
  {
    storage: compositeStorage,
  },
)

/**
 * If you already requested an access token before, now you'll probably get it from Redis if not expired.
 * Otherwise, a new one will be requested.
 *
 * This method handles caching and token refresh automatically.
 */
const authorization1 = await integration.getAuthorization()

console.log("Integration access token #1:", authorization1.accessToken)

/**
 * Subsequent calls will return the cached token from memory storage.
 */
const authorization2 = await integration.getAuthorization()

console.log("Integration access token #2:", authorization2.accessToken)

/**
 * Revoke the current integration authorization.
 * This will remove the authorization from memory and storage, and revoke the access token.
 */
await integration.revokeAuthorization()

/**
 * Disposes all mounted storages to ensure there are no open-handles left.
 * Call it before exiting process.
 */
await compositeStorage.dispose?.()

import {
  createCompositeStorage,
  makeSalesChannel,
} from "@commercelayer/js-auth"
import { createStorage, memoryDriver, redisDriver } from "@/app/utils/unstorage"
import { makeCustomerStorage } from "./customerStorage"

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string
const scope = process.env.NEXT_PUBLIC_SCOPE as string

const salesChannel = makeSalesChannel(
  {
    clientId,
    scope,
    debug: true,
  },
  {
    storage: createCompositeStorage({
      name: "serverCompositeStorage",
      storages: [
        createStorage({
          name: "memory-cache",
          driver: memoryDriver(),
        }),
        createStorage({
          name: "redis-persistent",
          driver: redisDriver({
            url: process.env.REDIS_URL,
          }),
        }),
      ],
    }),
    customerStorage: makeCustomerStorage(),
  },
)

export async function getServerSideAuth(): Promise<ReturnType<typeof makeSalesChannel>> {
  "use server"

  return {
    options: salesChannel.options,
    getAuthorization: async () => {
      "use server"

      return await salesChannel.getAuthorization()
    },
    removeAuthorization: async (type) => {
      "use server"

      return await salesChannel.removeAuthorization(type)
    },
    logoutCustomer: async () => {
      "use server"

      console.log("Logging out customer...")
      return await salesChannel.logoutCustomer()
    },
    setCustomer: async (customerData) => {
      "use server"

      return await salesChannel.setCustomer(customerData)
    },
  }
}

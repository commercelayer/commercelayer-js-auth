
import { createCompositeStorage, makeSalesChannel } from "@commercelayer/js-auth"
import { cookies } from 'next/headers'
import { createStorage } from "unstorage"
import memoryDriver from "unstorage/drivers/memory"
import redisDriver from "unstorage/drivers/redis"

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string
const scope = process.env.NEXT_PUBLIC_SCOPE as string

export function encodeCookieName(name: string): string {
  return encodeURIComponent(name).replace(
    /%(2[346B]|5E|60|7C)/g,
    decodeURIComponent,
  )
}

const salesChannel = makeSalesChannel(
  {
    clientId,
    scope,
    debug: true,
  },
  {
    storage: createCompositeStorage([
      createStorage({
        driver: memoryDriver(),
      }),
      createStorage({
        driver: redisDriver({
          url: process.env.REDIS_URL,
        }),
      }),
    ]),
    customerStorage: {
      getItem: async (key) => {
        "use server"
        const cookieStore = await cookies()
        const value = cookieStore.get(encodeCookieName(key))?.value
        return JSON.parse(value ?? "null")
      },
      setItem: async (key, value) => {
        "use server"
        const cookieStore = await cookies()
        cookieStore.set(encodeCookieName(key), JSON.stringify(value), {
          secure: true,
        })
      },
      removeItem: async (key) => {
        "use server"
        const cookieStore = await cookies()
        cookieStore.set(encodeCookieName(key), "null", { maxAge: 0 })
      },
    },
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

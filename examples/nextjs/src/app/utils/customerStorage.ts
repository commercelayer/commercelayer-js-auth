import type { Storage } from '@commercelayer/js-auth'
import { cookies } from "next/headers"

export function makeCustomerStorage(): Storage {
  return {
    name: "headerCookies",
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
  }
}

export function encodeCookieName(name: string): string {
  return encodeURIComponent(name).replace(
    /%(2[346B]|5E|60|7C)/g,
    decodeURIComponent,
  )
}
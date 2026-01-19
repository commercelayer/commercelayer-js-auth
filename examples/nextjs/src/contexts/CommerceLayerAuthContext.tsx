"use client"

import {
  type AuthenticateReturn,
  authenticate,
  makeSalesChannel,
} from "@commercelayer/js-auth"
import cookies from 'js-cookie'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { createStorage, localstorageDriver } from "@/app/utils/unstorage"

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID as string

type AuthState = {
  accessToken?: string
  ownerType?: "customer" | "guest"
  ownerId?: string
  errors?: Extract<AuthenticateReturn<'password'>, { errors?: unknown }>['errors']
}

interface CommerceLayerAuthContextType extends AuthState {
  login: ( email: string, password: string ) => Promise<void>
  logout: () => Promise<void>
}

const CommerceLayerAuthContext =
  createContext<CommerceLayerAuthContextType | null>(null)

export function useCommerceLayerAuth() {
  const context = useContext(CommerceLayerAuthContext)
  if (!context) {
    throw new Error(
      "useCommerceLayerAuth must be used within a CommerceLayerAuthProvider",
    )
  }
  return context
}

export function CommerceLayerAuthProvider({
  children,
  scope,
}: { children: ReactNode; scope: string }) {
  const [salesChannel, setSalesChannel] =
    useState<ReturnType<typeof makeSalesChannel>>()

  const [auth, setAuth] = useState<AuthState>({})

  useEffect(() => {
    setSalesChannel(
      makeSalesChannel(
        {
          clientId,
          scope,
          debug: true,
        },
        {
          storage: createStorage({
            driver: localstorageDriver({}),
          }),
          customerStorage: {
            name: "browserCookies",
            getItem: async (key) => {
              const value = cookies.get(key)
              return value ? JSON.parse(value) : null
            },
            setItem: async (key, value) => {
              cookies.set(key, JSON.stringify(value), { secure: true })
            },
            removeItem: async (key) => {
              cookies.remove(key)
            },
          },
        },
      ),
    )
  }, [scope])

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      if (!salesChannel) {
        throw new Error("Sales channel not initialized")
      }

      const passwordAuth = await authenticate("password", {
        clientId,
        scope,
        username: email,
        password,
      })

      if ((passwordAuth.errors ?? []).length > 0) {
        setAuth((prev) => ({
          ...prev,
          errors: passwordAuth.errors,
        }))
      }

      const authorization = await salesChannel.setCustomer({
        accessToken: passwordAuth.accessToken,
        scope: passwordAuth.scope,
        refreshToken: passwordAuth.refreshToken,
      })

      setAuth({
        accessToken: authorization.accessToken,
        ownerType: authorization.ownerType,
        ownerId: authorization.ownerType === 'customer' ? authorization.ownerId : undefined,
        errors: authorization.errors,
      })
    },
    [salesChannel, scope],
  )

  const logout = useCallback(async () => {
    if (!salesChannel) {
      return
    }

    const revokeResponse = await salesChannel.logoutCustomer()
    const { accessToken, ownerType } = await salesChannel.getAuthorization()
    setAuth({ accessToken, ownerType, errors: revokeResponse.errors })
  }, [salesChannel])

  useEffect(() => {
    void salesChannel?.getAuthorization().then((auth) => {
      setAuth({
        ownerType: auth.ownerType,
        ownerId:
          auth.ownerType === "customer"
            ? auth.ownerId
            : undefined,
        accessToken: auth.accessToken,
        errors: auth.errors,
      })
    })
  }, [salesChannel])

  return (
    <CommerceLayerAuthContext.Provider
      value={{
        ...auth,
        login,
        logout,
      }}
    >
      {children}
    </CommerceLayerAuthContext.Provider>
  )
}

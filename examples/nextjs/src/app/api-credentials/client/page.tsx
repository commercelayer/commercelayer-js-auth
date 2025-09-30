"use client"

import DefaultTemplate from "@/components/DefaultTemplate"
import { CommerceLayerAuthProvider, useCommerceLayerAuth } from "@/contexts/CommerceLayerAuthContext"
import { getCoreApiBaseEndpoint, jwtDecode } from "@commercelayer/js-auth"
import { useEffect, useMemo, useState } from "react"

const scope = process.env.NEXT_PUBLIC_SCOPE as string

export default function Page() {
  return (
    <DefaultTemplate title="Sales Channel • Client Component">
      <CommerceLayerAuthProvider scope={scope}>
        <CustomerNavigation />
        <OrganizationSlug />
        <BaseEndpoint />
        <CustomerOrders />
      </CommerceLayerAuthProvider>
    </DefaultTemplate>
  )
}

function CustomerNavigation() {
  const { ownerType, login, logout, errors } = useCommerceLayerAuth()

  if (ownerType === "customer") {
    return (
      <b>
        Welcome back
        <button
          type="button"
          onClick={() => {
            logout()
          }}
        >
          logout
        </button>
      </b>
    )
  }

  if (ownerType === "guest") {
    return (
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const email = formData.get("email") as string
            const password = formData.get("password") as string
            login(email, password)
          }}
        >
          <input type="email" name="email" placeholder="Email" required />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <button type="submit">login</button>
        </form>
        {errors && <div>Invalid credentials</div>}
      </div>
    )
  }

  return null
}

function OrganizationSlug() {
  const { accessToken, ownerType } = useCommerceLayerAuth()

  const organizationSlug = useMemo(() => {
    if (accessToken == null) {
      return null
    }

    const decodedJWT = jwtDecode(accessToken)

    if (!("organization" in decodedJWT.payload)) {
      return null
    }

    return decodedJWT.payload.organization.slug
  }, [accessToken])

  return (
    <div>
      organization slug:{" "}
      <big>
        <b>
          {organizationSlug && (
            <>
              {organizationSlug} ({ownerType})
            </>
          )}
        </b>
      </big>
    </div>
  )
}

function BaseEndpoint() {
  const { accessToken } = useCommerceLayerAuth()

  return (
    <div>
      base endpoint:{" "}
      <big>
        <b>{accessToken != null && getCoreApiBaseEndpoint(accessToken)}</b>
      </big>
    </div>
  )
}

function CustomerOrders() {
  const authorization = useCommerceLayerAuth()

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [orders, setOrders] = useState<any>(null)

  const organizationSlug = useMemo(() => {
    if (authorization.accessToken == null) {
      return null
    }

    const decodedJWT = jwtDecode(authorization.accessToken)

    if (!("organization" in decodedJWT.payload)) {
      return null
    }

    return decodedJWT.payload.organization.slug
  }, [authorization.accessToken])

  useEffect(() => {
    if (authorization.ownerType === "customer" && organizationSlug != null) {
      void fetch(
        `https://${organizationSlug}.commercelayer.io/api/customers/${authorization.ownerId}/orders`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authorization.accessToken}`,
            Accept: "application/vnd.api+json",
          },
        },
      )
        .then((res) => res.json())
        .then((data) => {
          setOrders(data)
        })
    } else {
      setOrders(null)
    }
  }, [authorization.accessToken, authorization.ownerType, authorization.ownerId, organizationSlug])

  if (orders == null) {
    return null
  }

  return (
    <div>
      orders:{" "}
      <big>
        <b>{orders.meta.record_count}</b> items
      </big>
    </div>
  )
}

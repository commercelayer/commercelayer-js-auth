import {
  getCoreApiBaseEndpoint,
  jwtDecode
} from "@commercelayer/js-auth"
import { getServerSideAuth } from "@/app/utils/getServerSideToken"
import DefaultTemplate from "@/components/DefaultTemplate"
import { login, logout } from "./actions"

export const dynamic = "force-dynamic"

export default async function Page() {
  return (
    <DefaultTemplate title="Sales Channel • Server Component">
      <>
        <CustomerNavigation />
        <OrganizationSlug />
        <BaseEndpoint />
        <CustomerOrders />
      </>
    </DefaultTemplate>
  )
}

async function CustomerNavigation() {
  const salesChannel = await getServerSideAuth()
  const { ownerType } = await salesChannel.getAuthorization()

  if (ownerType === "customer") {
    return (
      <b>
        <form action={logout}>
          Welcome back
          <button type="submit">logout</button>
        </form>
      </b>
    )
  }

  if (ownerType === "guest") {
    return (
      <div>
        <form action={login}>
          <input type="email" name="email" placeholder="Email" required />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  return null
}

async function OrganizationSlug() {
  const { getAuthorization } = await getServerSideAuth()
  const { accessToken, ownerType } = await getAuthorization()

  const decodedJWT = jwtDecode(accessToken)

  return (
    <div>
      organization slug:{" "}
      <big>
        <b>
          {"organization" in decodedJWT.payload &&
            `${decodedJWT.payload.organization.slug} (${ownerType})`}
        </b>
      </big>
    </div>
  )
}

async function BaseEndpoint() {
  const { getAuthorization } = await getServerSideAuth()
  const { accessToken } = await getAuthorization()

  return (
    <div>
      base endpoint:{" "}
      <big>
        <b>{accessToken && getCoreApiBaseEndpoint(accessToken)}</b>
      </big>
    </div>
  )
}

async function CustomerOrders() {
  const { getAuthorization } = await getServerSideAuth()
  const authorization = await getAuthorization()

  const decodedJWT = jwtDecode(authorization.accessToken)
  const organizationSlug = 'organization' in decodedJWT.payload ? decodedJWT.payload.organization.slug : null

  if (authorization.ownerType !== "customer" || organizationSlug == null) {
    return null
  }

  const orders = await fetch(
    `https://${organizationSlug}.commercelayer.io/api/customers/${authorization.ownerId}/orders`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authorization.accessToken}`,
        Accept: "application/vnd.api+json",
      },
    },
  ).then((res) => res.json())

  return (
    <div>
      orders:{" "}
      <big>
        <b>{orders.meta.record_count}</b> items
      </big>
    </div>
  )
}

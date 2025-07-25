"use server"

import { getServerSideAuth } from "@/app/utils/getServerSideToken"
import { authenticate } from "@commercelayer/js-auth"

export async function logout() {
  "use server"

  const { logoutCustomer } = await getServerSideAuth()

  await logoutCustomer()
}

export async function login(formData: FormData) {
  "use server"

  const { options, setCustomer } = await getServerSideAuth()

  const rawFormData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const response = await authenticate("password", {
    clientId: options.clientId,
    scope: options.scope,
    username: rawFormData.email?.toString() || "",
    password: rawFormData.password?.toString() || "",
  })

  await setCustomer(response)
}
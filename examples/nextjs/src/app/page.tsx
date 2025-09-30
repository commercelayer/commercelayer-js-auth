import DefaultTemplate from "@/components/DefaultTemplate"
import {
  authenticate,
  getCoreApiBaseEndpoint,
  jwtVerify,
} from "@commercelayer/js-auth"

export default async function Home() {
  const auth = await authenticate("client_credentials", {
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID as string,
    scope: process.env.NEXT_PUBLIC_SCOPE as string,
  })

  const decodedJWT = await jwtVerify(auth.accessToken)

  if (!("organization" in decodedJWT.payload)) {
    throw new Error('A "sales_channel" token is required.')
  }

  return (
    <DefaultTemplate
      title={
        <>
          Get started by editing&nbsp;
          <code>src/app/page.tsx</code>
        </>
      }
    >
      <>
        <div>
          organization slug:{" "}
          <big>
            <b>{decodedJWT.payload.organization.slug}</b>
          </big>
        </div>
        <div>
          base endpoint:{" "}
          <big>
            <b>{getCoreApiBaseEndpoint(auth.accessToken)}</b>
          </big>
        </div>
      </>
    </DefaultTemplate>
  )
}

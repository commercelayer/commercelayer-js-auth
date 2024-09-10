import Image from "next/image"
import styles from "./page.module.css"
import { authenticate, getCoreApiBaseEndpoint, jwtVerify } from '@commercelayer/js-auth'

export default async function Home() {

  const auth = await authenticate('client_credentials', {
    clientId: 'BISG8bb3GWpC8_D7Nt1SuWWdieS5bJq831A50LgB_Ig',
    scope: 'market:id:KoaJYhMVVj'
  })

  const decodedJWT = await jwtVerify(auth.accessToken)

  if (!('organization' in decodedJWT.payload)) {
    throw new Error('A "sales_channel" token is required.')
  }

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>src/app/page.tsx</code>
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <div>organization slug: <big><b>{decodedJWT.payload.organization.slug}</b></big></div>
        <div>base endpoint: <big><b>{getCoreApiBaseEndpoint(auth.accessToken)}</b></big></div>
      </div>

      <div className={styles.grid}>
        <a
          href="/middleware"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Middleware <span>-&gt;</span>
          </h2>
          <p><code>auth.js</code> within a middleware.</p>
        </a>

        <a
          href="/api/test"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Api <span>-&gt;</span>
          </h2>
          <p><code>auth.js</code> within an api.</p>
        </a>
      </div>
    </main>
  );
}

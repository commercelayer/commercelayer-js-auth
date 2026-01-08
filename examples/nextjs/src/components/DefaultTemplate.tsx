
import styles from "./DefaultTemplate.module.css"

export default function DefaultTemplate({
  title,
  children,
}: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>{title}</p>
        <a href="/">Back to home</a>
      </div>

      <div className={styles.center}>{children}</div>

      <div className={styles.grid}>
        <a
          href="/proxy"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Proxy <span>-&gt;</span>
          </h2>
          <p>
            <code>auth.js</code> within a proxy.
          </p>
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
          <p>
            <code>auth.js</code> within an api.
          </p>
        </a>

        <a href="/api-credentials/client" className={styles.card}>
          <h2>
            Client <span>-&gt;</span>
          </h2>
          <p>
            <code>auth.js</code> within a client component.
          </p>
        </a>

        <a href="/api-credentials/server" className={styles.card}>
          <h2>
            Server <span>-&gt;</span>
          </h2>
          <p>
            <code>auth.js</code> within a server component.
          </p>
        </a>
      </div>
    </main>
  )
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    VITE_TEST_SLUG: string
    VITE_TEST_CLIENT_ID: string
    VITE_TEST_DOMAIN: string
    VITE_TEST_SCOPE: string
    VITE_TEST_USERNAME: string
    VITE_TEST_PASSWORD: string
    VITE_TEST_INTEGRATION_CLIENT_ID: string
    VITE_TEST_CLIENT_SECRET: string
  }
}

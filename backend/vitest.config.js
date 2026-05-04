import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      JWT_SECRET: 'test-secret-key',
      RESEND_API_KEY: 're_test_dummy_key',
      GLOBEDATA_USERNAME: 'test_user',
      GLOBEDATA_PASSWORD: 'test_pass',
      PROXY_HOST: 'gate.proxytoro.com',
      PROXY_PORT: '8080',
    },
  },
})

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MFE_REGISTRY_URL: string
  readonly VITE_API_URL: string
  readonly VITE_AUTH_URL: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
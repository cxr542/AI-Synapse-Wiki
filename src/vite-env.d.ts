/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_ENABLED?: string;
  readonly VITE_ADMIN_PIN?: string;
  readonly VITE_ADMIN_PROTECT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
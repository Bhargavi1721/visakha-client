/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_LOGGER: string;
  readonly VITE_LOGGER_FILTER: string;
  readonly VITE_GROQ_API_KEY: string;
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

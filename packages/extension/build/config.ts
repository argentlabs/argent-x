import { dotEnvConfig } from "./dotEnv"

export const isProd = process.env.NODE_ENV === "production"
export const isDev = !isProd
export const useManifestV2 = process.env.MANIFEST_VERSION === "v2"
export const safeEnvVars = process.env.SAFE_ENV_VARS === "true"
export const useReactDevTools = isDev && dotEnvConfig.REACT_DEVTOOLS === "true"
export const showDevUi = isDev && process.env.SHOW_DEV_UI

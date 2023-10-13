import { isFeatureEnabled } from "@argent/shared"

export const isPrivacySettingsEnabled = isFeatureEnabled(
  process.env.FEATURE_PRIVACY_SETTINGS,
)

export const isExperimentalSettingsEnabled = isFeatureEnabled(
  process.env.FEATURE_EXPERIMENTAL_SETTINGS,
)

export const isBetaFeaturesEnabled = isFeatureEnabled(
  process.env.FEATURE_BETA_FEATURES,
)

export { settingsStore } from "./store"

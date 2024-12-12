import { isFeatureEnabled } from "@argent/x-shared"

export const isDefiDecompositionEnabled = isFeatureEnabled(
  process.env.FEATURE_DEFI_DECOMPOSITION,
)

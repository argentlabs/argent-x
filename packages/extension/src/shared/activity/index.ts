import { isFeatureEnabled } from "@argent/x-shared"

export const isActivityV2FeatureEnabled = isFeatureEnabled(
  process.env.FEATURE_ACTIVITY_V2,
)

import { devStore } from "../../../shared/dev/store"
import { IS_DEV } from "../../../shared/utils/dev"
import { onboardingService } from "../onboarding"
import { DevWorker } from "./DevWorker"

export const devWorker = IS_DEV
  ? new DevWorker(devStore, onboardingService)
  : undefined

import browser from "webextension-polyfill"

import { uiService } from "../../../../shared/__new/services/ui"
import { old_walletStore } from "../../../../shared/wallet/walletStore"
import OnboardingService from "./implementation"
import OnboardingWorker from "./worker/implementation"

export const onboardingService = new OnboardingService(
  uiService,
  old_walletStore,
)

export const onboardingWorker = new OnboardingWorker(
  onboardingService,
  old_walletStore,
  browser,
)

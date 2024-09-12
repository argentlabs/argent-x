import browser from "webextension-polyfill"

import { uiService } from "../../../shared/ui"
import { old_walletStore } from "../../../shared/wallet/walletStore"
import { backgroundUIService } from "../ui"
import OnboardingService from "./OnboardingService"
import OnboardingWorker from "./worker/OnboardingWorker"

export const onboardingService = new OnboardingService(
  backgroundUIService,
  uiService,
  old_walletStore,
)

export const onboardingWorker = new OnboardingWorker(
  onboardingService,
  old_walletStore,
  browser,
)

import type { IDevStorage } from "../../../shared/dev/types"
import type { IOnboardingService } from "../../../shared/onboarding/IOnboardingService"
import type { KeyValueStorage } from "../../../shared/storage/keyvalue"
import { delay } from "../../../shared/utils/delay"

export class DevWorker {
  constructor(
    private devStore: KeyValueStorage<IDevStorage>,
    private onboardingService: IOnboardingService,
  ) {
    devStore.subscribe(
      "openInExtendedView",
      this.openInExtendedViewChange.bind(this),
    )
    void (async () => {
      await delay(0) // Allow onboarding service to initialize so we can override if it calls iconClickOpensPopup()
      const openInExtendedView = await this.devStore.get("openInExtendedView")
      if (openInExtendedView) {
        console.log(
          "App will open in extended view - use `pnpm dev:ui` or reset storage to change",
        )
        this.onboardingService.iconClickOpensOnboarding()
      }
    })()
  }

  async openInExtendedViewChange(openInExtendedView: boolean) {
    if (openInExtendedView) {
      this.onboardingService.iconClickOpensOnboarding()
    } else {
      const onboardingComplete =
        await this.onboardingService.getOnboardingComplete()
      if (onboardingComplete) {
        this.onboardingService.iconClickOpensPopup()
      } else {
        this.onboardingService.iconClickOpensOnboarding()
      }
    }
  }
}

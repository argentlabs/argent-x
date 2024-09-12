import type { IUIService } from "../../../shared/ui/IUIService"
import type { KeyValueStorage } from "../../../shared/storage"
import type { DeepPick } from "../../../shared/types/deepPick"
import type { WalletStorageProps } from "../../../shared/wallet/walletStore"
import type { IOnboardingService } from "../../../shared/onboarding/IOnboardingService"
import type { IBackgroundUIService } from "../ui/IBackgroundUIService"

type MinimalBackgroundUIService = DeepPick<
  IBackgroundUIService,
  "hasPopup" | "closePopup"
>

type MinimalUIService = DeepPick<
  IUIService,
  "createTab" | "focusTab" | "hasTab" | "setDefaultPopup" | "unsetDefaultPopup"
>

export default class OnboardingService implements IOnboardingService {
  constructor(
    private backgroundUIService: MinimalBackgroundUIService,
    private uiService: MinimalUIService,
    private walletStore: KeyValueStorage<WalletStorageProps>,
  ) {}

  async getOnboardingComplete() {
    const value = await this.walletStore.get("backup")
    return Boolean(value)
  }

  async openOnboarding() {
    this.iconClickOpensOnboarding()
    const hasPopup = await this.backgroundUIService.hasPopup()
    if (hasPopup) {
      await this.backgroundUIService.closePopup()
    }
    const hasTab = await this.uiService.hasTab()
    if (hasTab) {
      await this.uiService.focusTab()
    } else {
      await this.uiService.createTab()
    }
  }

  iconClickOpensOnboarding() {
    void this.uiService.unsetDefaultPopup()
  }

  iconClickOpensPopup() {
    void this.uiService.setDefaultPopup()
  }
}

import type { IUIService } from "../../../../shared/__new/services/ui/interface"
import type { KeyValueStorage } from "../../../../shared/storage"
import { DeepPick } from "../../../../shared/types/deepPick"
import type { WalletStorageProps } from "../../../../shared/wallet/walletStore"
import type { IOnboardingService } from "./interface"

type MinimalUIService = DeepPick<
  IUIService,
  | "closePopup"
  | "createTab"
  | "focusTab"
  | "hasPopup"
  | "hasTab"
  | "setDefaultPopup"
  | "unsetDefaultPopup"
>

export default class OnboardingService implements IOnboardingService {
  constructor(
    private uiService: MinimalUIService,
    private walletStore: KeyValueStorage<WalletStorageProps>,
  ) {}

  async getOnboardingComplete() {
    const value = await this.walletStore.get("backup")
    return Boolean(value)
  }

  async openOnboarding() {
    this.iconClickOpensOnboarding()
    const hasPopup = this.uiService.hasPopup()
    if (hasPopup) {
      this.uiService.closePopup()
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

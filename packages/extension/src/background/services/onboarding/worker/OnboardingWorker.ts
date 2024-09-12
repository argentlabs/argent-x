import {
  MinimalActionBrowser,
  getBrowserAction,
} from "../../../../shared/browser"
import type { KeyValueStorage } from "../../../../shared/storage"
import type { StorageChange } from "../../../../shared/storage/types"
import type { DeepPick } from "../../../../shared/types/deepPick"
import type { WalletStorageProps } from "../../../../shared/wallet/walletStore"
import type { IOnboardingService } from "../../../../shared/onboarding/IOnboardingService"

type MinimalBrowser = DeepPick<
  typeof chrome,
  "runtime.onInstalled.addListener"
> &
  MinimalActionBrowser

export default class OnboardingWorker {
  constructor(
    private onboardingService: IOnboardingService,
    private walletStore: KeyValueStorage<WalletStorageProps>,
    private browser: MinimalBrowser,
  ) {
    this.browser.runtime.onInstalled.addListener(this.onInstalled.bind(this))
    getBrowserAction(this.browser).onClicked.addListener(
      this.onExtensionIconClick.bind(this),
    )
    this.walletStore.subscribe(
      "backup",
      this.onWalletStoreBackupChange.bind(this),
    )
    void (async () => {
      /** initialise what happens when user clicks icon */
      const onboardingComplete =
        await this.onboardingService.getOnboardingComplete()
      if (onboardingComplete) {
        this.onboardingService.iconClickOpensPopup()
      } else {
        this.onboardingService.iconClickOpensOnboarding()
      }
    })()
  }

  private onInstalled(details: chrome.runtime.InstalledDetails) {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      void this.onboardingService.openOnboarding()
    }
  }

  /** Icon click event that fires only when `iconClickOpensOnboarding` is set */
  private onExtensionIconClick() {
    void this.onboardingService.openOnboarding()
  }

  private onWalletStoreBackupChange(
    _value: string | undefined,
    { oldValue, newValue }: StorageChange<string>,
  ) {
    if (oldValue === undefined && newValue !== undefined) {
      /** New wallet created - onboarding done */
      this.onboardingService.iconClickOpensPopup()
    } else if (oldValue !== undefined && newValue === undefined) {
      /** Wallet destroyed - start onboarding again */
      this.onboardingService.iconClickOpensOnboarding()
      void this.onboardingService.openOnboarding()
    }
  }
}

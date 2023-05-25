import { describe, expect, test, vi } from "vitest"

import type { KeyValueStorage } from "../../../../../shared/storage"
import type { WalletStorageProps } from "../../../../../shared/wallet/walletStore"
import OnboardingWorker from "./implementation"

describe("OnboardingWorker", () => {
  const makeService = () => {
    const onboardingService = {
      getOnboardingComplete: vi.fn(),
      iconClickOpensPopup: vi.fn(),
      iconClickOpensOnboarding: vi.fn(),
      openOnboarding: vi.fn(),
    }
    const walletStore = {
      subscribe: vi.fn(),
    } as unknown as KeyValueStorage<WalletStorageProps>
    const browser = {
      runtime: {
        onInstalled: {
          addListener: vi.fn(),
        },
      },
      browserAction: {
        onClicked: {
          addListener: vi.fn(),
        },
      },
    }
    const onboardingWorker = new OnboardingWorker(
      onboardingService,
      walletStore,
      browser,
    )
    return {
      onboardingWorker,
      onboardingService,
      walletStore,
      browser,
    }
  }
  test("it should add listeners", async () => {
    const { onboardingService, walletStore, browser } = makeService()
    onboardingService.getOnboardingComplete.mockImplementationOnce(
      async () => false,
    )
    expect(browser.runtime.onInstalled.addListener).toHaveBeenCalled()
    expect(browser.browserAction.onClicked.addListener).toHaveBeenCalled()
    expect(walletStore.subscribe).toHaveBeenCalled()
    expect(onboardingService.getOnboardingComplete).toHaveBeenCalled()
    await Promise.resolve()
    expect(onboardingService.iconClickOpensOnboarding).toHaveBeenCalled()
  })
})

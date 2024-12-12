import { describe, expect, test, vi } from "vitest"

import type { KeyValueStorage } from "../../../../shared/storage"
import type { WalletStorageProps } from "../../../../shared/wallet/walletStore"
import OnboardingWorker from "./OnboardingWorker"

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
        getManifest: vi.fn(
          () =>
            ({
              manifest_version: 3,
            }) as any,
        ),
        onInstalled: {
          addListener: vi.fn(),
        },
      },
      action: {
        onClicked: {
          addListener: vi.fn(),
        },
      } as any,
      browserAction: {} as any,
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
    expect(browser.action.onClicked.addListener).toHaveBeenCalled()
    expect(walletStore.subscribe).toHaveBeenCalled()
    expect(onboardingService.getOnboardingComplete).toHaveBeenCalled()
    await Promise.resolve()
    expect(onboardingService.iconClickOpensOnboarding).toHaveBeenCalled()
  })
})

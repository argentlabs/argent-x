import { describe, expect, test, vi } from "vitest"

import type { KeyValueStorage } from "../../../../shared/storage"
import type { WalletStorageProps } from "../../../../shared/wallet/walletStore"
import OnboardingService from "./implementation"

describe("OnboardingService", () => {
  const makeService = () => {
    const uiService = {
      closePopup: vi.fn(),
      createTab: vi.fn(),
      focusTab: vi.fn(),
      hasPopup: vi.fn(),
      hasTab: vi.fn(),
      setDefaultPopup: vi.fn(),
      unsetDefaultPopup: vi.fn(),
    }
    const walletStore = {
      get: vi.fn(),
    } as unknown as KeyValueStorage<WalletStorageProps>
    const onboardingService = new OnboardingService(uiService, walletStore)
    return {
      onboardingService,
      uiService,
      walletStore,
    }
  }
  test("getOnboardingComplete", async () => {
    const { onboardingService, walletStore } = makeService()
    await onboardingService.getOnboardingComplete()
    expect(walletStore.get).toHaveBeenCalledWith("backup")
  })
  describe("openOnboarding", async () => {
    test("when there is no popup or tab", async () => {
      const { onboardingService, uiService } = makeService()
      const iconClickOpensOnboardingSpy = vi.spyOn(
        onboardingService,
        "iconClickOpensOnboarding",
      )
      uiService.hasPopup.mockImplementationOnce(() => false)
      uiService.hasTab.mockImplementationOnce(() => false)
      await onboardingService.openOnboarding()
      expect(iconClickOpensOnboardingSpy).toHaveBeenCalled()
      expect(uiService.hasPopup).toHaveBeenCalled()
      expect(uiService.closePopup).not.toHaveBeenCalled()
      expect(uiService.hasTab).toHaveBeenCalled()
      expect(uiService.createTab).toHaveBeenCalled()
      expect(uiService.focusTab).not.toHaveBeenCalled()
    })
    test("when there is a popup but no tab", async () => {
      const { onboardingService, uiService } = makeService()
      const iconClickOpensOnboardingSpy = vi.spyOn(
        onboardingService,
        "iconClickOpensOnboarding",
      )
      uiService.hasPopup.mockImplementationOnce(() => true)
      uiService.hasTab.mockImplementationOnce(() => false)
      await onboardingService.openOnboarding()
      expect(iconClickOpensOnboardingSpy).toHaveBeenCalled()
      expect(uiService.hasPopup).toHaveBeenCalled()
      expect(uiService.closePopup).toHaveBeenCalled()
      expect(uiService.hasTab).toHaveBeenCalled()
      expect(uiService.createTab).toHaveBeenCalled()
      expect(uiService.focusTab).not.toHaveBeenCalled()
    })
    test("when there is a tab but no popup", async () => {
      const { onboardingService, uiService } = makeService()
      const iconClickOpensOnboardingSpy = vi.spyOn(
        onboardingService,
        "iconClickOpensOnboarding",
      )
      uiService.hasPopup.mockImplementationOnce(() => false)
      uiService.hasTab.mockImplementationOnce(() => true)
      await onboardingService.openOnboarding()
      expect(iconClickOpensOnboardingSpy).toHaveBeenCalled()
      expect(uiService.hasPopup).toHaveBeenCalled()
      expect(uiService.closePopup).not.toHaveBeenCalled()
      expect(uiService.hasTab).toHaveBeenCalled()
      expect(uiService.createTab).not.toHaveBeenCalled()
      expect(uiService.focusTab).toHaveBeenCalled()
    })
  })
})

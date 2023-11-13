import { describe, expect, test, vi } from "vitest"

import UIService from "./implementation"

describe("UIService", () => {
  const makeService = () => {
    const browser = {
      action: {
        setPopup: vi.fn(),
      } as any,
      browserAction: {} as any,
      extension: {
        getViews: vi.fn(),
      },
      runtime: {
        getURL: vi.fn(),
        getManifest: vi.fn(() => ({ manifest_version: 3 } as any)),
      },
      tabs: {
        create: vi.fn(),
        query: vi.fn(),
        update: vi.fn(),
      },
      windows: {
        getAll: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
      },
    }
    const uiService = new UIService(browser)
    return {
      uiService,
      browser,
    }
  }
  test("setDefaultPopup", async () => {
    const { uiService, browser } = makeService()
    await uiService.setDefaultPopup()
    expect(browser.action.setPopup).toHaveBeenCalledWith({
      popup: "index.html",
    })
  })
  test("unsetDefaultPopup", async () => {
    const { uiService, browser } = makeService()
    await uiService.unsetDefaultPopup()
    expect(browser.action.setPopup).toHaveBeenCalledWith({
      popup: "",
    })
  })
  describe("focusTab", () => {
    test("when there is no tab", async () => {
      const { uiService, browser } = makeService()
      const getTabSpy = vi.spyOn(uiService, "getTab")
      getTabSpy.mockImplementationOnce(async () => {
        return {} as chrome.tabs.Tab
      })
      await uiService.focusTab()
      expect(getTabSpy).toHaveBeenCalled()
      expect(browser.windows.update).not.toHaveBeenCalled()
      expect(browser.tabs.update).not.toHaveBeenCalled()
    })
    test("when there is a tab", async () => {
      const { uiService, browser } = makeService()
      const getTabSpy = vi.spyOn(uiService, "getTab")
      getTabSpy.mockImplementationOnce(async () => {
        return { id: "123", windowId: "abc" } as never as chrome.tabs.Tab
      })
      await uiService.focusTab()
      expect(getTabSpy).toHaveBeenCalled()
      expect(browser.windows.update).toHaveBeenCalledWith("abc", {
        focused: true,
      })
      expect(browser.tabs.update).toHaveBeenCalledWith("123", {
        active: true,
      })
    })
  })
})

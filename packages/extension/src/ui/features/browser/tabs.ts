import { isNumber } from "lodash-es"
import { useCallback, useEffect, useState } from "react"
import browser from "webextension-polyfill"

import { uiService } from "../../../shared/ui"

export const openExtensionInTab = async () => {
  const url = browser.runtime.getURL("index.html")
  const tab = await browser.tabs.create({ url })
  return tab
}

export const extensionIsInTab = async () => {
  return Boolean(await browser.tabs.getCurrent())
}

export const extensionIsInSidePanel = async () => {
  const contexts = await browser.runtime.getContexts({
    contextTypes: [browser.runtime.ContextType.SIDE_PANEL],
  })
  return contexts.length > 0
}

export const focusExtensionTab = async () => {
  const tab = await browser.tabs.getCurrent()
  if (tab && isNumber(tab?.id) && tab?.id !== browser.tabs.TAB_ID_NONE) {
    await browser.tabs.update(tab.id, { active: true })
  }
}

/** Focus the extension if it is running in a tab  */
export const useFocusExtensionIfInTab = () => {
  const extensionIsInTab = useExtensionIsInTab()
  useEffect(() => {
    const init = async () => {
      if (extensionIsInTab) {
        await focusExtensionTab()
      }
    }
    void init()
  }, [extensionIsInTab])
}

export const useExtensionIsInTab = () => {
  const [isInTab, setIsInTab] = useState(false)
  useEffect(() => {
    const init = async () => {
      const inTab = await extensionIsInTab()
      setIsInTab(inTab)
    }
    void init()
  }, [])
  return isInTab
}

export const useOpenExtensionInTab = () => {
  return useCallback(async () => {
    await uiService.unsetDefaultSidePanel()
    await openExtensionInTab()
    window.close()
  }, [])
}

export const useExtensionIsInSidePanel = () => {
  const [isInSidePanel, setIsInSidePanel] = useState(false)
  useEffect(() => {
    const init = async () => {
      const inTab = await extensionIsInSidePanel()
      setIsInSidePanel(inTab)
    }
    void init()
  }, [])
  return isInSidePanel
}

export const useOpenExtensionInSidePanel = () => {
  return useCallback(async () => {
    await uiService.setDefaultSidePanel()
    await uiService.openSidePanel()
    window.close()
  }, [])
}

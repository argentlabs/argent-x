import browser from "webextension-polyfill"

export const extensionOrigin = new URL(chrome.runtime.getURL("")).origin

export async function getOtherTabsOrigins() {
  return getTabsOrigins({
    active: false,
    lastFocusedWindow: true,
  })
}

export async function getCurrentTabOrigin() {
  const [origin] = await getTabsOrigins({
    active: true,
    lastFocusedWindow: true,
  })

  return origin
}

export async function getTabsOrigins(queryInfo: browser.tabs.QueryInfo) {
  const tabs = await browser.tabs.query(queryInfo)
  // Filter to ensure every tab has a non-empty, non-undefined URL string
  const validUrls = tabs
    .map((tab) => tab.url) // Map to get all URLs
    .filter(Boolean)
    .filter(
      (url): url is string => typeof url === "string" && url.trim() !== "",
    )

  if (validUrls.length === 0) {
    return []
  }
  try {
    const origins = validUrls.map((url) => new URL(url).origin) // Now safely map to origins
    return origins
  } catch (error) {
    console.error("Error processing URLs: " + error)
    throw error
  }
}

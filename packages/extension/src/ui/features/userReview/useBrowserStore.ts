import {
  FIREFOX_STORE_LINK,
  CHROME_STORE_LINK,
  EDGE_STORE_LINK,
} from "./constants"

export const useBrowserStore = (): [string, string] => {
  const userAgent = navigator.userAgent.toLowerCase()
  // 'edg' must be first since it also contains 'chrome'
  if (userAgent.includes("edg")) {
    return ["Edge", EDGE_STORE_LINK]
  }
  if (userAgent.includes("firefox")) {
    return ["Firefox", FIREFOX_STORE_LINK]
  }
  return ["Chrome", CHROME_STORE_LINK]
}

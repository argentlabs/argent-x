import { UAParser } from "ua-parser-js"

export function useUserAgent() {
  const uaParser = new UAParser()
  return uaParser.getResult()
}

export function useUserBrowser(browserName: string) {
  const { browser } = useUserAgent()
  return browser.name === browserName
}

export function useIsFirefox() {
  return useUserBrowser("Firefox")
}

export function useIsChrome() {
  return useUserBrowser("Chrome")
}

export function useIsSafari() {
  return useUserBrowser("Safari")
}

export function useIsEdge() {
  return useUserBrowser("Edge")
}

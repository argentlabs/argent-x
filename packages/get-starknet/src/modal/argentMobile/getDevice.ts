import { detect } from "detect-browser"

export const getDevice = (): "android" | "ios" | "desktop" => {
  const browser = detect()
  const os = browser?.os?.toLowerCase()
  if (os?.includes("android")) {
    return "android"
  } else if (
    os?.toLowerCase().includes("ios") ||
    (os?.toLowerCase().includes("mac") && navigator.maxTouchPoints > 1)
  ) {
    return "ios"
  }
  return "desktop"
}

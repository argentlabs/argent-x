export function stripChromeExtensionPrefix(url: string) {
  return url.replace(/^chrome-extension:\/\/[a-zA-Z0-9]{32}\//, "")
}

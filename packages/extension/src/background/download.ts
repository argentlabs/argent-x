import browser from "webextension-polyfill"

export async function downloadFile(data: { url: string; filename: string }) {
  browser.downloads.download(data)
}

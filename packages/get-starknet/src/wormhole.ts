import type { RemoteConnection } from "@argent/x-window"
import { getRemoteHandle } from "@argent/x-window"
import retry from "async-retry"

export const applyModalStyle = (iframe: HTMLIFrameElement) => {
  // middle of the screen
  iframe.style.position = "fixed"
  iframe.style.top = "50%"
  iframe.style.left = "50%"
  iframe.style.transform = "translate(-50%, -50%)"
  iframe.style.width = "380px"
  iframe.style.height = "420px"
  iframe.style.border = "none"

  // round corners
  iframe.style.borderRadius = "40px"
  // box shadow
  iframe.style.boxShadow = "0px 4px 20px rgba(0, 0, 0, 0.5)"

  const background = document.createElement("div")
  background.style.display = "none"
  background.style.position = "fixed"
  background.style.top = "0"
  background.style.left = "0"
  background.style.right = "0"
  background.style.bottom = "0"
  background.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
  background.style.zIndex = "9999"
  ;(background.style as any).backdropFilter = "blur(4px)"

  background.appendChild(iframe)

  return background
}

export const showModal = (modal: HTMLDivElement) => {
  modal.style.display = "block"
}

export const hideModal = (modal: HTMLDivElement) => {
  modal.style.display = "none"
}

export const applyInlineStyle = (iframe: HTMLIFrameElement) => {
  iframe.style.width = "100%"
  iframe.style.height = "104px"
  iframe.style.border = "none"
  iframe.style.borderRadius = "0px"
  iframe.style.boxShadow = "none"
  iframe.style.position = "relative"
  iframe.style.top = "0"
  iframe.style.left = "0"
  iframe.style.transform = "none"
  iframe.style.display = "block"

  return iframe
}

export const createIframe = async (targetUrl: string, shouldShow: boolean) => {
  const iframe = document.createElement("iframe")
  iframe.src = targetUrl
  iframe.style.display = shouldShow ? "block" : "none"
  iframe.style.position = "absolute"
  iframe.style.top = "-10000px"
  iframe.style.left = "-10000px"
  iframe.style.maxWidth = "1000px"
  iframe.style.maxHeight = "1000px"
  iframe.style.border = "none"
  iframe.style.borderRadius = "0px"
  iframe.style.boxShadow = "none"
  iframe.style.transform = "none"
  ;(iframe as any).loading = "eager"
  iframe.sandbox.add(
    "allow-scripts",
    "allow-same-origin",
    "allow-forms",
    "allow-top-navigation",
    "allow-popups",
  )

  return iframe
}

export const loadIframe = async (iframe: HTMLIFrameElement) =>
  new Promise<HTMLIFrameElement>((resolve, reject) => {
    const pid = setTimeout(
      () => reject(new Error("Timeout while opening an iframe")),
      20000,
    )

    iframe.addEventListener("load", async () => {
      clearTimeout(pid)
      await new Promise((resolve) => setTimeout(resolve, 500)) // wait for all animations in the iframe to finish
      resolve(iframe)
    })
  })

export const getIframeConnection = async (
  iframe: HTMLIFrameElement,
): Promise<RemoteConnection> => {
  const handle = await retry(
    () =>
      getRemoteHandle({
        remoteWindow: iframe.contentWindow,
        remoteOrigin: "*",
        localWindow: window,
      }),
    {
      maxRetryTime: 5,
      minTimeout: 500,
    },
  ).catch((cause) => {
    throw Error("Failed to connect to iframe", { cause })
  })

  await handle.once("ARGENT_WEB_WALLET::LOADED")
  console.log("ARGENT_WEB_WALLET::LOADED")

  return handle
}

import type { Subscribable } from "@argent/x-window"
import memo from "lodash-es/memoize"

export const getTargetIframe = memo(
  async (targetUrl: string) =>
    new Promise<HTMLIFrameElement>((resolve, reject) => {
      const iframe = document.createElement("iframe")
      iframe.src = targetUrl
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
      background.style.backdropFilter = "blur(4px)"

      const messageHandler = (event: MessageEvent) => {
        console.log(
          "received message",
          event.origin,
          targetUrl,
          event.data.type,
        )
        if (targetUrl.includes(event.origin)) {
          if (event.data.type === "ARGENT_WEB_WALLET::CONNECT") {
            return resolve(iframe)
          }
          if (event.data.type === "ARGENT_WEB_WALLET::SHOULD_SHOW") {
            background.style.display = "block"
          }
          if (event.data.type === "ARGENT_WEB_WALLET::SHOULD_HIDE") {
            background.style.display = "none"
          }
          if (event.data.type === "ARGENT_WEB_WALLET::HEIGHT_CHANGED") {
            const suggestedHeight = event.data.data.height
            iframe.style.height = `min(${suggestedHeight || 420}px, 100%)`
          }
        }
      }
      window.addEventListener("message", messageHandler)

      setTimeout(() => reject(new Error("Timeout")), 20000)

      background.appendChild(iframe)
      document.body.appendChild(background)
    }),
)

export const warp = (targetUrl: string): Subscribable => ({
  postMessage(message, targetOrigin) {
    getTargetIframe(targetUrl).then((iframe) => {
      iframe.contentWindow?.postMessage(message, targetOrigin)
    })
  },
  addEventListener(type, listener) {
    window.addEventListener("message", listener)
  },
})

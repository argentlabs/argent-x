import type { Subscribable } from "@argent/x-window"
import memo from "lodash-es/memoize"

const getTargetIframe = memo(
  async (targetUrl: string) =>
    new Promise<HTMLIFrameElement>((resolve, reject) => {
      const iframe = document.createElement("iframe")
      iframe.src = targetUrl

      // for debugging show the iframe in the page bottom right
      iframe.style.position = "fixed"
      iframe.style.bottom = "0"
      iframe.style.right = "0"
      iframe.style.width = "300px"
      iframe.style.height = "200px"
      iframe.style.border = "none"

      iframe.onload = () => resolve(iframe)
      iframe.onerror = reject
      setTimeout(() => reject(new Error("Timeout")), 5000)

      document.body.appendChild(iframe)
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

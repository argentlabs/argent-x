import type { RemoteConnection } from "@argent/x-window"
import { getRemoteHandle } from "@argent/x-window"
import memo from "lodash-es/memoize"

export const getIframeConnection = memo(
  async (targetUrl: string) =>
    new Promise<RemoteConnection>((resolve, reject) => {
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
      ;(background.style as any).backdropFilter = "blur(4px)"

      setTimeout(() => reject(new Error("Timeout")), 20000)

      background.appendChild(iframe)
      document.body.appendChild(background)

      Promise.resolve().then(async () => {
        const handle = await getRemoteHandle({
          remoteWindow: iframe.contentWindow,
          remoteOrigin: "*",
          localWindow: window,
        })

        handle.addEventListener("ARGENT_WEB_WALLET::SHOULD_SHOW", () => {
          background.style.display = "block"
        })
        handle.addEventListener("ARGENT_WEB_WALLET::SHOULD_HIDE", () => {
          background.style.display = "none"
        })
        handle.addEventListener(
          "ARGENT_WEB_WALLET::HEIGHT_CHANGED",
          (height) => {
            iframe.style.height = `min(${height || 420}px, 100%)`
          },
        )
        await handle.once("ARGENT_WEB_WALLET::CONNECT")
        return resolve(handle)
      })
    }),
)

export const warp = (targetUrl: string) =>
  getIframeConnection(targetUrl).then((h) => {
    console.log("warp", h)
    return h
  })

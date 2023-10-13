import { getDevice } from "./getDevice"

const device = getDevice()

export interface RequestArguments {
  method: string
  params?: unknown[] | object
}

const overlayStyle = {
  position: "fixed",
  top: "0",
  left: "0",
  right: "0",
  bottom: "0",
  backgroundColor: "rgba(0,0,0,0.8)",
  backdropFilter: "blur(10px)",
  zIndex: "9999",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  color: "white",
  fontWeight: "500",
  fontFamily: "'Barlow', sans-serif",
}

const iframeStyle = {
  width: "840px",
  height: "540px",
  zIndex: "99999",
  backgroundColor: "white",
  border: "none",
  outline: "none",
  borderRadius: "40px",
  boxShadow: "0px 4px 40px 0px rgb(0 0 0), 0px 4px 8px 0px rgb(0 0 0 / 25%)",
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-50%)",
}

const overlayHtml = `
  <div style="position: relative">
    <iframe class="argent-iframe" allow="clipboard-write"></iframe>
    <div class="argent-close-button" style="position: absolute; top: 24px; right: 24px; cursor: pointer;">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#F5F3F0"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M22.2462 9.75382C22.7018 10.2094 22.7018 10.9481 22.2462 11.4037L17.6499 16L22.2462 20.5963C22.7018 21.0519 22.7018 21.7906 22.2462 22.2462C21.7905 22.7018 21.0519 22.7018 20.5962 22.2462L16 17.6499L11.4039 22.246C10.9482 22.7017 10.2096 22.7017 9.75394 22.246C9.29833 21.7904 9.29833 21.0517 9.75394 20.5961L14.3501 16L9.75394 11.4039C9.29833 10.9483 9.29833 10.2096 9.75394 9.75396C10.2096 9.29835 10.9482 9.29835 11.4039 9.75396L16 14.3501L20.5962 9.75382C21.0519 9.29821 21.7905 9.29821 22.2462 9.75382Z" fill="#333332"/>
      </svg>
    </div>
  </div>
`

interface Urls {
  readonly desktop: string
  readonly ios: string
  readonly android: string
}

class ArgentModal {
  public bridgeUrl = "https://login.argent.xyz"
  public mobileUrl = "https://www.argent.xyz/app"
  public type: "overlay" | "window" = "overlay"
  public wcUri?: string

  private overlay?: HTMLDivElement
  private popupWindow?: Window
  private closingTimeout?: NodeJS.Timeout

  public showConnectionModal(wcUri: string) {
    const wcParam = encodeURIComponent(wcUri)
    const href = encodeURIComponent(window.location.href)
    this.showModal({
      desktop: `${this.bridgeUrl}?wc=${wcParam}`,
      ios: `${this.mobileUrl}/wc?uri=${wcParam}&href=${href}`,
      android: `${this.mobileUrl}/wc?uri=${wcParam}&href=${href}`,
    })
  }

  public showApprovalModal(_: RequestArguments): void {
    if (device === "desktop") {
      this.showModal({
        desktop: `${this.bridgeUrl}?action=sign`,
        ios: "",
        android: "",
      })
      return
    }
    const href = encodeURIComponent(window.location.href)
    this.showModal({
      desktop: `${this.bridgeUrl}?action=sign`,
      ios: `${this.mobileUrl}/wc?href=${href}`,
      android: `${this.mobileUrl}/wc?href=${href}`,
    })
  }

  public closeModal(success?: "animateSuccess") {
    if (success) {
      this.overlay
        ?.querySelector("iframe")
        ?.contentWindow?.postMessage("argent-login.success", "*")
      this.popupWindow?.postMessage("argent-login.success", "*")
      this.closingTimeout = setTimeout(this.close, 3400)
    } else {
      this.close()
    }
  }

  private showModal(urls: Urls) {
    clearTimeout(this.closingTimeout)
    if (this.overlay || this.popupWindow) {
      this.close()
    }

    if (device === "android" || device === "ios") {
      window.open(urls[device])
      return
    }
    if (this.type === "window") {
      const features =
        "menubar=no,location=no,resizable=no,scrollbars=no,status=no,width=840,height=540"
      this.popupWindow =
        window.open(urls.desktop, "_blank", features) || undefined
      return
    }

    // type=overlay, device=desktop
    const overlay = document.createElement("div")
    overlay.innerHTML = overlayHtml
    for (const [key, value] of Object.entries(overlayStyle)) {
      overlay.style[key as any] = value
    }
    document.body.appendChild(overlay)
    overlay.addEventListener("click", () => this.closeModal())
    this.overlay = overlay

    const iframe = overlay.querySelector("iframe") as HTMLIFrameElement
    iframe.setAttribute("src", urls.desktop)
    for (const [key, value] of Object.entries(iframeStyle)) {
      iframe.style[key as any] = value
    }

    const closeButton = overlay.querySelector(
      ".argent-close-button",
    ) as HTMLDivElement
    closeButton.addEventListener("click", () => this.closeModal())
  }

  private close = () => {
    this.overlay?.remove()
    this.popupWindow?.close()
    this.overlay = undefined
    this.popupWindow = undefined
  }
}

export const argentModal = new ArgentModal()

import type {
  ConnectMethods,
  StarknetMethods,
  WebWalletMethods,
} from "@argent/x-window"
import { Receiver, Sender, WindowMessenger } from "@argent/x-window"
import { UnsecuredJWT } from "jose"

// these values should reflect the same values as for the embedded iframe
const popupW = 380 + 4 // 4 is the width of the browser's frame
const popupH = 420 + 64 // 64 is the height of the browser's address bar

const popupStyle = (h: number = popupH) => {
  // parent is the window that opened this window; if not detected then it falls back to the current screen
  const parentWidth =
    window?.outerWidth ?? window?.innerWidth ?? window?.screen.width ?? 0
  const parentHeight =
    window?.outerHeight ?? window?.innerHeight ?? window?.screen.height ?? 0
  const parentLeft = window?.screenLeft ?? window?.screenX ?? 0
  const parentTop = window?.screenTop ?? window?.screenY ?? 0

  const y = parentTop + parentHeight / 2 - h / 2
  const x = parentLeft + parentWidth / 2 - popupW / 2

  return `width=${popupW},height=${h},top=${y},left=${x}`
}

const applyModalStyle = (iframe: HTMLIFrameElement) => {
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

export const setIframeHeight = (modal: HTMLIFrameElement, height: number) => {
  modal.style.height = `min(${height || 420}px, 100%)`
}

const setImmediate = (fn) => setTimeout(fn, 0)

export const createModal = async (targetUrl: string, shouldShow: boolean) => {
  // make sure target url has always /iframes/comms as the path
  const url = new URL(targetUrl)
  url.pathname = "/iframes/comms"
  targetUrl = url.toString()

  const iframe = document.createElement("iframe")
  iframe.src = targetUrl
  ;(iframe as any).loading = "eager"
  iframe.sandbox.add(
    "allow-scripts",
    "allow-same-origin",
    "allow-forms",
    "allow-top-navigation",
    "allow-popups",
  )
  iframe.allow = "clipboard-write"

  const modal = applyModalStyle(iframe)
  modal.style.display = shouldShow ? "block" : "none"

  // append the modal to the body
  window.document.body.appendChild(modal)

  // wait for the iframe to load
  await new Promise<void>((resolve, reject) => {
    const pid = setTimeout(
      () => reject(new Error("Timeout while loading an iframe")),
      20000,
    )

    iframe.addEventListener("load", async () => {
      clearTimeout(pid)
      resolve()
    })
  })

  return { iframe, modal }
}

export const getConnection = async (
  {
    popup,
    iframe,
    modal,
  }: {
    popup?: Window
    iframe?: HTMLIFrameElement
    modal?: HTMLDivElement
  },
  origin?: string,
) => {
  if (iframe) {
    const postMessenger = new WindowMessenger(iframe.contentWindow, {
      post: "*",
    })
    const listenMessenger = new WindowMessenger(window, { listen: "*" })

    const sender = new Sender<StarknetMethods>(postMessenger, listenMessenger)
    const receiver = new Receiver<WebWalletMethods>(
      listenMessenger,
      {
        connect: () => async () => {
          return
        },
        heightChanged: () => async (height) => {
          setIframeHeight(iframe, height)
        },
        shouldHide: () => async () => {
          hideModal(modal)
        },
        shouldShow: () => async () => {
          showModal(modal)
        },
      },
      postMessenger,
    )

    return sender
  }

  // popup
  const postMessenger = new WindowMessenger(popup, { post: "*" })
  const listenMessenger = new WindowMessenger(window, { listen: "*" })

  const sender = new Sender<StarknetMethods>(postMessenger, listenMessenger)
  const receiver = new Receiver<ConnectMethods>(
    listenMessenger,
    {
      connect: () => async () => {
        try {
          await sender.call("enable")
          popup.close()
        } catch (e) {
          console.error(e)
          popup.close()
        }
        return
      },
    },
    postMessenger,
  )

  const senderProxy = new Proxy(sender, {
    get: (target, prop) => {
      if (prop === "call") {
        return async (method: string, ...args: any) => {
          if (method === "execute") {
            const transactions = Array.isArray(args[0]) ? args[0] : [args[0]]

            const unsignedJwt = new UnsecuredJWT({
              transactions,
              abis: args[1],
              transactionDetails: args[2],
            }).encode()

            const promise = await new Promise((resolve, reject) => {
              setImmediate(async () => {
                const executePopup = window.open(
                  `${origin}/review?transactions=${unsignedJwt}`,
                  undefined,
                  `${popupStyle(
                    580,
                  )},toolbar=no,menubar=no,scrollbars=no,location=no,status=no,popup=1`,
                )

                const postMessenger = new WindowMessenger(executePopup, {
                  post: "*",
                })
                const listenMessenger = new WindowMessenger(window, {
                  listen: "*",
                })

                const executeSender = new Sender<
                  Pick<StarknetMethods, "execute">
                >(postMessenger, listenMessenger)
                const receiver = new Receiver<ConnectMethods>(
                  listenMessenger,
                  {
                    connect: () => async () => {
                      try {
                        await new Promise((resolve) => {
                          setTimeout(() => {
                            resolve("")
                          }, 2000)
                        })

                        executeSender
                          .call("execute", args[0], args[1], args[2])
                          .then((res) => {
                            executePopup.close()
                            resolve(res)
                          })
                          .catch((err) => {
                            executePopup.close()
                            reject(err)
                          })
                      } catch (e) {
                        console.error(e)
                      }
                      return
                    },
                  },
                  postMessenger,
                )
              })
            })
            return promise
          }

          if (method === "signMessage") {
            const unsignedJwt = new UnsecuredJWT({
              typedData: args[0],
            }).encode()

            const promise = await new Promise((resolve, reject) => {
              setImmediate(async () => {
                const signMessagePopup = window.open(
                  `${origin}/signMessage?typedData=${unsignedJwt}`,
                  undefined,
                  `${popupStyle()},toolbar=no,menubar=no,scrollbars=no,location=no,status=no,popup=1`,
                )

                const postMessenger = new WindowMessenger(signMessagePopup, {
                  post: "*",
                })
                const listenMessenger = new WindowMessenger(window, {
                  listen: "*",
                })

                const signMessageSender = new Sender<
                  Pick<StarknetMethods, "signMessage">
                >(postMessenger, listenMessenger)

                const receiver = new Receiver<ConnectMethods>(
                  listenMessenger,
                  {
                    connect: () => async () => {
                      try {
                        await new Promise((resolve) => {
                          setTimeout(() => {
                            resolve("")
                          }, 2000)
                        })

                        signMessageSender
                          .call("signMessage", args[0])
                          .then((res) => {
                            signMessagePopup.close()
                            resolve(res)
                          })
                          .catch((err) => {
                            signMessagePopup.close()
                            reject(err)
                          })
                      } catch (e) {
                        console.error(e)
                      }
                      return
                    },
                  },
                  postMessenger,
                )
              })
            })
            return promise
          }

          const promise = await new Promise((resolve, reject) => {
            sender
              .call("enable")
              .then((res) => {
                resolve(res)
              })
              .catch((err) => {
                popup.close()
                reject(err)
              })
          })
          return promise
        }
      }

      return target[prop]
    },
  })

  return senderProxy
}

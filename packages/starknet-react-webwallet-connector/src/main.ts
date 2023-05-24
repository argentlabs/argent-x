import type { ConnectMethods } from "@argent/x-window"
import type { Connector, EventHandler } from "@starknet-react/core"
import type { StarknetWindowObject } from "get-starknet-core"
import type { AccountInterface } from "starknet"

const DEFAULT_WEBWALLET_URL = "https://web.argent.xyz"

let _wallet: StarknetWindowObject | null = null
let popup: Window | null

class ConnectorNotConnectedError extends Error {
  name = "ConnectorNotConnectedError"
  message = "Connector not connected"
}

class ConnectorNotFoundError extends Error {
  name = "ConnectorNotFoundError"
  message = "Connector not found"
}

class UserRejectedRequestError extends Error {
  name = "UserRejectedRequestError"
  message = "User rejected request"
}

class UserNotConnectedError extends Error {
  name = "UserNotConnectedError"
  message = "User not connected"
}

interface WebWalletConnectorOptions {
  url?: string
}

async function openPopup(origin: string): Promise<StarknetWindowObject> {
  const [h, w] = [562, 886]
  const {
    outerWidth,
    innerWidth,
    outerHeight,
    innerHeight,
    screenLeft,
    screenX,
    screenTop,
    screenY,
    screen,
  } = window ?? {}

  const parentWidth = outerWidth || innerWidth || screen.width || 0
  const parentHeight = outerHeight || innerHeight || screen.height || 0
  const parentLeft = screenLeft || screenX || 0
  const parentTop = screenTop || screenY || 0

  const x = parentLeft + (parentWidth - w) / 2
  const y = parentTop + (parentHeight - h) / 2

  const { getWebWalletStarknetObject } = await import("@argent/web-sdk")
  return await new Promise((resolve) => {
    import("@argent/x-window").then(async ({ WindowMessenger, Receiver }) => {
      const listenMessenger = new WindowMessenger(window, { listen: "*" })

      popup = window.open(
        `${origin}/interstitialLogin`,
        undefined,
        `width=${w},height=${h},top=${y},left=${x},toolbar=no,menubar=no,scrollbars=no,location=no,status=no,popup=1`,
      )

      const conn = await getWebWalletStarknetObject(origin, popup)
      const status = await Promise.race([
        conn.getLoginStatus(),
        new Promise<{ isLoggedIn: false }>((res) =>
          setTimeout(() => {
            res({ isLoggedIn: false })
          }, 1000),
        ),
      ])

      if (status.isLoggedIn && status.hasSession) {
        if (popup && !popup.closed) {
          popup.close()
        }
        return resolve(conn)
      }

      const receiver = new Receiver<ConnectMethods>(listenMessenger, {
        connect: () => async () => {
          const starknetWindowObject = await getWebWalletStarknetObject(
            origin,
            popup,
          )

          resolve(starknetWindowObject)
        },
      })
    })
  })
}

export class WebWalletConnector
  implements Connector<WebWalletConnectorOptions>
{
  private _wallet: StarknetWindowObject | null = null

  constructor(public readonly options: WebWalletConnectorOptions = {}) {}

  available(): boolean {
    return true
  }

  async ready(): Promise<boolean> {
    if (!_wallet) {
      this._wallet = null
      return false
    }

    this._wallet = _wallet
    return this._wallet.isPreauthorized()
  }

  id(): string {
    this._wallet = _wallet
    return this._wallet?.id || "argentWebWallet"
  }

  name(): string {
    this._wallet = _wallet
    return this._wallet?.name || "Argent Web Wallet"
  }

  async connect(): Promise<AccountInterface> {
    await this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    try {
      await this._wallet.enable()
    } catch {
      // NOTE: Argent v3.0.0 swallows the `.enable` call on reject, so this won't get hit.
      throw new UserRejectedRequestError()
    }

    if (!this._wallet.isConnected) {
      throw new UserRejectedRequestError()
    }

    return this._wallet.account as unknown as AccountInterface
  }

  async disconnect(): Promise<void> {
    _wallet = null
    popup = null
    this._wallet = _wallet

    if (!this.available() && !this._wallet) {
      throw new ConnectorNotFoundError()
    }

    if (!this._wallet?.isConnected) {
      throw new UserNotConnectedError()
    }
  }

  async account(): Promise<AccountInterface | null> {
    this._wallet = _wallet
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    if (!this._wallet.account) {
      return null
    }

    return this._wallet.account as unknown as AccountInterface
  }

  async initEventListener(accountChangeCb: EventHandler) {
    this._wallet = _wallet
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    this._wallet.on("accountsChanged", accountChangeCb)
  }

  async removeEventListener(accountChangeCb: EventHandler) {
    this._wallet = _wallet
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    this._wallet.off("accountsChanged", accountChangeCb)

    _wallet = null
    this._wallet = null
  }

  private async ensureWallet(): Promise<void> {
    const wallet = await openPopup(this.options.url || DEFAULT_WEBWALLET_URL)
    _wallet = wallet ?? null
    this._wallet = _wallet
  }
}

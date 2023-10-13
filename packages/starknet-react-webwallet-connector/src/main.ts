import { Connector } from "@starknet-react/core"
import type {
  StarknetWindowObject,
  AccountChangeEventHandler,
} from "get-starknet-core"
import type { AccountInterface } from "starknet"

const DEFAULT_WEBWALLET_URL = "https://web.argent.xyz"

let _wallet: StarknetWindowObject | null = null

const webwalletIcon = `<svg
width="32"
height="28"
viewBox="0 0 18 14"
fill="none"
xmlns="http://www.w3.org/2000/svg"
>
<path
  fill-rule="evenodd"
  clip-rule="evenodd"
  d="M1.5 0.4375C0.982233 0.4375 0.5625 0.857233 0.5625 1.375V12C0.5625 12.4144 0.72712 12.8118 1.02015 13.1049C1.31317 13.3979 1.7106 13.5625 2.125 13.5625H15.875C16.2894 13.5625 16.6868 13.3979 16.9799 13.1049C17.2729 12.8118 17.4375 12.4144 17.4375 12V1.375C17.4375 0.857233 17.0178 0.4375 16.5 0.4375H1.5ZM2.4375 3.50616V11.6875H15.5625V3.50616L9.63349 8.94108C9.27507 9.26964 8.72493 9.26964 8.36651 8.94108L2.4375 3.50616ZM14.0899 2.3125H3.91013L9 6.97822L14.0899 2.3125Z"
  fill="currentColor"
/>
</svg>`

type ConnectorIcons = {
  /** Dark-mode icon. */
  dark?: string
  /** Light-mode icon. */
  light?: string
}

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
  const { getWebWalletStarknetObject, trpcProxyClient } = await import(
    "@argent/web-sdk"
  )
  return await new Promise((resolve) => {
    import("@argent/x-window").then(async () => {
      const connection = await getWebWalletStarknetObject(
        origin,
        trpcProxyClient({ origin }),
      )

      return resolve(connection)
    })
  })
}

export class WebWalletConnector extends Connector {
  private _wallet: StarknetWindowObject | null = null
  private _options: WebWalletConnectorOptions

  constructor(options: WebWalletConnectorOptions = {}) {
    super()
    this._options = options
  }

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

  get id(): string {
    this._wallet = _wallet
    return this._wallet?.id || "argentWebWallet"
  }

  get name(): string {
    this._wallet = _wallet
    return this._wallet?.name || "Argent Web Wallet"
  }

  get icon(): ConnectorIcons {
    return {
      dark: webwalletIcon,
      light: webwalletIcon,
    }
  }

  async connect(): Promise<AccountInterface> {
    await this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    try {
      await this._wallet.enable({ starknetVersion: "v4" })
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

  async initEventListener(accountChangeCb: AccountChangeEventHandler) {
    this._wallet = _wallet
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    this._wallet.on("accountsChanged", accountChangeCb)
  }

  async removeEventListener(accountChangeCb: AccountChangeEventHandler) {
    this._wallet = _wallet
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    this._wallet.off("accountsChanged", accountChangeCb)

    _wallet = null
    this._wallet = null
  }

  private async ensureWallet(): Promise<void> {
    const wallet = await openPopup(this._options.url || DEFAULT_WEBWALLET_URL)
    _wallet = wallet ?? null
    this._wallet = _wallet
  }
}

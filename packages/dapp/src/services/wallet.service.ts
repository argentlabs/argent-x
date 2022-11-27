import { StarknetWindowObject, connect } from "@argent/get-starknet"
import { ProviderInterface, shortString } from "starknet"

export let windowStarknet: StarknetWindowObject | null = null

export const silentConnectWallet = async () => {
  const _windowStarknet = await connect({ modalMode: "neverAsk" })
  windowStarknet = _windowStarknet
  return windowStarknet ?? undefined
}

export const connectWallet = async (enableWebWallet: boolean) => {
  const _windowStarknet = await connect({
    exclude: enableWebWallet ? [] : ["argentWebWallet"],
  })
  windowStarknet = _windowStarknet
  return windowStarknet ?? undefined
}

export const walletAddress = async (): Promise<string | undefined> => {
  if (!windowStarknet?.isConnected) {
    return
  }
  return windowStarknet.selectedAddress
}

export const addToken = async (address: string): Promise<void> => {
  if (!windowStarknet?.isConnected) {
    throw Error("starknet wallet not connected")
  }
  await windowStarknet.request({
    type: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address,
      },
    },
  })
}

export const chainId = (provider?: ProviderInterface): string | undefined => {
  try {
    if (!provider) {
      throw Error("no provider")
    }
    return shortString.decodeShortString(provider.chainId)
  } catch {}
}

export const signMessage = async (message: string) => {
  if (!windowStarknet?.isConnected) throw Error("starknet wallet not connected")
  if (!shortString.isShortString(message)) {
    throw Error("message must be a short string")
  }

  return windowStarknet.account.signMessage({
    domain: {
      name: "Example DApp",
      chainId: windowStarknet.chainId,
      version: "0.0.1",
    },
    types: {
      StarkNetDomain: [
        { name: "name", type: "felt" },
        { name: "chainId", type: "felt" },
        { name: "version", type: "felt" },
      ],
      Message: [{ name: "message", type: "felt" }],
    },
    primaryType: "Message",
    message: {
      message,
    },
  })
}

export const waitForTransaction = async (hash: string) => {
  if (!windowStarknet?.isConnected) {
    return
  }
  return windowStarknet.provider.waitForTransaction(hash)
}

export const addWalletChangeListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  if (!windowStarknet?.isConnected) {
    return
  }
  windowStarknet.on("accountsChanged", handleEvent)
}

export const removeWalletChangeListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  if (!windowStarknet?.isConnected) {
    return
  }
  windowStarknet.off("accountsChanged", handleEvent)
}

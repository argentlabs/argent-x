import { connect } from "@argent/get-starknet"
import { ProviderInterface, constants, shortString } from "starknet"

export const silentConnectWallet = async () => {
  const windowStarknet = connect({ modalMode: "neverAsk" })
  return windowStarknet ?? undefined
}

export const connectWallet = async () => {
  const windowStarknet = await connect()
  return windowStarknet ?? undefined
}

export const walletAddress = async (): Promise<string | undefined> => {
  const starknet = await connect({ modalMode: "neverAsk" })
  if (!starknet?.isConnected) {
    return
  }
  return starknet.selectedAddress
}

export const addToken = async (address: string): Promise<void> => {
  const starknet = await connect({ modalMode: "neverAsk" })
  if (!starknet?.isConnected) {
    throw Error("starknet wallet not connected")
  }
  await starknet.request({
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
  const starknet = await connect({ modalMode: "neverAsk" })
  if (!starknet?.isConnected) throw Error("starknet wallet not connected")
  if (!shortString.isShortString(message)) {
    throw Error("message must be a short string")
  }

  return starknet.account.signMessage({
    domain: {
      name: "Example DApp",
      chainId: starknet.chainId,
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
  const starknet = await connect({ modalMode: "neverAsk" })
  if (!starknet?.isConnected) {
    return
  }
  return starknet.provider.waitForTransaction(hash)
}

export const addWalletChangeListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  const starknet = await connect({ modalMode: "neverAsk" })
  if (!starknet?.isConnected) {
    return
  }
  starknet.on("accountsChanged", handleEvent)
}

export const removeWalletChangeListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  const starknet = await connect({ modalMode: "neverAsk" })
  if (!starknet?.isConnected) {
    return
  }
  starknet.off("accountsChanged", handleEvent)
}

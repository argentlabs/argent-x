import { connect, getStarknet } from "@argent/get-starknet"
import { shortString } from "starknet"

import { Network } from "./token.service"

export const silentConnectWallet = async () => {
  const windowStarknetRef = await connect({ showList: false })
  await windowStarknetRef?.enable()
  return windowStarknetRef
}

export const connectWallet = async () => {
  const windowStarknetRef = await connect({
    include: ["argentX"],
  })
  await windowStarknetRef?.enable()
  return windowStarknetRef
}

export const walletAddress = async (): Promise<string | undefined> => {
  const starknet = getStarknet()
  if (!starknet || starknet.isConnected === false) {
    return
  }
  return starknet.selectedAddress
}

export const networkId = (): Network | undefined => {
  const starknet = getStarknet()
  if (!starknet || starknet.isConnected === false) {
    return
  }
  try {
    const { baseUrl } = starknet.provider
    if (baseUrl.includes("alpha-mainnet.starknet.io")) {
      return "mainnet-alpha"
    } else if (baseUrl.includes("alpha4.starknet.io")) {
      return "goerli-alpha"
    } else if (baseUrl.match(/^https?:\/\/localhost.*/)) {
      return "localhost"
    }
  } catch {}
}

export const addToken = async (address: string): Promise<void> => {
  const starknet = getStarknet()
  if (!starknet || starknet.isConnected === false) {
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

export const getExplorerBaseUrl = (): string | undefined => {
  const network = networkId()
  if (network === "mainnet-alpha") {
    return "https://voyager.online"
  } else if (network === "goerli-alpha") {
    return "https://goerli.voyager.online"
  }
}

export const networkUrl = (): string | undefined => {
  const starknet = getStarknet()
  if (!starknet || starknet.isConnected === false) {
    return
  }
  try {
    return starknet.provider.baseUrl
  } catch {}
}

export const signMessage = async (message: string) => {
  const starknet = getStarknet()
  if (!starknet || starknet.isConnected === false)
    throw Error("starknet wallet not connected")
  if (!shortString.isShortString(message)) {
    throw Error("message must be a short string")
  }

  return starknet.account.signMessage({
    domain: {
      name: "Example DApp",
      chainId: networkId() === "mainnet-alpha" ? "SN_MAIN" : "SN_GOERLI",
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
  const starknet = getStarknet()
  if (!starknet || starknet.isConnected === false) {
    return
  }
  return starknet.provider.waitForTransaction(hash)
}

export const addWalletChangeListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  const starknet = getStarknet()
  if (!starknet || starknet.isConnected === false) {
    return
  }
  starknet.on?.("accountsChanged", handleEvent)
}

export const removeWalletChangeListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  const starknet = getStarknet()
  if (!starknet || starknet.isConnected === false) {
    return
  }
  starknet.off?.("accountsChanged", handleEvent)
}

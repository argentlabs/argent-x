import { getStarknet } from "@argent/get-starknet"

import { erc20TokenAddressByNetwork } from "./token.service"

export const isWalletConnected = (): boolean => !!getStarknet()?.isConnected

export const connectWallet = async () =>
  await getStarknet({ showModal: true }).enable()

export const walletAddress = async (): Promise<string | undefined> => {
  try {
    const [address] = await getStarknet().enable()
    return address
  } catch {}
}

export const networkId = (): keyof typeof erc20TokenAddressByNetwork => {
  try {
    const baseUrl = getStarknet().provider.baseUrl
    if (baseUrl.includes("alpha-mainnet.starknet.io")) {
      return "mainnet-alpha"
    } else {
      return "goerli-alpha"
    }
  } catch {
    return "goerli-alpha"
  }
}

export const getExplorerUrlBase = (): string => {
  if (networkId() === "mainnet-alpha") {
    return "https://voyager.online"
  } else {
    return "https://goerli.voyager.online"
  }
}

export const networkUrl = (): string | undefined => {
  try {
    return getStarknet().provider.baseUrl
  } catch {}
}

export const waitForTransaction = async (hash: string) =>
  await getStarknet().provider.waitForTx(hash)

export const addWalletChangeListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  getStarknet().on("accountsChanged", handleEvent)
}

import { getStarknet } from "@argent/get-starknet"

export const isWalletConnected = (): boolean => !!getStarknet()?.isConnected

export const connectWallet = async () =>
  await getStarknet({ showModal: true }).enable()

export const walletAddress = async (): Promise<string | undefined> => {
  try {
    const [address] = await getStarknet().enable()
    return address
  } catch {}
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

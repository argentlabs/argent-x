import * as starknet from "starknet"
import { getStarknet } from "../../get-starknet/"

export const isWalletConnected = (): boolean => !!getStarknet()?.isConnected

export const connectWallet = async () =>
  await getStarknet({ showModal: true })?.enable()

export const walletAddress = async (): Promise<string | undefined> => {
  try {
    const [address] = await getStarknet().enable()
    return address
  } catch {}
}

export const waitForTransaction = async (hash: string) =>
  await starknet.defaultProvider.waitForTx(hash)

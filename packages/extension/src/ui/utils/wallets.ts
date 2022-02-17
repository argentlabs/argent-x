import { localNetworkUrl } from "../../shared/networks"
import { useAppState } from "../states/app"
import { Wallet } from "../Wallet"
import { startSession } from "./messaging"

export const deployWallet = async (
  networkId: string,
  localhostPort: number,
  password?: string,
) => {
  useAppState.setState({ isLoading: true })

  if (password) {
    await startSession(password)
  }

  const network = localNetworkUrl(networkId, localhostPort)
  try {
    const wallet = await Wallet.fromDeploy(network)
    useAppState.setState({ backupNeedsDownload: "force" })
    return wallet
  } finally {
    useAppState.setState({ isLoading: false })
  }
}

const argentColorsArray = [
  "02BBA8",
  "29C5FF",
  "0078A4",
  "FFBF3D",
  "FFA85C",
  "FF875B",
  "FF675C",
  "FF5C72",
]

export const getAccountColor = (accountNumber: number, withPrefix = true) =>
  `${withPrefix ? "#" : ""}${
    argentColorsArray[(accountNumber % (argentColorsArray.length - 1)) + 1]
  }`

export const getAccountImageUrl = (accountNumber: number) =>
  `https://eu.ui-avatars.com/api?name=Account+${accountNumber}&background=${getAccountColor(
    accountNumber,
    false,
  )}&color=fff`

export const getAccountName = (accountNumber: number) =>
  `Account ${accountNumber}`

export const isWalletDeployed = (wallet: Wallet): boolean =>
  !wallet.deployTransaction

export type WalletStatusCode = "CONNECTED" | "DEFAULT" | "DEPLOYING" | "ERROR"

export interface WalletStatus {
  code: WalletStatusCode
  text: string
}

export const getStatus = (
  wallet: Wallet,
  activeWalletAddress?: string,
  forceDeployed = false,
): WalletStatus => {
  if (!isWalletDeployed(wallet) && !forceDeployed) {
    return { code: "DEPLOYING", text: "Deploying..." }
  } else if (activeWalletAddress === wallet.address) {
    return { code: "CONNECTED", text: "Active" }
  } else {
    return { code: "DEFAULT", text: "" }
  }
}

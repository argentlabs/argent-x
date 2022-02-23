import { ethers } from "ethers"

import { sendMessage } from "../../shared/messages"
import { localNetworkUrl } from "../../shared/networks"
import { useAppState } from "../states/app"
import { useBackupDownload } from "../states/backupDownload"
import { useLocalhostPort } from "../states/localhostPort"
import { Wallet } from "../Wallet"
import { startSession } from "./messaging"

export const deployAccount = async (
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
    useBackupDownload.setState({ isBackupDownloadRequired: true })
    return wallet
  } finally {
    useAppState.setState({ isLoading: false })
  }
}

export const connectAccount = async (
  account: Wallet,
  switcherNetworkId: string,
  localhostPort: number,
) => {
  sendMessage({
    type: "WALLET_CONNECTED",
    data: {
      address: account.address,
      network: localNetworkUrl(switcherNetworkId, localhostPort),
    },
  })
  try {
    const { hostname, port } = new URL(account.networkId)
    if (hostname === "localhost") {
      useLocalhostPort.setState({ localhostPort: parseInt(port) })
    }
  } catch {
    // pass
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

export const getColor = (name: string, isHex = false) => {
  const hash = (isHex ? name : ethers.utils.id(name)).slice(-2)
  const index = parseInt(hash, 16) % argentColorsArray.length
  return argentColorsArray[index]
}

export const getAccountImageUrl = (name: string, address: string) => {
  const color = getColor(address, true)
  return `https://eu.ui-avatars.com/api?name=${name}&background=${color}&color=fff`
}

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

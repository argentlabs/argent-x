import { ethers } from "ethers"

import { sendMessage } from "../../shared/messages"
import { localNetworkUrl } from "../../shared/networks"
import { Account } from "../Account"
import { useAppState } from "../states/app"
import { useBackupDownload } from "../states/backupDownload"
import { useLocalhostPort } from "../states/localhostPort"
import { startSession } from "./messaging"
import { LedgerSigner, StarkSignerType } from "../../shared/starkSigner"

export const deployAccount = async (
  networkId: string,
  localhostPort: number,
  signerType: StarkSignerType,
  password?: string,
) => {
  useAppState.setState({ isLoading: true })

  if (password) {
    await startSession(password)
  }

  const network = localNetworkUrl(networkId, localhostPort)
  try {
    
    // trick to have permission handler
    if (signerType === StarkSignerType.Ledger) {
      await LedgerSigner.askPermissionIfNeeded()
    }

    const account = await Account.fromDeploy(network, signerType)
    useBackupDownload.setState({ isBackupDownloadRequired: true })
    return account
  } finally {
    useAppState.setState({ isLoading: false })
  }
}

export const connectAccount = (
  account: Account,
  switcherNetworkId: string,
  localhostPort: number,
) => {
  sendMessage({
    type: "CONNECT_ACCOUNT",
    data: {
      address: account.address,
      network: localNetworkUrl(switcherNetworkId, localhostPort),
      signer: account.signer,
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

export const isAccountDeployed = (account: Account): boolean =>
  !account.deployTransaction

export type AccountStatusCode = "CONNECTED" | "DEFAULT" | "DEPLOYING" | "ERROR"

export interface AccountStatus {
  code: AccountStatusCode
  text: string
}

export const getStatus = (
  account: Account,
  activeAccountAddress?: string,
  forceDeployed = false,
): AccountStatus => {
  if (!isAccountDeployed(account) && !forceDeployed) {
    return { code: "DEPLOYING", text: "Deploying..." }
  }
  if (activeAccountAddress === account.address) {
    return { code: "CONNECTED", text: "Active" }
  }
  return { code: "DEFAULT", text: "" }
}

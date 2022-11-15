import { ethers } from "ethers"
import { number } from "starknet"
import { toBN } from "starknet/dist/utils/number"

import { waitForMessage } from "../../../shared/messages"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/wallet.service"
import { connectAccount } from "../../services/backgroundAccounts"
import { startSession } from "../../services/backgroundSessions"
import { Account } from "./Account"

export const createAccount = async (networkId: string, password?: string) => {
  if (password) {
    await startSession(password)
  }

  return Account.create(networkId)
}

export const selectAccount = async (account?: BaseWalletAccount) => {
  if (!account) {
    return
  }

  connectAccount(account)
  return await waitForMessage("CONNECT_ACCOUNT_RES")
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

export const getColor = (name: string) => {
  const hash = ethers.utils.id(name).slice(-2)
  const index = parseInt(hash, 16) % argentColorsArray.length
  return argentColorsArray[index]
}

export const getAccountImageUrl = (
  accountName: string,
  account: BaseWalletAccount,
) => {
  return getNetworkAccountImageUrl({
    accountName,
    networkId: account.networkId,
    accountAddress: account.address,
  })
}

export const stripAddressZeroPadding = (accountAddress: string) => {
  return number.toHex(toBN(number.hexToDecimalString(accountAddress)))
}

export const getNetworkAccountImageUrl = ({
  accountName,
  networkId,
  accountAddress,
  backgroundColor,
}: {
  accountName: string
  networkId: string
  accountAddress: string
  backgroundColor?: string
}) => {
  const unpaddedAddress = stripAddressZeroPadding(accountAddress)
  const accountIdentifier = `${networkId}::${unpaddedAddress}`
  const color = backgroundColor || getColor(accountIdentifier)
  return `https://eu.ui-avatars.com/api?name=${accountName}&background=${color}&color=fff`
}

const isAccountDeployed = (account: Account): boolean =>
  !account.deployTransaction

export type AccountStatusCode = "CONNECTED" | "DEFAULT" | "DEPLOYING" | "ERROR"

export interface AccountStatus {
  code: AccountStatusCode
  text: string
}

export const getStatus = (
  account: Account,
  activeAccount?: BaseWalletAccount,
  forceDeployed = false,
): AccountStatus => {
  if (!isAccountDeployed(account) && !forceDeployed) {
    return { code: "DEPLOYING", text: "Deploying..." }
  }
  if (activeAccount && accountsEqual(account, activeAccount)) {
    return { code: "CONNECTED", text: "Active" }
  }
  return { code: "DEFAULT", text: "" }
}

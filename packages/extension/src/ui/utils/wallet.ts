import type { Wallet } from "../Wallet"

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

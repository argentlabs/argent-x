import { ethers } from "ethers"
import { number } from "starknet"
import useSWR from "swr"

import { updateAccountDetails } from "../../../shared/account/update"
import { generateAvatarImage } from "../../../shared/avatarImage"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { accountsEqual } from "../../../shared/wallet.service"
import { startSession } from "../../services/backgroundSessions"
import { withPolling } from "../../services/swr"
import { Account } from "./Account"
import { useAccounts } from "./accounts.state"

const { toBN } = number

export const createAccount = async (networkId: string, password?: string) => {
  if (password) {
    await startSession(password)
  }

  return Account.create(networkId)
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
  try {
    return number.toHex(toBN(number.hexToDecimalString(accountAddress)))
  } catch {
    // ignore parsing errors
  }
  return ""
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
  const background = backgroundColor || getColor(accountIdentifier)
  return generateAvatarImage(accountName, { background })
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

/** periodically check ALL accounts for escape+guardian status so we can alert user to relevant changes */

export const useUpdateAccountsOnChainEscapeState = () => {
  const allAccounts = useAccounts({ showHidden: true, allNetworks: true })
  return useSWR(
    "useUpdateAccountsOnChainEscapeState",
    async () => {
      await updateAccountDetails("guardian", allAccounts)
    },
    {
      ...withPolling(
        60 * 1000,
      ) /** 60 seconds, or will refresh next time extension is opened */,
    },
  )
}

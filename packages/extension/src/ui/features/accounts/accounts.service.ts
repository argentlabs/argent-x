/**
 * All of this file should probably go into the data model for accounts, either as a field which gets updated from a worker, or as a computed field, if we have such a concept.
 */
import useSWR from "swr"

import { generateAvatarImage, id } from "@argent/x-shared"
import { updateAccountDetails } from "../../../shared/account/update"
import { RefreshIntervalInSeconds } from "../../../shared/config"
import type { AccountId, BaseWalletAccount } from "../../../shared/wallet.model"
import { withPolling } from "../../services/swr.service"
import { allAccountsView } from "../../views/account"
import { useView } from "../../views/implementation/react"

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

export const getColor = (name: string = "") => {
  const hash = id(name).slice(-2)
  const index = parseInt(hash, 16) % argentColorsArray.length
  return argentColorsArray[index]
}

export const getAccountImageUrl = (
  accountName: string,
  account: BaseWalletAccount,
) => {
  return getNetworkAccountImageUrl({
    accountName,
    accountId: account.id,
  })
}

interface GetNetworkAccountImageUrlProps {
  accountName: string
  accountId: AccountId
  backgroundColor?: string
}

export const getNetworkAccountImageUrl = ({
  accountName,
  accountId,
  backgroundColor,
}: GetNetworkAccountImageUrlProps) => {
  const background = backgroundColor || getColor(accountId)
  return generateAvatarImage(accountName, { background })
}

interface GetNetworkOwnerImageUrlProps {
  accountName: string
  publicKey: string
  networkId: string
  backgroundColor?: string
}

export const getNetworkOwnerImageUrl = ({
  accountName,
  publicKey,
  networkId,
  backgroundColor,
}: GetNetworkOwnerImageUrlProps) => {
  const background = backgroundColor || getColor(`${publicKey}::${networkId}`)
  return generateAvatarImage(accountName, { background })
}

/** periodically check ALL accounts for escape+guardian status so we can alert user to relevant changes */

export const useUpdateAccountsOnChainEscapeState = () => {
  const allAccounts = useView(allAccountsView)
  return useSWR(
    "useUpdateAccountsOnChainEscapeState",
    async () => {
      await updateAccountDetails("guardian", allAccounts)
    },
    {
      ...withPolling(
        RefreshIntervalInSeconds.SLOW * 1000,
      ) /** 5 minutes, or will refresh next time extension is opened */,
    },
  )
}

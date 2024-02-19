import { type Address, includesAddress } from "@argent/shared"

import type { Activity } from "../schema"

interface ParseFinanceActivitiesProps {
  activities: Activity[]
  accountAddressesOnNetwork: Address[]
  tokenAddressesOnNetwork: Address[]
  nftAddressesOnNetwork: Address[]
}

interface ParseFinanceActivitiesResult {
  tokenActivity: {
    accountAddresses: Address[]
    tokenAddresses: Address[]
  }
  nftActivity: {
    accountAddresses: Address[]
    tokenAddresses: Address[]
  }
}

/**
 * Parses finance-related activities from the provided list of activities, grouping addresses
 * into tokens and NFTs,
 *
 * @param activities: Array of activities to be analyzed.
 * @param accountAddressesOnNetwork: Array of account addresses known to be active on the network.
 * @param tokenAddressesOnNetwork: Array of token addresses known to exist on the network.
 * @param nftAddressesOnNetwork: Array of NFT addresses known to exist on the network.
 * @returns {ParseFinanceActivitiesResult} An object containing two nested objects, one for tokens and one for NFTs,
 * each with corresponding arrays for account addresses and token addresses.
 */

export function parseFinanceActivities({
  activities,
  accountAddressesOnNetwork,
  tokenAddressesOnNetwork,
  nftAddressesOnNetwork,
}: ParseFinanceActivitiesProps) {
  const result: ParseFinanceActivitiesResult = {
    tokenActivity: {
      accountAddresses: [],
      tokenAddresses: [],
    },
    nftActivity: {
      accountAddresses: [],
      tokenAddresses: [],
    },
  }

  activities.forEach((activity) => {
    if (activity.group === "finance" && activity.relatedAddresses) {
      const isTokenTransfer = activity.transfers.some(
        (transfer) => transfer.asset.type === "token",
      )
      activity.relatedAddresses.forEach(({ type, address }) => {
        if (type === "token") {
          if (includesAddress(address, tokenAddressesOnNetwork)) {
            if (
              !includesAddress(address, result.tokenActivity.tokenAddresses)
            ) {
              result.tokenActivity.tokenAddresses.push(address)
            }
          }
          if (includesAddress(address, nftAddressesOnNetwork)) {
            if (!includesAddress(address, result.nftActivity.tokenAddresses)) {
              result.nftActivity.tokenAddresses.push(address)
            }
          }
        } else if (type === "wallet") {
          if (includesAddress(address, accountAddressesOnNetwork)) {
            if (isTokenTransfer) {
              if (
                !includesAddress(address, result.tokenActivity.accountAddresses)
              ) {
                result.tokenActivity.accountAddresses.push(address)
              }
            } else {
              if (
                !includesAddress(address, result.nftActivity.accountAddresses)
              ) {
                result.nftActivity.accountAddresses.push(address)
              }
            }
          }
        }
      })
    }
  })

  return result
}

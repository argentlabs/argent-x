import { WalletAccount } from "./../wallet.model"
import { ARGENT_SHIELD_ENABLED } from "../shield/constants"
import { BaseWalletAccount } from "../wallet.model"
import { accountsEqual } from "../wallet.service"
import { getAccountEscapeFromChain } from "./details/getAccountEscapeFromChain"
import { getAccountGuardiansFromChain } from "./details/getAccountGuardiansFromChain"
import { getAccountTypesFromChain } from "./details/getAccountTypesFromChain"
import {
  DetailFetchers,
  getAndMergeAccountDetails,
} from "./details/getAndMergeAccountDetails"
import { addAccounts, getAccounts } from "./store"

type UpdateScope = "all" | "type" | "deploy" | "guardian"

export async function updateAccountDetails(
  scope: UpdateScope,
  accounts?: BaseWalletAccount[],
) {
  const allAccounts = await getAccounts((a) =>
    accounts ? accounts.some((a2) => accountsEqual(a, a2)) : true,
  )

  const accountDetailFetchers: DetailFetchers[] = []
  let newAccounts: WalletAccount[] = []

  // Update deploy status before fetching account details
  if (scope === "deploy" || scope === "all") {
    newAccounts = allAccounts.map((account) => ({
      ...account,
      needsDeploy: false,
    }))
  }

  if (scope === "type" || scope === "all") {
    accountDetailFetchers.push(getAccountTypesFromChain)
  }

  if (ARGENT_SHIELD_ENABLED) {
    if (scope === "guardian" || scope === "all") {
      accountDetailFetchers.push(getAccountGuardiansFromChain)
      accountDetailFetchers.push(getAccountEscapeFromChain)
    }
  }

  const deployedAccounts = allAccounts
    .concat(newAccounts)
    .filter((acc) => !acc.needsDeploy)

  // Only fetch account details for deployed accounts
  const newAccountsWithDetails = await getAndMergeAccountDetails(
    deployedAccounts,
    accountDetailFetchers,
  )

  await addAccounts(newAccountsWithDetails) // handles deduplication and updates
}

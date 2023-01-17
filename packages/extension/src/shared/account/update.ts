import { ARGENT_SHIELD_ENABLED } from "../shield/constants"
import { BaseWalletAccount } from "../wallet.model"
import { accountsEqual } from "../wallet.service"
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

  if (scope === "type" || scope === "all") {
    accountDetailFetchers.push(getAccountTypesFromChain)
  }

  if (ARGENT_SHIELD_ENABLED) {
    if (scope === "guardian" || scope === "all") {
      accountDetailFetchers.push(getAccountGuardiansFromChain)
    }
  }

  let newAccounts = await getAndMergeAccountDetails(
    allAccounts,
    accountDetailFetchers,
  )

  if (scope === "deploy" || scope === "all") {
    const _newAccounts = allAccounts.map((account) => ({
      ...account,
      needsDeploy: false,
    }))

    newAccounts = [..._newAccounts, ...newAccounts]
  }

  await addAccounts(newAccounts) // handles deduplication and updates
}

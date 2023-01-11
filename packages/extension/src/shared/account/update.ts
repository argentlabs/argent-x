import { ARGENT_SHIELD_ENABLED } from "../shield/constants"
import { BaseWalletAccount, WalletAccount } from "../wallet.model"
import { accountsEqual } from "../wallet.service"
import { getAccountTypesFromChain } from "./details/fetchType"
import { getAccountGuardiansFromChain } from "./details/getAccountGuardiansFromChain"
import { addAccounts, getAccounts } from "./store"

type UpdateScope = "all" | "type" | "deploy" | "guardian"

export async function updateAccountDetails(
  scope: UpdateScope,
  accounts?: BaseWalletAccount[],
) {
  const allAccounts = await getAccounts((a) =>
    accounts ? accounts.some((a2) => accountsEqual(a, a2)) : true,
  )

  let newAccounts: WalletAccount[] = []

  if (scope === "type" || scope === "all") {
    newAccounts = await getAccountTypesFromChain(allAccounts)
  }

  if (ARGENT_SHIELD_ENABLED) {
    if (scope === "guardian" || scope === "all") {
      newAccounts = await getAccountGuardiansFromChain(allAccounts)
    }
  }

  if (scope === "deploy" || scope === "all") {
    const _newAccounts = allAccounts.map((account) => ({
      ...account,
      needsDeploy: false,
    }))

    newAccounts = [..._newAccounts, ...newAccounts]
  }

  await addAccounts(newAccounts) // handles deduplication and updates
}

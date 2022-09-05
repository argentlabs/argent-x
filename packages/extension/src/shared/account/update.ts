import { BaseWalletAccount } from "../wallet.model"
import { accountsEqual } from "../wallet.service"
import { getAccountTypesFromChain } from "./details/fetchType"
import { addAccounts, getAccounts } from "./store"

type UpdateScope = "all" | "type"

export async function updateAccountDetails(
  scope: UpdateScope,
  accounts?: BaseWalletAccount[],
) {
  if (scope === "all" || scope === "type") {
    const allAccounts = await getAccounts((a) =>
      accounts ? accounts.some((a2) => accountsEqual(a, a2)) : true,
    )
    const newAccounts = await getAccountTypesFromChain(allAccounts)
    await addAccounts(newAccounts) // handles deduplication and updates
  }
}

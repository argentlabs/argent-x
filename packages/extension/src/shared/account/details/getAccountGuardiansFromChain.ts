import { WalletAccount } from "../../wallet.model"
import { getGuardianForAccount } from "./getGuardian"

/** updates the accounts with current guardian status */
export async function getAccountGuardiansFromChain(
  accounts: WalletAccount[],
): Promise<WalletAccount[]> {
  const guardianResults = await Promise.allSettled(
    accounts.map((account) => {
      return getGuardianForAccount(account)
    }),
  )

  const accountsWithGuardians = accounts.map((account, index) => {
    const guardianResult = guardianResults[index]
    const guardian =
      guardianResult.status === "fulfilled" ? guardianResult.value : undefined
    return {
      ...account,
      guardian,
    }
  })

  return accountsWithGuardians
}

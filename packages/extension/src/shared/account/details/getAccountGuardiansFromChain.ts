import { WalletAccount } from "../../wallet.model"
import { getGuardianForAccount } from "./getGuardian"

export type AccountGuardiansFromChain = Pick<
  WalletAccount,
  "address" | "networkId" | "guardian"
>

/** updates the accounts with current guardian status */
export async function getAccountGuardiansFromChain(
  accounts: WalletAccount[],
): Promise<AccountGuardiansFromChain[]> {
  const guardianResults = await Promise.allSettled(
    accounts.map((account) => {
      return getGuardianForAccount(account)
    }),
  )

  const accountsWithGuardians = accounts.map((account, index) => {
    const guardianResult = guardianResults[index]
    const guardian =
      guardianResult.status === "fulfilled" ? guardianResult.value : undefined
    const { address, networkId } = account
    return {
      address,
      networkId,
      guardian,
    }
  })

  return accountsWithGuardians
}

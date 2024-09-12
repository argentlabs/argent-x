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
    const onChainGuardian =
      guardianResult.status === "fulfilled" ? guardianResult.value : undefined
    const guardian = resolveOnChainGuardianForAcccount(onChainGuardian, account)
    const type = guardian
      ? "smart"
      : account.type === "multisig"
        ? "multisig"
        : "standard"
    const { address, networkId } = account
    return {
      address,
      networkId,
      guardian,
      type,
    }
  })

  return accountsWithGuardians
}

function resolveOnChainGuardianForAcccount(
  onChainGuardian: string | undefined,
  account: WalletAccount,
) {
  // there might be undeployed smart accounts which have a guardian,
  // so don't replace it with onChainGuardian
  if (account.needsDeploy && account.guardian) {
    return account.guardian
  }
  return onChainGuardian
}

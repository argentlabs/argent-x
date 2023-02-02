import { WalletAccount } from "../../wallet.model"
import { getEscapeForAccount } from "./getEscape"

export type AccountEscapeFromChain = Pick<
  WalletAccount,
  "address" | "networkId" | "escape"
>

/** updates the accounts with current escape status */
export async function getAccountEscapeFromChain(
  accounts: WalletAccount[],
): Promise<AccountEscapeFromChain[]> {
  const escapeResults = await Promise.allSettled(
    accounts.map((account) => {
      return getEscapeForAccount(account)
    }),
  )

  const accountsWithEscape = accounts.map((account, index) => {
    const escapeResult = escapeResults[index]
    const escape =
      escapeResult.status === "fulfilled" ? escapeResult.value : undefined
    const { address, networkId } = account
    return {
      address,
      networkId,
      escape,
    }
  })

  return accountsWithEscape
}

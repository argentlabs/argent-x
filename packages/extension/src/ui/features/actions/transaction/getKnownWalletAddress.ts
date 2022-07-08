import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/wallet.service"
import { Account } from "../../accounts/Account"
import { useAccounts } from "../../accounts/accounts.state"

// FIXME: change implementation once address book is complete
export function getKnownWalletAddress(
  account: BaseWalletAccount,
): Account | undefined {
  const knownAccount = useAccounts
    .getState()
    .accounts.find((a) => accountsEqual(account, a))

  return knownAccount
}

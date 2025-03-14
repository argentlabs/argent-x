import type {
  BaseWalletAccount,
  WalletAccount,
} from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/utils/accountsEqual"

// FIXME: change implementation once address book is complete
export function getKnownWalletAddress(
  allAccounts: WalletAccount[],
  account: BaseWalletAccount,
): WalletAccount | undefined {
  const knownAccount = allAccounts.find((knownAccount) =>
    accountsEqual(knownAccount, account),
  )

  return knownAccount
}

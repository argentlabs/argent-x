import { isEmpty } from "lodash-es"
import type { FC } from "react"
import { useMemo } from "react"

import type { PendingMultisig } from "../../../shared/multisig/types"
import type {
  BaseWalletAccount,
  WalletAccount,
} from "../../../shared/wallet.model"
import { AccountListScreenItemContainer } from "../accounts/AccountListScreenItemContainer"
import { multisigIsPending } from "./multisig.state"
import { PendingMultisigListScreenItem } from "./PendingMultisigListScreenItem"
import { sortMultisigAndPendingMultisigAccounts } from "../../../shared/utils/accountsMultisigSort"

export interface MultisigListAccountsProps {
  accounts: WalletAccount[]
  pendingMultisigs: PendingMultisig[]
  selectedAccount?: BaseWalletAccount
  returnTo?: string
}

export const MultisigListAccounts: FC<MultisigListAccountsProps> = ({
  accounts,
  pendingMultisigs,
  selectedAccount,
  returnTo,
}) => {
  const multisigsOrAccounts = useMemo(() => {
    if (pendingMultisigs && !isEmpty(pendingMultisigs)) {
      return sortMultisigAndPendingMultisigAccounts(pendingMultisigs, accounts)
    }
    return accounts
  }, [accounts, pendingMultisigs])

  return (
    <>
      {multisigsOrAccounts.map((multisig) =>
        multisigIsPending(multisig) ? (
          <PendingMultisigListScreenItem
            key={multisig.publicKey}
            pendingMultisig={multisig}
          />
        ) : (
          <AccountListScreenItemContainer
            key={multisig.address}
            account={multisig}
            selectedAccount={selectedAccount}
            returnTo={returnTo}
          />
        ),
      )}
    </>
  )
}

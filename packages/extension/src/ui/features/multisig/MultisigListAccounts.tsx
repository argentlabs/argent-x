import { isEmpty } from "lodash-es"
import { FC, useMemo } from "react"

import { PendingMultisig } from "../../../shared/multisig/types"
import { BaseWalletAccount } from "../../../shared/wallet.model"
import { Account } from "../accounts/Account"
import { AccountListScreenItemContainer } from "../accounts/AccountListScreenItemContainer"
import { multisigIsPending } from "./Multisig"
import { PendingMultisigListScreenItem } from "./PendingMultisigListScreenItem"
import { multisigAndPendingMultisigSort } from "../../../shared/utils/accountsMultisigSort"

export interface MultisigListAccountsProps {
  accounts: Account[]
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
      return multisigAndPendingMultisigSort(pendingMultisigs, accounts)
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

import type { FC } from "react"
import { useMemo } from "react"
import type { PendingMultisig } from "../../../shared/multisig/types"
import type {
  BaseWalletAccount,
  WalletAccount,
} from "../../../shared/wallet.model"
import { isEmpty } from "lodash-es"
import { sortMultisigAndPendingMultisigAccounts } from "../../../shared/utils/accountsMultisigSort"
import { multisigIsPending } from "./multisig.state"
import { PendingMultisigListScreenItem } from "./PendingMultisigListScreenItem"
import { AccountListScreenItemContainer } from "../accounts/AccountListScreenItemContainer"

interface MultisigListScreenItemContainerProps {
  pendingMultisigs?: PendingMultisig[]
  accounts: WalletAccount[]
  selectedAccount?: BaseWalletAccount
  returnTo?: string
}

export const MultisigListScreenItemContainer: FC<
  MultisigListScreenItemContainerProps
> = ({ pendingMultisigs, accounts, selectedAccount, returnTo }) => {
  const multisigsOrAccounts = useMemo(() => {
    if (pendingMultisigs && !isEmpty(pendingMultisigs)) {
      return sortMultisigAndPendingMultisigAccounts(pendingMultisigs, accounts)
    }
    return accounts
  }, [accounts, pendingMultisigs])

  return multisigsOrAccounts.map((multisig) =>
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
  )
}

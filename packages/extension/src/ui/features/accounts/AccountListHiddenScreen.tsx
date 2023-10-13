import { BarBackButton, CellStack, NavigationContainer } from "@argent/ui"
import { FC, ReactEventHandler } from "react"

import { PendingMultisig } from "../../../shared/multisig/types"
import { WalletAccount } from "../../../shared/wallet.model"
import { PendingMultisigListItem } from "../multisig/PendingMultisigListItem"
import { AccountListItem } from "./AccountListItem"

interface AccountListHiddenScreenProps {
  onBack: ReactEventHandler
  accounts: WalletAccount[]
  pendingMultisigAccounts: PendingMultisig[]
  onToggleHiddenAccount: (account: WalletAccount, hidden: boolean) => void
  onToggleHiddenPendingMultisig: (
    pendingMultisig: PendingMultisig,
    hidden: boolean,
  ) => void
}

export const AccountListHiddenScreen: FC<AccountListHiddenScreenProps> = ({
  onBack,
  accounts = [],
  pendingMultisigAccounts = [],
  onToggleHiddenAccount,
  onToggleHiddenPendingMultisig,
}) => {
  return (
    <NavigationContainer
      title="Hidden Accounts"
      leftButton={<BarBackButton onClick={onBack} />}
    >
      <CellStack>
        {accounts.map((account) => (
          <AccountListItem
            key={account.address}
            accountName={account.name}
            accountAddress={account.address}
            networkId={account.networkId}
            hidden={account.hidden ?? false}
            onClick={() => onToggleHiddenAccount(account, !account.hidden)}
          />
        ))}
        {pendingMultisigAccounts.map((pendingMultisig) => (
          <PendingMultisigListItem
            key={pendingMultisig.publicKey}
            accountName={pendingMultisig.name}
            publicKey={pendingMultisig.publicKey}
            networkId={pendingMultisig.networkId}
            hidden={pendingMultisig.hidden ?? false}
            onClick={() =>
              onToggleHiddenPendingMultisig(
                pendingMultisig,
                !pendingMultisig.hidden,
              )
            }
          />
        ))}
      </CellStack>
    </NavigationContainer>
  )
}

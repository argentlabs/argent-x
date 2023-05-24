import { BarBackButton, CellStack, NavigationContainer } from "@argent/ui"
import { FC, ReactEventHandler } from "react"

import { PendingMultisig } from "../../../shared/multisig/types"
import { WalletAccount } from "../../../shared/wallet.model"
import { PendingMultisigListItem } from "../multisig/PendingMultisigListItem"
import { AccountListItem } from "./AccountListItem"

interface AccountListHiddenScreenProps {
  onBack: ReactEventHandler
  hiddenAccounts: WalletAccount[]
  hiddenPendingMultisigAccounts: PendingMultisig[]
  onUnhideAccount: (account: WalletAccount) => void
  onUnhidePendingMultisig: (pendingMultisig: PendingMultisig) => void
}

export const AccountListHiddenScreen: FC<AccountListHiddenScreenProps> = ({
  onBack,
  hiddenAccounts = [],
  hiddenPendingMultisigAccounts = [],
  onUnhideAccount,
  onUnhidePendingMultisig,
}) => {
  return (
    <NavigationContainer
      title={"Hidden Accounts"}
      leftButton={<BarBackButton onClick={onBack} />}
    >
      <CellStack>
        {hiddenAccounts.map((account) => (
          <AccountListItem
            key={account.address}
            accountName={account.name}
            accountAddress={account.address}
            networkId={account.networkId}
            hidden
            onClick={() => onUnhideAccount(account)}
          />
        ))}
        {hiddenPendingMultisigAccounts.map((pendingMultisig) => (
          <PendingMultisigListItem
            key={pendingMultisig.publicKey}
            accountName={pendingMultisig.name}
            publicKey={pendingMultisig.publicKey}
            networkId={pendingMultisig.networkId}
            hidden
            onClick={() => onUnhidePendingMultisig(pendingMultisig)}
          />
        ))}
      </CellStack>
    </NavigationContainer>
  )
}

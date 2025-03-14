import { BarBackButton, CellStack, NavigationContainer } from "@argent/x-ui"
import type { FC, ReactEventHandler } from "react"

import type { PendingMultisig } from "../../../shared/multisig/types"
import type { WalletAccount } from "../../../shared/wallet.model"
import { PendingMultisigListItem } from "../multisig/PendingMultisigListItem"
import { AccountListItem } from "./AccountListItem"
import { getAccountIdentifier } from "../../../shared/utils/accountIdentifier"

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
            key={account.id}
            accountId={account.id}
            accountName={account.name}
            accountAddress={account.address}
            networkId={account.networkId}
            hidden={account.hidden ?? false}
            onClick={() => onToggleHiddenAccount(account, !account.hidden)}
            showRightElements
            isLedger={account.signer.type === "ledger"}
            isSmartAccount={account.type === "smart"}
            avatarMeta={account.avatarMeta}
          />
        ))}
        {pendingMultisigAccounts.map((pendingMultisig) => (
          <PendingMultisigListItem
            key={pendingMultisig.publicKey}
            accountId={getAccountIdentifier(
              pendingMultisig.publicKey,
              pendingMultisig.networkId,
              pendingMultisig.signer,
            )}
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

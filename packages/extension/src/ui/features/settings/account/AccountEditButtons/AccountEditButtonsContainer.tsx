import type { FC } from "react"
import { useIsLedgerSigner } from "../../../ledger/hooks/useIsLedgerSigner"
import { AccountEditButtons } from "./AccountEditButtons"
import { AccountEditButtonsMultisig } from "./AccountEditButtonsMultisig"
import type { WalletAccount } from "../../../../../shared/wallet.model"
import { AccountEditButtonsImported } from "./AccountEditButtonsImported"

interface AccountEditButtonsContainerProps {
  account: WalletAccount
}

export const AccountEditButtonsContainer: FC<
  AccountEditButtonsContainerProps
> = ({ account }) => {
  const isLedger = useIsLedgerSigner(account.id)

  if (account.type === "multisig") {
    return <AccountEditButtonsMultisig account={account} isLedger={isLedger} />
  }

  if (account.type === "imported") {
    return <AccountEditButtonsImported account={account} />
  }

  return <AccountEditButtons account={account} isLedger={isLedger} />
}

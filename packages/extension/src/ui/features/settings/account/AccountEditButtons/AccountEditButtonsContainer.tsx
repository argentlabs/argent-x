import { FC } from "react"
import { useIsLedgerSigner } from "../../../ledger/hooks/useIsLedgerSigner"
import { AccountEditButtons } from "./AccountEditButtons"
import { AccountEditButtonsMultisig } from "./AccountEditButtonsMultisig"
import { WalletAccount } from "../../../../../shared/wallet.model"

interface AccountEditButtonsContainerProps {
  account: WalletAccount
}

export const AccountEditButtonsContainer: FC<
  AccountEditButtonsContainerProps
> = ({ account }) => {
  const isLedger = useIsLedgerSigner(account)

  if (account.type === "multisig") {
    return <AccountEditButtonsMultisig account={account} isLedger={isLedger} />
  }

  return <AccountEditButtons account={account} isLedger={isLedger} />
}

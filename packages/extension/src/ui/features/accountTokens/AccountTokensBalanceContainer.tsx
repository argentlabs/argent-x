import { useEffect, type FC } from "react"

import type { WalletAccount } from "../../../shared/wallet.model"
import { multisigView } from "../multisig/multisig.state"
import { useIsLedgerSigner } from "../ledger/hooks/useIsLedgerSigner"
import { AccountTokensBalance } from "./AccountTokensBalance"
import { useLedgerStatus } from "../ledger/hooks/useLedgerStatus"
import { useView } from "../../views/implementation/react"
import { useStartAccountListScreenPreload } from "../accounts/AccountListScreenContainerPreload"

interface AccountTokensBalanceContainerProps {
  account: WalletAccount
}

export const AccountTokensBalanceContainer: FC<
  AccountTokensBalanceContainerProps
> = ({ account }) => {
  const multisig = useView(multisigView(account))
  const usesLedgerSigner = useIsLedgerSigner(account.id)
  const isLedgerConnected = useLedgerStatus(account.id)
  const startAccountListScreenPreload = useStartAccountListScreenPreload()
  useEffect(() => {
    // FIXME: This is a workaround to preload the account tokens balance after the account tokens balance is rendered
    startAccountListScreenPreload()
  }, [startAccountListScreenPreload])
  return (
    <AccountTokensBalance
      account={account}
      multisig={multisig}
      usesLedgerSigner={usesLedgerSigner}
      isLedgerConnected={isLedgerConnected}
    />
  )
}

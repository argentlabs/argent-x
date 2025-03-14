import type { FC } from "react"

import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"
import { AccountDetailsNavigationBar } from "./AccountDetailsNavigationBar"
import { useLedgerStatus } from "../ledger/hooks/useLedgerStatus"
import { useIsLedgerSigner } from "../ledger/hooks/useIsLedgerSigner"
import type { NavigationBarProps } from "@argent/x-ui"

export const AccountDetailsNavigationBarContainer: FC<NavigationBarProps> = (
  props,
) => {
  const currentAccount = useView(selectedAccountView)
  const currentNetwork = useCurrentNetwork()

  const usesLedgerSigner = useIsLedgerSigner(currentAccount?.id)
  const isLedgerConnected = useLedgerStatus(currentAccount?.id)
  return (
    <AccountDetailsNavigationBar
      accountName={currentAccount?.name}
      accountId={currentAccount?.id}
      accountAddress={currentAccount?.address}
      accountType={currentAccount?.type}
      networkName={currentNetwork.name}
      isLedgerConnected={usesLedgerSigner ? isLedgerConnected : undefined}
      avatarMeta={currentAccount?.avatarMeta}
      {...props}
    />
  )
}

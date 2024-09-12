import { FlexProps } from "@chakra-ui/react"
import { FC } from "react"

import { selectedAccountView } from "../../../../views/account"
import { useView } from "../../../../views/implementation/react"
import { useCurrentNetwork } from "../../../networks/hooks/useCurrentNetwork"
import { NavigationBarAccountDetails } from "./NavigationBarAccountDetails"
import { useLedgerStatus } from "../../../ledger/hooks/useLedgerStatus"
import { useIsLedgerSigner } from "../../../ledger/hooks/useIsLedgerSigner"

export const NavigationBarAccountDetailsContainer: FC<FlexProps> = (props) => {
  const currentAccount = useView(selectedAccountView)
  const currentNetwork = useCurrentNetwork()

  const usesLedgerSigner = useIsLedgerSigner(currentAccount)
  const isLedgerConnected = useLedgerStatus(currentAccount)
  return (
    <NavigationBarAccountDetails
      accountName={currentAccount?.name}
      accountAddress={currentAccount?.address}
      networkName={currentNetwork.name}
      isLedgerConnected={usesLedgerSigner ? isLedgerConnected : undefined}
      {...props}
    />
  )
}

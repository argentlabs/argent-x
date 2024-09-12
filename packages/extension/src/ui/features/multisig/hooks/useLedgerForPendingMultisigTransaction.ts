import { useEffect, useMemo, useState } from "react"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { useDisclosure } from "@chakra-ui/react"
import { useIsLedgerSigner } from "../../ledger/hooks/useIsLedgerSigner"
import { useLedgerDeviceConnection } from "../../ledger/hooks/useLedgerDeviceConnection"

export function useLedgerForPendingMultisigTransaction(
  selectedAccount?: BaseWalletAccount,
) {
  const [ledgerErrorMessage, setLedgerErrorMessage] = useState<string>()
  const ledgerActionModalDisclosure = useDisclosure()

  const isLedgerSigner = useIsLedgerSigner(selectedAccount)
  const isLedgerConnected = useLedgerDeviceConnection()

  const disableLedgerApproval = useMemo(
    () => isLedgerSigner && !isLedgerConnected,
    [isLedgerConnected, isLedgerSigner],
  )

  useEffect(() => {
    if (disableLedgerApproval) {
      ledgerActionModalDisclosure.onClose()
    }
  }, [
    disableLedgerApproval,
    isLedgerConnected,
    ledgerActionModalDisclosure,
    isLedgerSigner,
  ])

  return {
    disableLedgerApproval,
    ledgerErrorMessage,
    setLedgerErrorMessage,
    isLedgerConnected,
    isLedgerSigner,
    ledgerActionModalDisclosure,
  }
}

import { useDisclosure } from "@chakra-ui/react"
import { useActionScreen } from "./useActionScreen"
import { useLedgerModalCloseOnError } from "./useLedgerCloseOnError"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { useIsLedgerSigner } from "../../ledger/hooks/useIsLedgerSigner"
import { useLedgerDeviceConnection } from "../../ledger/hooks/useLedgerDeviceConnection"
import { useEffect } from "react"
import { isLedgerError } from "./usePrettyError"

export function useLedgerForTransaction(selectedAccount?: BaseWalletAccount) {
  const { action } = useActionScreen()
  const isLedgerSigner = useIsLedgerSigner(selectedAccount)
  const isLedgerConnected = useLedgerDeviceConnection()
  const ledgerErrorMessage =
    action && isLedgerError(action.meta.errorApproving)
      ? action.meta.errorApproving
      : undefined

  const actionIsApproving = action?.meta?.startedApproving

  const {
    isOpen: isLedgerApprovalOpen,
    onOpen: onLedgerApprovalOpen,
    onClose: onLedgerApprovalClose,
  } = useDisclosure()

  useLedgerModalCloseOnError(
    isLedgerApprovalOpen,
    action?.meta.errorApproving,
    onLedgerApprovalClose,
  )

  useEffect(() => {
    if (actionIsApproving && isLedgerSigner) {
      onLedgerApprovalOpen()
    }
  }, [actionIsApproving, onLedgerApprovalOpen, isLedgerSigner])

  useEffect(() => {
    if (!isLedgerConnected && actionIsApproving && isLedgerApprovalOpen) {
      onLedgerApprovalClose()
    }
  }, [
    actionIsApproving,
    isLedgerApprovalOpen,
    isLedgerConnected,
    onLedgerApprovalClose,
  ])

  const disableLedgerApproval = isLedgerSigner && !isLedgerConnected

  return {
    isLedgerApprovalOpen,
    onLedgerApprovalOpen,
    onLedgerApprovalClose,
    isLedgerConnected,
    disableLedgerApproval,
    isLedgerSigner,
    ledgerErrorMessage,
  }
}

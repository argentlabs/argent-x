import type { FC } from "react"
import { useCallback, useEffect, useState } from "react"
import type { LedgerModalBottomDialogProps } from "./LedgerModalBottomDialog"
import {
  LedgerModalBottomDialog,
  LedgerModalBottomDialogState,
} from "./LedgerModalBottomDialog"
import { AX_LEDGER_ERROR_MESSAGES } from "../../../../../../shared/errors/ledger"
import { useLedgerStatus } from "../../../../ledger/hooks/useLedgerStatus"
import type { BaseWalletAccount } from "../../../../../../shared/wallet.model"

type LedgerActionModalProps = Omit<LedgerModalBottomDialogProps, "state"> & {
  onSubmit: () => void | Promise<void>
  errorMessage?: string
  account?: BaseWalletAccount
}

export const LedgerActionModal: FC<LedgerActionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  errorMessage,
  account,
  actionType = "transaction",
  txHash,
  deployTxHash,
}) => {
  const [modalState, setModalState] = useState<LedgerModalBottomDialogState>(
    LedgerModalBottomDialogState.CONFIRM,
  )

  const isLedgerConnected = useLedgerStatus(account?.id)

  const ledgerErrorMessageToModalState = useCallback(
    (ledgerErrorMsg: string) => {
      const errMsg = ledgerErrorMsg.replace("LedgerError: ", "")
      switch (errMsg) {
        case AX_LEDGER_ERROR_MESSAGES.TRANSPORT_OPEN_ERROR:
          return LedgerModalBottomDialogState.NOT_CONNECTED

        case AX_LEDGER_ERROR_MESSAGES.APP_DOES_NOT_SEEM_TO_BE_OPEN:
          return LedgerModalBottomDialogState.ERROR_UNKNOWN

        case AX_LEDGER_ERROR_MESSAGES.BAD_CLA:
          return LedgerModalBottomDialogState.INVALID_APP

        // case AX_LEDGER_ERROR_MESSAGES.DEVICE_IS_BUSY:
        //   return LedgerModalBottomDialogState.ERROR_SIGNATURE_PENDING

        case AX_LEDGER_ERROR_MESSAGES.USER_REJECTED:
          return LedgerModalBottomDialogState.ERROR_REJECTED

        case AX_LEDGER_ERROR_MESSAGES.UNSUPPORTED_APP_VERSION:
          return LedgerModalBottomDialogState.UNSUPPORTED_APP_VERSION

        default:
          return LedgerModalBottomDialogState.ERROR
      }
    },
    [],
  )

  useEffect(() => {
    if (errorMessage) {
      setModalState(ledgerErrorMessageToModalState(errorMessage))
    }

    if (isLedgerConnected && !errorMessage) {
      setModalState(LedgerModalBottomDialogState.CONFIRM)
    }
  }, [errorMessage, isLedgerConnected, ledgerErrorMessageToModalState])

  const onRetry = () => {
    setModalState(LedgerModalBottomDialogState.CONFIRM)
    void onSubmit()
  }

  return (
    <LedgerModalBottomDialog
      isOpen={isOpen}
      onClose={onClose}
      state={modalState}
      errorMessage={errorMessage}
      onRetry={onRetry}
      actionType={actionType}
      txHash={txHash}
      deployTxHash={deployTxHash}
    />
  )
}

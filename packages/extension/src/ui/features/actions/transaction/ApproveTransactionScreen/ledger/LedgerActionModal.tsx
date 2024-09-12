import { FC, useCallback, useEffect, useState } from "react"
import {
  LedgerModalBottomDialog,
  LedgerModalBottomDialogProps,
  LedgerModalBottomDialogState,
} from "./LedgerModalBottomDialog"
import { AX_LEDGER_ERROR_MESSAGES } from "../../../../../../shared/errors/ledger"
import { useLedgerStatus } from "../../../../ledger/hooks/useLedgerStatus"
import { BaseWalletAccount } from "../../../../../../shared/wallet.model"
import { BigNumberish, Call } from "starknet"
import { useTransactionHash } from "../../../transactionV2/useTransactionHash"
import { EstimatedFees } from "@argent/x-shared/simulation"

type LedgerActionModalProps = Omit<LedgerModalBottomDialogProps, "state"> & {
  onSubmit: () => void | Promise<void>
  errorMessage?: string
  account?: BaseWalletAccount
  transactions?: Call | Call[]
  estimatedFees?: EstimatedFees
  nonce?: BigNumberish
}

export const LedgerActionModal: FC<LedgerActionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  errorMessage,
  account,
  actionType = "transaction",
  transactions,
  estimatedFees,
  nonce,
}) => {
  const [modalState, setModalState] = useState<LedgerModalBottomDialogState>(
    LedgerModalBottomDialogState.CONFIRM,
  )

  const isLedgerConnected = useLedgerStatus(account)

  const { data: txHash } = useTransactionHash(
    account,
    transactions,
    estimatedFees,
    nonce,
  )

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
    />
  )
}

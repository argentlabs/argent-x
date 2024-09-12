import { isUndefined } from "lodash-es"
import { useEffect } from "react"
import { isLedgerError } from "./usePrettyError"

/**
 * Custom hook to close the ledger modal when an error occurs that is not a ledger-specific error.
 *
 * @param isOpen - Boolean indicating if the modal is currently open.
 * @param error - The error message, if any, that might have occurred.
 * @param onClose - Function to call to close the modal.
 */
export function useLedgerModalCloseOnError(
  isOpen: boolean,
  error: string | undefined,
  onClose: () => void,
) {
  useEffect(() => {
    if (isOpen && !isUndefined(error) && !isLedgerError(error)) {
      onClose()
    }
  }, [error, isOpen, onClose])
}

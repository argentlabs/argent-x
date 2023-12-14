import { useDisclosure } from "@chakra-ui/react"
import { selectedAccountView } from "../../../views/account"
import { useView } from "../../../views/implementation/react"
import { MultisigPendingTxModal } from "../../multisig/MultisigPendingTxModal"
import { useIsSignerInMultisig } from "../../multisig/hooks/useIsSignerInMultisig"
import { useMultisig } from "../../multisig/multisig.state"
import { useMultisigPendingTransactionsByAccount } from "../../multisig/multisigTransactions.state"
import { MultisigBanner } from "../transaction/ApproveTransactionScreen/MultisigBanner"

export const useMultisigActionScreen = ({
  transactionContext,
  onSubmit,
}: {
  transactionContext?: "STANDARD_EXECUTE" | "MULTISIG_ADD_SIGNATURE"
  onSubmit: () => Promise<void>
}) => {
  const account = useView(selectedAccountView)

  const multisig = useMultisig(account)
  const pendingMultisigTransactions =
    useMultisigPendingTransactionsByAccount(account)
  const multisigModalDisclosure = useDisclosure()
  const signerIsInMultisig = useIsSignerInMultisig(multisig)
  // This is required because when a new transaction is added through the normal flow
  // we check for any other pending transactions and if there are any we show the modal
  // If the container is called for adding signature to already pending transaction,
  // we check for any other pending transactions and if there are any we show the modal
  // This makes the transaction context important
  const hasPendingMultisigTransactions =
    transactionContext === "STANDARD_EXECUTE"
      ? pendingMultisigTransactions.length > 0
      : pendingMultisigTransactions.length > 1

  const multisigBanner = multisig && account && (
    <MultisigBanner account={account} confirmations={0} />
  )

  const multisigModal = multisig && (
    <MultisigPendingTxModal
      isOpen={multisigModalDisclosure.isOpen}
      onConfirm={() => void onSubmit()}
      onClose={multisigModalDisclosure.onClose}
      noOfOwners={multisig.threshold}
    />
  )

  return {
    multisig,
    multisigModal,
    multisigBanner,
    signerIsInMultisig,
    hasPendingMultisigTransactions,
    multisigModalDisclosure,
  }
}

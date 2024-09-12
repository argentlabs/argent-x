import { Navigate, useNavigate } from "react-router-dom"
import { useRouteRequestId } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useMultisigPendingOffchainSignature } from "./multisigOffchainSignatures.state"
import { SignActionScreenV2 } from "../actions/transactionV2/SignActionScreenV2"
import { isObject, isString } from "lodash-es"
import { useDappFromKnownDappsByName } from "../../services/knownDapps"
import { useLegacyAppState } from "../../app.state"
import { multisigService } from "../../services/multisig"
import { WithActionScreenErrorFooter } from "../actions/transaction/ApproveTransactionScreen/WithActionScreenErrorFooter"
import { useMemo, useState } from "react"
import { num } from "starknet"
import { usePublicKey } from "../accounts/usePublicKey"
import { isEqualAddress } from "@argent/x-shared"
import { useIsLedgerSigner } from "../ledger/hooks/useIsLedgerSigner"
import { LedgerActionModal } from "../actions/transaction/ApproveTransactionScreen/ledger/LedgerActionModal"
import { ledgerErrorMessageSchema } from "../actions/hooks/usePrettyError"
import { useLedgerForPendingMultisigTransaction } from "./hooks/useLedgerForPendingMultisigTransaction"

export const MultisigPendingOffchainSignatureDetailsScreen = () => {
  const selectedAccount = useView(selectedAccountView)
  const currentSigner = usePublicKey(selectedAccount)
  const requestId = useRouteRequestId()
  const navigate = useNavigate()
  const [txError, setTxError] = useState<string>()

  const pendingOffchainSignature =
    useMultisigPendingOffchainSignature(requestId)

  const needsApproval = useMemo(() => {
    if (pendingOffchainSignature && currentSigner) {
      return pendingOffchainSignature.nonApprovedSigners.some(
        (signer) => num.toBigInt(signer) === num.toBigInt(currentSigner),
      )
    }

    return false
  }, [currentSigner, pendingOffchainSignature])

  const isSignerSameAsCreator = useMemo(
    () =>
      currentSigner &&
      isEqualAddress(currentSigner, pendingOffchainSignature?.creator),
    [currentSigner, pendingOffchainSignature],
  )

  const usesLedgerSigner = useIsLedgerSigner(selectedAccount)

  const {
    ledgerActionModalDisclosure,
    disableLedgerApproval,
    ledgerErrorMessage,
    setLedgerErrorMessage,
  } = useLedgerForPendingMultisigTransaction(selectedAccount)

  const name = pendingOffchainSignature?.message.content.domain.name
  const dapp = useDappFromKnownDappsByName(isString(name) ? name : undefined)

  if (!selectedAccount || !requestId) {
    return <Navigate to={routes.accounts()} />
  }

  if (!pendingOffchainSignature) {
    return <Navigate to={routes.accountActivity()} />
  }

  const onSubmit = async () => {
    if (usesLedgerSigner) {
      return onSubmitWithLedger()
    }

    useLegacyAppState.setState({ isLoading: true })
    const signerSignatures =
      await multisigService.addOffchainSignature(requestId)
    useLegacyAppState.setState({ isLoading: false })
    if (signerSignatures) {
      return navigate(-1)
    }
  }

  const onSubmitWithLedger = async () => {
    try {
      setLedgerErrorMessage(undefined)
      setTxError(undefined)
      ledgerActionModalDisclosure.onOpen()
      const signerSignatures =
        await multisigService.addOffchainSignature(requestId)
      ledgerActionModalDisclosure.onClose()
      if (signerSignatures) {
        return navigate(-1)
      }
    } catch (error) {
      console.error(error)
      if (isObject(error) && "message" in error) {
        const ledgerError = ledgerErrorMessageSchema.safeParse(error.message)
        if (ledgerError.success) {
          return setLedgerErrorMessage(ledgerError.data)
        }
        setTxError(
          isString(error.message) ? error.message : "An error occurred",
        )
      }
      ledgerActionModalDisclosure.onClose()
    }
  }

  const onReject = async () => {
    // REMINDER: Offchain signature can be cancelled only by the creator
    if (isSignerSameAsCreator) {
      useLegacyAppState.setState({ isLoading: true })
      await multisigService.cancelOffchainSignature(requestId)
      useLegacyAppState.setState({ isLoading: false })
    }

    return navigate(-1)
  }

  return (
    <>
      <SignActionScreenV2
        title="Review signature request"
        subtitle={dapp?.dappUrl}
        dappLogoUrl={dapp?.logoUrl}
        dappHost={dapp?.dappUrl || ""}
        dataToSign={pendingOffchainSignature.message.content}
        onSubmit={() => void onSubmit()}
        footer={<WithActionScreenErrorFooter customError={txError} />}
        onReject={() => void onReject()}
        showConfirmButton={needsApproval}
        networkId={selectedAccount.networkId}
        rejectButtonText={isSignerSameAsCreator ? "Cancel" : "Reject"}
        isLedger={usesLedgerSigner}
        confirmButtonDisabled={disableLedgerApproval}
      />

      <LedgerActionModal
        isOpen={ledgerActionModalDisclosure.isOpen}
        onClose={ledgerActionModalDisclosure.onClose}
        onSubmit={onSubmit}
        errorMessage={ledgerErrorMessage}
        account={selectedAccount}
        actionType="signature"
      />
    </>
  )
}

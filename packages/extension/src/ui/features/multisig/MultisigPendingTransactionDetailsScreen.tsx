import { BarBackButton, H5, NavigationBar, P2 } from "@argent/x-ui"
import { Divider, Flex, useDisclosure } from "@chakra-ui/react"
import { useEffect, useMemo, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { formatTruncatedAddress } from "@argent/x-shared"
import { isObject, isString } from "lodash-es"
import { useCallback } from "react"
import { num, TransactionType } from "starknet"
import {
  multisigPendingTransactionView,
  setHasSeenTransaction,
} from "../../../shared/multisig/pendingTransactionsStore"

import { transformTransaction } from "../../../shared/activity/utils/transform"
import {
  isOnChainRejectTransaction,
  isUpgradeTransaction,
} from "../../../shared/activity/utils/transform/is"
import { getTransactionFromPendingMultisigTransaction } from "../../../shared/activity/utils/transform/transaction/transformers/pendingMultisigTransactionAdapter"
import { isMultisigTransactionRejectedAndNonceNotConsumed } from "../../../shared/multisig/utils/getMultisigTransactionType"
import { routes } from "../../../shared/ui/routes"
import { useLegacyAppState } from "../../app.state"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import { useRouteRequestId } from "../../hooks/useRoute"
import { multisigService } from "../../services/multisig"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { usePublicKey } from "../accounts/usePublicKey"
import { ledgerErrorMessageSchema } from "../actions/hooks/usePrettyError"
import { ApproveTransactionScreenContainer } from "../actions/transaction/ApproveTransactionScreen/ApproveTransactionScreenContainer"
import type { MultisigConfirmationsBannerProps } from "../actions/transaction/MultisigConfirmationsBanner"
import { getApproveScreenTypeFromPendingTransaction } from "../actions/utils"
import { isLedgerSigner } from "../ledger/utils"
import { useLedgerForPendingMultisigTransaction } from "./hooks/useLedgerForPendingMultisigTransaction"
import { multisigView } from "./multisig.state"

export const MultisigPendingTransactionDetailsScreen = () => {
  const selectedAccount = useView(selectedAccountView)
  const requestId = useRouteRequestId()
  const pendingTransaction = useView(multisigPendingTransactionView(requestId))
  const multisig = useView(multisigView(selectedAccount))
  const publicKey = usePublicKey(multisig?.id)
  const navigate = useNavigate()
  const onBack = useNavigateReturnToOrBack()

  const [txError, setTxError] = useState<string>()

  const {
    ledgerActionModalDisclosure,
    disableLedgerApproval,
    ledgerErrorMessage,
    setLedgerErrorMessage,
  } = useLedgerForPendingMultisigTransaction(selectedAccount)

  const txNeedsRetry = isMultisigTransactionRejectedAndNonceNotConsumed(
    pendingTransaction?.state,
  )

  const needsApproval = useMemo(() => {
    if (txNeedsRetry) return true // if the tx was rejected, it needs to be approved again

    if (pendingTransaction && publicKey) {
      return pendingTransaction.nonApprovedSigners.some(
        (signer) => num.toBigInt(signer) === num.toBigInt(publicKey),
      )
    }

    return false
  }, [pendingTransaction, publicKey, txNeedsRetry])

  const isApprovedByEnoughSigners = useMemo(() => {
    if (txNeedsRetry) return false // if the tx was rejected, it needs to be approved again

    if (pendingTransaction && multisig) {
      return pendingTransaction.approvedSigners.length >= multisig.threshold
    }
    return false
  }, [multisig, pendingTransaction, txNeedsRetry])

  const { isRejectOnChain, isUpgradeAccount } = useMemo(() => {
    if (!selectedAccount || !pendingTransaction) {
      return { isRejectOnChain: false, isUpgradeAccount: false }
    }
    const transaction = getTransactionFromPendingMultisigTransaction(
      pendingTransaction,
      selectedAccount,
    )

    const transactionTransformed = transformTransaction({
      transaction,
      accountAddress: selectedAccount.address,
    })
    const isRejectOnChain =
      transactionTransformed &&
      isOnChainRejectTransaction(transactionTransformed)
    const isUpgradeAccount =
      transactionTransformed && isUpgradeTransaction(transactionTransformed)

    return { isRejectOnChain, isUpgradeAccount }
  }, [pendingTransaction, selectedAccount])

  const onRejectOnChain = useCallback(async () => {
    if (requestId && !isApprovedByEnoughSigners) {
      await multisigService.rejectOnChainTransaction(requestId)
      navigate(routes.accountActivity())
    }
  }, [isApprovedByEnoughSigners, navigate, requestId])

  const transactionCalls = useMemo(() => {
    if (pendingTransaction) {
      return pendingTransaction.transaction.calls
    }
    return []
  }, [pendingTransaction])

  useEffect(() => {
    if (requestId && pendingTransaction?.notify) {
      void setHasSeenTransaction(requestId)
    }
  }, [pendingTransaction, requestId])

  if (!selectedAccount || !requestId) {
    return <Navigate to={routes.accounts()} />
  }

  if (!pendingTransaction) {
    // This means that there was a requestId with pendingTransaction in the past, but now it's submitted.
    // In this case, we should redirect to the account activity screen.
    return <Navigate to={routes.accountActivity()} />
  }

  const goToTransactionsConfirmations = () => {
    navigate(
      routes.multisigTransactionConfirmations(
        selectedAccount.id,
        requestId,
        "pending",
      ),
    )
  }

  const onSubmit = async () => {
    if (txNeedsRetry) {
      return onRetryTransaction()
    }

    if (isLedgerSigner(selectedAccount)) {
      return onSubmitWithLedger()
    }

    useLegacyAppState.setState({ isLoading: true })
    const txHash = await multisigService.addTransactionSignature(
      requestId,
      publicKey,
    )
    useLegacyAppState.setState({ isLoading: false })
    if (txHash) {
      return onBack()
    }
  }

  const onRetryTransaction = async () => {
    try {
      const result = await multisigService.retryTransactionExecution(requestId)
      if (result) {
        return onBack()
      }
    } catch (error) {
      console.error(error)
      if (isObject(error) && "message" in error) {
        setTxError(
          isString(error.message) ? error.message : "An error occurred",
        )
      }
    }
  }

  const onSubmitWithLedger = async () => {
    try {
      ledgerActionModalDisclosure.onOpen()
      const txHash = await multisigService.addTransactionSignature(
        requestId,
        publicKey,
      )
      ledgerActionModalDisclosure.onClose()
      if (txHash) {
        return onBack()
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

  const onConfirm = () => {
    void onSubmit()
  }

  const onReject = () => {
    return onBack()
  }

  const title = (
    <Flex
      w="100%"
      justifyContent="center"
      alignItems="center"
      py="18px"
      gap={1}
    >
      <H5 mr={2}>{selectedAccount.name}</H5>
      <P2 color="neutrals.300">
        ({formatTruncatedAddress(selectedAccount.address)})
      </P2>
    </Flex>
  )

  const navigationBar = (
    <>
      <NavigationBar
        leftButton={<BarBackButton onClick={onBack} />}
        title={title}
      />
      <Divider color="neutrals.700" />
    </>
  )

  const multisigBannerProps: MultisigConfirmationsBannerProps = {
    account: selectedAccount,
    confirmations: txNeedsRetry ? 0 : pendingTransaction.approvedSigners.length,
    onClick: goToTransactionsConfirmations,
  }

  const canBeRejected =
    publicKey && !isApprovedByEnoughSigners && !isRejectOnChain

  const approveScreenType =
    getApproveScreenTypeFromPendingTransaction(pendingTransaction)

  const confirmButtonText = txNeedsRetry
    ? "Retry"
    : isRejectOnChain
      ? "Confirm rejection"
      : "Confirm"
  const rejectButtonText = canBeRejected ? "Reject" : "Cancel"

  return (
    <ApproveTransactionScreenContainer
      actionHash={requestId}
      navigationBar={navigationBar}
      onSubmit={onConfirm}
      onConfirmAnyway={() => void onSubmit()}
      onReject={canBeRejected ? onRejectOnChain : onReject}
      transactionAction={{
        type: TransactionType.INVOKE,
        payload: transactionCalls,
      }}
      approveScreenType={approveScreenType}
      multisigBannerProps={multisigBannerProps}
      ledgerActionModalDisclosure={ledgerActionModalDisclosure}
      ledgerErrorMessage={ledgerErrorMessage}
      selectedAccount={selectedAccount}
      showHeader={false}
      transactionContext="MULTISIG_ADD_SIGNATURE"
      actionErrorApproving={txError}
      disableLedgerApproval={disableLedgerApproval}
      showConfirmButton={needsApproval}
      hideFooter={!canBeRejected && !needsApproval}
      rejectButtonText={rejectButtonText}
      confirmButtonText={confirmButtonText}
      isRejectOnChain={isRejectOnChain}
      isUpgradeAccount={isUpgradeAccount}
      useRejectButtonColorFallback={false}
      nonce={pendingTransaction.nonce}
      txNeedsRetry={txNeedsRetry}
    />
  )
}

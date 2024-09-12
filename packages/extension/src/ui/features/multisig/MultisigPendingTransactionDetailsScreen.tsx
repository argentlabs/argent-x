import { BarBackButton, H6, NavigationBar, P3 } from "@argent/x-ui"
import { Box, Flex, useDisclosure } from "@chakra-ui/react"
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
import { useLegacyAppState } from "../../app.state"
import { useRouteRequestId } from "../../hooks/useRoute"
import { routes } from "../../../shared/ui/routes"
import { multisigService } from "../../services/multisig"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { usePublicKey } from "../accounts/usePublicKey"
import { ledgerErrorMessageSchema } from "../actions/hooks/usePrettyError"
import { ApproveTransactionScreenContainer } from "../actions/transaction/ApproveTransactionScreen/ApproveTransactionScreenContainer"
import { MultisigConfirmationsBannerProps } from "../actions/transaction/MultisigConfirmationsBanner"
import { ApproveScreenType } from "../actions/transaction/types"
import { isLedgerSigner } from "../ledger/utils"
import { useLedgerForPendingMultisigTransaction } from "./hooks/useLedgerForPendingMultisigTransaction"
import { multisigView } from "./multisig.state"
import { RejectOnChainModal } from "./RejectOnChainModal"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"
import { isMultisigTransactionRejectedAndNonceNotConsumed } from "../../../shared/multisig/utils/getMultisigTransactionType"

export const MultisigPendingTransactionDetailsScreen = () => {
  const selectedAccount = useView(selectedAccountView)
  const requestId = useRouteRequestId()
  const pendingTransaction = useView(multisigPendingTransactionView(requestId))
  const multisig = useView(multisigView(selectedAccount))
  const publicKey = usePublicKey(multisig)
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

  const {
    isOpen: isRejectOnChainModalOpen,
    onOpen: onRejectOnChainModalOpen,
    onClose: onRejectOnChainModalClose,
  } = useDisclosure()

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
        selectedAccount.address,
        requestId,
        "pending",
      ),
    )
  }

  const onSubmit = async () => {
    if (isLedgerSigner(selectedAccount)) {
      return onSubmitWithLedger()
    }

    if (txNeedsRetry) {
      return onRetryTransaction()
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
      <H6 mr={2}>{selectedAccount.name}</H6>
      <P3 color="neutrals.300">
        ({formatTruncatedAddress(selectedAccount.address)})
      </P3>
    </Flex>
  )

  const navigationBar = (
    <Box pb="2">
      <NavigationBar
        leftButton={<BarBackButton onClick={onBack} />}
        title={title}
      />
    </Box>
  )

  const multisigBannerProps: MultisigConfirmationsBannerProps = {
    account: selectedAccount,
    confirmations: txNeedsRetry ? 0 : pendingTransaction.approvedSigners.length,
    onClick: goToTransactionsConfirmations,
  }

  const canBeRejected =
    publicKey && !isApprovedByEnoughSigners && !isRejectOnChain

  return (
    <>
      <ApproveTransactionScreenContainer
        actionHash={requestId}
        navigationBar={navigationBar}
        onSubmit={onConfirm}
        onConfirmAnyway={() => void onSubmit()}
        onReject={canBeRejected ? onRejectOnChainModalOpen : onReject}
        transactionAction={{
          type: TransactionType.INVOKE,
          payload: transactionCalls,
        }}
        approveScreenType={ApproveScreenType.TRANSACTION}
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
        rejectButtonText={canBeRejected ? "Reject" : "Cancel"}
        confirmButtonText={txNeedsRetry ? "Retry" : "Confirm"}
        isRejectOnChain={isRejectOnChain}
        isUpgradeAccount={isUpgradeAccount}
        useRejectButtonColorFallback={false}
        nonce={pendingTransaction.nonce}
        txNeedsRetry={txNeedsRetry}
      />
      <RejectOnChainModal
        isOpen={isRejectOnChainModalOpen}
        onClose={onRejectOnChainModalClose}
        onConfirm={() => void onRejectOnChain()}
      />
    </>
  )
}

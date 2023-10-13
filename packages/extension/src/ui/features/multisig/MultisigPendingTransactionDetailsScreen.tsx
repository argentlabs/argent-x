import { BarBackButton, H6, NavigationBar, P3 } from "@argent/ui"
import { Box, Flex, useDisclosure } from "@chakra-ui/react"
import { useEffect, useMemo } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { setHasSeenTransaction } from "../../../shared/multisig/pendingTransactionsStore"
import { useAppState } from "../../app.state"
import { routes, useRouteRequestId } from "../../routes"
import { formatTruncatedAddress } from "../../services/addresses"
import { usePublicKey } from "../accounts/usePublicKey"
import { MultisigBannerProps } from "../actions/transaction/ApproveTransactionScreen/MultisigBanner"
import {
  useMultisigPendingTransaction,
  useMultisigPendingTransactionsByAccount,
} from "./multisigTransactions.state"
import { num } from "starknet"
import { multisigService } from "../../services/multisig"
import { useView } from "../../views/implementation/react"
import { selectedAccountView } from "../../views/account"
import { ApproveScreenType } from "../actions/transaction/types"
import { ApproveTransactionScreenContainer } from "../actions/transaction/ApproveTransactionScreen/ApproveTransactionScreenContainer"

export const MultisigPendingTransactionDetailsScreen = () => {
  const selectedAccount = useView(selectedAccountView)
  const publicKey = usePublicKey(selectedAccount)
  const requestId = useRouteRequestId()
  const pendingTransaction = useMultisigPendingTransaction(requestId)
  const navigate = useNavigate()

  const multisigModalDisclosure = useDisclosure()

  const pendingMultisigTransactions =
    useMultisigPendingTransactionsByAccount(selectedAccount)

  const needsApproval = useMemo(() => {
    if (pendingTransaction && publicKey) {
      return pendingTransaction.nonApprovedSigners.some(
        (signer) => num.toBigInt(signer) === num.toBigInt(publicKey),
      )
    }

    return false
  }, [pendingTransaction, publicKey])

  const transactions = useMemo(() => {
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
      routes.multisigPendingTransactionConfirmations(
        selectedAccount.address,
        requestId,
      ),
    )
  }

  const onSubmit = async () => {
    useAppState.setState({ isLoading: true })
    const txHash = await multisigService.addTransactionSignature(requestId)
    useAppState.setState({ isLoading: false })
    if (txHash) {
      return navigate(-1)
    }
  }

  const onConfirm = () => {
    if (pendingMultisigTransactions.length > 1) {
      multisigModalDisclosure.onOpen()
    } else {
      void onSubmit()
    }
  }

  const onReject = () => {
    return navigate(-1)
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
        leftButton={<BarBackButton onClick={() => navigate(-1)} />}
        title={title}
      />
    </Box>
  )

  const multisigBannerProps: MultisigBannerProps = {
    account: selectedAccount,
    confirmations: pendingTransaction.approvedSigners.length,
    onClick: goToTransactionsConfirmations,
  }

  return (
    <ApproveTransactionScreenContainer
      actionHash={requestId}
      navigationBar={navigationBar}
      onSubmit={onConfirm}
      onConfirmAnyway={() => void onSubmit()}
      onReject={onReject}
      transactions={transactions}
      approveScreenType={ApproveScreenType.TRANSACTION}
      multisigBannerProps={multisigBannerProps}
      multisigModalDisclosure={multisigModalDisclosure}
      hideFooter={!needsApproval}
      selectedAccount={selectedAccount}
      showHeader={false}
      transactionContext="MULTISIG_ADD_SIGNATURE"
    />
  )
}

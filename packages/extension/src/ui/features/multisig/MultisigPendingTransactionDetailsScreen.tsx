import {
  BarBackButton,
  H5,
  H6,
  NavigationContainer,
  P3,
  StickyGroup,
} from "@argent/ui"
import { Box, Button, Flex, useDisclosure } from "@chakra-ui/react"
import { useEffect, useMemo, useState } from "react"
import Measure from "react-measure"
import { Navigate, useNavigate } from "react-router-dom"

import { setHasSeenTransaction } from "../../../shared/multisig/pendingTransactionsStore"
import { useAppState } from "../../app.state"
import { routes, useRouteRequestId } from "../../routes"
import { formatTruncatedAddress } from "../../services/addresses"
import { addMultisigTransactionSignature } from "../../services/backgroundMultisigs"
import { transformTransaction } from "../accountActivity/transform"
import { getTransactionFromPendingMultisigTransaction } from "../accountActivity/transform/transaction/transformers/pendingMultisigTransactionAdapter"
import { TransactionIcon } from "../accountActivity/ui/TransactionIcon"
import { useSelectedAccount } from "../accounts/accounts.state"
import { usePublicKey } from "../accounts/usePublicKey"
import { FeeEstimationContainer } from "../actions/feeEstimation/FeeEstimationContainer"
import { AccountNetworkInfo } from "../actions/transaction/ApproveTransactionScreen/AccountNetworkInfo"
import { MultisigBanner } from "../actions/transaction/ApproveTransactionScreen/MultisigBanner"
import { TransactionActions } from "../actions/transaction/ApproveTransactionScreen/TransactionActions"
import { useMultisig } from "./multisig.state"
import { MultisigPendingTxModal } from "./MultisigPendingTxModal"
import {
  useMultisigPendingTransaction,
  useMultisigPendingTransactionsByAccount,
} from "./multisigTransactions.state"

export const MultisigPendingTransactionDetailsScreen = () => {
  const [confirmButtonDisabled, setConfirmButtonDisabled] = useState(false)

  const selectedAccount = useSelectedAccount()
  const publicKey = usePublicKey(selectedAccount)

  const requestId = useRouteRequestId()
  const pendingTransaction = useMultisigPendingTransaction(requestId)
  const navigate = useNavigate()
  const [placeholderHeight, setPlaceholderHeight] = useState(100)

  const {
    isOpen: isMultisigModalOpen,
    onOpen: onMultisigModalOpen,
    onClose: onMultisigModalClose,
  } = useDisclosure()

  const multisig = useMultisig(selectedAccount)

  const pendingMultisigTransactions =
    useMultisigPendingTransactionsByAccount(selectedAccount)

  const transactionTransformed = useMemo(() => {
    if (pendingTransaction && selectedAccount) {
      return transformTransaction({
        transaction: getTransactionFromPendingMultisigTransaction(
          pendingTransaction,
          selectedAccount,
        ),
        accountAddress: selectedAccount.address,
      })
    }
  }, [pendingTransaction, selectedAccount])

  const needsApproval = useMemo(() => {
    if (pendingTransaction && publicKey) {
      return pendingTransaction.nonApprovedSigners.includes(publicKey)
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
      setHasSeenTransaction(requestId)
    }
  }, [pendingTransaction, requestId])

  if (!selectedAccount || !requestId) {
    return <Navigate to={routes.accounts()} />
  }
  const goToTransactionsConfirmations = () => {
    navigate(
      routes.multisigPendingTransactionConfirmations(
        selectedAccount.address,
        requestId,
      ),
    )
  }

  const onConfirm = async () => {
    useAppState.setState({ isLoading: true })
    const txHash = await addMultisigTransactionSignature(requestId)
    useAppState.setState({ isLoading: false })
    if (txHash) {
      return navigate(-1)
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
      <H6>{selectedAccount.name}</H6>
      <P3 color="neutrals.300">
        ({formatTruncatedAddress(selectedAccount.address)})
      </P3>
    </Flex>
  )

  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={() => navigate(-1)} />}
      title={title}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (pendingMultisigTransactions.length > 1) {
            onMultisigModalOpen()
          } else {
            onConfirm()
          }
        }}
      >
        <Box mx={4} my={1}>
          <Flex
            direction="column"
            justifyContent="center"
            alignItems="center"
            gap="3"
            mb="6"
          >
            {transactionTransformed && (
              <TransactionIcon transaction={transactionTransformed} />
            )}
            <Flex
              direction="column"
              justifyContent="center"
              alignItems="center"
              gap="0.5"
            >
              <H5>{transactionTransformed?.displayName}</H5>
            </Flex>
          </Flex>
          {selectedAccount && pendingTransaction && (
            <MultisigBanner
              confirmations={pendingTransaction.approvedSigners.length}
              account={selectedAccount}
              onClick={goToTransactionsConfirmations}
            />
          )}
        </Box>

        <Box mx={4} my={1}>
          <TransactionActions
            action={{ type: "INVOKE_FUNCTION", payload: transactions }}
          />
        </Box>

        <Box mx={4} my={1}>
          <AccountNetworkInfo account={selectedAccount} />
        </Box>
        <Box w="full" h={placeholderHeight} />

        <Measure
          bounds
          onResize={(contentRect) => {
            const { height = 100 } = contentRect.bounds || {}
            setPlaceholderHeight(height)
          }}
        >
          {({ measureRef }) => (
            <StickyGroup ref={measureRef} p="4">
              {needsApproval && (
                <>
                  <FeeEstimationContainer
                    transactions={transactions}
                    accountAddress={selectedAccount.address}
                    networkId={selectedAccount.networkId}
                    actionHash={requestId}
                    onErrorChange={setConfirmButtonDisabled}
                  />
                  <Flex gap={2} w="full" justifyContent="center">
                    <Button onClick={onReject} type="button" w="full">
                      Cancel
                    </Button>
                    <Button
                      isDisabled={confirmButtonDisabled}
                      colorScheme="primary"
                      w="full"
                      type="submit"
                    >
                      Confirm
                    </Button>
                  </Flex>
                </>
              )}
            </StickyGroup>
          )}
        </Measure>
      </form>

      {multisig && isMultisigModalOpen && (
        <MultisigPendingTxModal
          isOpen={isMultisigModalOpen}
          onConfirm={onConfirm}
          onClose={onMultisigModalClose}
          noOfOwners={multisig.threshold}
        />
      )}
    </NavigationContainer>
  )
}

import { BarBackButton, H5, NavigationContainer, P4 } from "@argent/ui"
import { Box, Center, Flex } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"

import { routes, useRouteRequestId } from "../../routes"
import { transformTransaction } from "../accountActivity/transform"
import { getTransactionFromPendingMultisigTransaction } from "../accountActivity/transform/transaction/transformers/pendingMultisigTransactionAdapter"
import { TransactionIcon } from "../accountActivity/ui/TransactionIcon"
import { AccountNetworkInfo } from "../actions/transaction/ApproveTransactionScreen/AccountNetworkInfo"
import { MultisigBanner } from "../actions/transaction/ApproveTransactionScreen/MultisigBanner"
import { TransactionActions } from "../actions/transaction/ApproveTransactionScreen/TransactionActions"
import { useRouteAccount } from "../shield/useRouteAccount"
import { useMultisigPendingTransaction } from "./hooks/useMultisigPendingTransaction"
import { useMultisigRequest } from "./hooks/useMultisigRequest"

export const MultisigPendingTransactionDetailsScreen = () => {
  const [showtxDetails, setShowTxDetails] = useState(true)

  const selectedAccount = useRouteAccount()
  const requestId = useRouteRequestId()
  const { data: pendingTransaction } = useMultisigPendingTransaction(requestId)
  const navigate = useNavigate()

  const { data } = useMultisigRequest({
    account: selectedAccount,
    requestId,
  })
  const transactionTransformed = useMemo(() => {
    if (data && pendingTransaction && selectedAccount) {
      return transformTransaction({
        transaction: getTransactionFromPendingMultisigTransaction(
          {
            ...pendingTransaction,
            data,
          },
          selectedAccount,
        ),
        accountAddress: selectedAccount.address,
      })
    }
  }, [data, pendingTransaction, selectedAccount])
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
  return (
    <NavigationContainer
      leftButton={<BarBackButton onClick={() => navigate(-1)} />}
    >
      {pendingTransaction && (
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
          <MultisigBanner
            confirmations={data?.content.approvedSigners.length}
            account={selectedAccount}
            onClick={goToTransactionsConfirmations}
          />
        </Box>
      )}
      {pendingTransaction && showtxDetails && (
        <Box mx={4} my={1}>
          <TransactionActions
            transactions={
              Array.isArray(pendingTransaction?.transactions)
                ? pendingTransaction?.transactions
                : pendingTransaction?.transactions
                ? [pendingTransaction?.transactions]
                : []
            }
          />
        </Box>
      )}
      <Box mx={4} my={1}>
        <AccountNetworkInfo networkName={selectedAccount.network.name} />
      </Box>

      <Center>
        <P4
          mt={3}
          fontWeight="bold"
          color="neutrals.400"
          _hover={{ textDecoration: "underline", cursor: "pointer" }}
          onClick={() => setShowTxDetails((_showtxDetails) => !_showtxDetails)}
        >
          {showtxDetails ? "Hide" : "View more"} details
        </P4>
      </Center>
    </NavigationContainer>
  )
}

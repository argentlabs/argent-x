import {
  BarBackButton,
  H4,
  H6,
  NavigationContainer,
  P3,
  icons,
} from "@argent/ui"
import { Box, Divider, Flex } from "@chakra-ui/react"
import { useMemo } from "react"

import { useRouteRequestId } from "../../routes"
import { formatTruncatedSignerKey } from "../../services/addresses"
import { transformTransaction } from "../accountActivity/transform"
import { getTransactionFromPendingMultisigTransaction } from "../accountActivity/transform/transaction/transformers/pendingMultisigTransactionAdapter"
import { Account } from "../accounts/Account"
import { useEncodedPublicKeys, useSignerKey } from "../accounts/usePublicKey"
import { useRouteAccount } from "../shield/useRouteAccount"
import { useMultisigInfo } from "./hooks/useMultisigInfo"
import { useMultisigPendingTransaction } from "./multisigTransactions.state"

const { TickIcon } = icons
export const TransactionConfirmationsScreen = () => {
  const selectedAccount = useRouteAccount()
  const requestId = useRouteRequestId()
  const pendingTransaction = useMultisigPendingTransaction(requestId)
  const signerKey = useSignerKey()

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
  const approvedSignersPublicKey = useEncodedPublicKeys(
    pendingTransaction?.approvedSigners ?? [],
  )

  const nonApprovedSignersPublicKey = useEncodedPublicKeys(
    pendingTransaction?.nonApprovedSigners ?? [],
  )
  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={transactionTransformed?.displayName}
    >
      <Box p={4}>
        <H4>Waiting for confirmations...</H4>
        {selectedAccount && pendingTransaction && (
          <TransactionConfirmationsScreenSubtitle
            account={selectedAccount}
            approvedSignersLength={pendingTransaction.approvedSigners.length}
          />
        )}
        <Divider my={4} color="neutrals.800" />

        <P3 color="neutrals.300" mb={3}>
          Me
        </P3>
        <Box borderRadius="lg" backgroundColor="neutrals.800" p={4} mb={3}>
          {signerKey && (
            <Flex alignItems="center" justifyContent="space-between">
              <H6 color="white">{formatTruncatedSignerKey(signerKey)} </H6>
              {approvedSignersPublicKey.some((key) => key === signerKey) && (
                <TickIcon color="primary.500" />
              )}
            </Flex>
          )}
        </Box>
        <P3 color="neutrals.300" mb={3}>
          Other owners
        </P3>
        {approvedSignersPublicKey
          .filter((signer) => signer !== signerKey)
          .map((signer) => {
            return (
              <Box
                borderRadius="lg"
                backgroundColor="neutrals.800"
                p={4}
                key={signer}
                my={1}
              >
                <Flex alignItems="center" justifyContent="space-between">
                  <H6 color="white">{formatTruncatedSignerKey(signer)}</H6>
                  <TickIcon color="primary.500" fontSize="md" />
                </Flex>
              </Box>
            )
          })}
        {nonApprovedSignersPublicKey
          .filter((signer) => signer !== signerKey)
          .map((signer) => {
            return (
              <Box
                borderRadius="lg"
                backgroundColor="neutrals.800"
                p={4}
                key={signer}
                my={1}
              >
                <H6 color="white">{formatTruncatedSignerKey(signer)}</H6>
              </Box>
            )
          })}
      </Box>
    </NavigationContainer>
  )
}

const TransactionConfirmationsScreenSubtitle = ({
  account,
  approvedSignersLength,
}: {
  account: Account
  approvedSignersLength: number
}) => {
  const { multisig } = useMultisigInfo(account)

  const missingConfirmationsMessage = useMemo(() => {
    if (multisig?.threshold) {
      const missingConfirmations = multisig?.threshold - approvedSignersLength
      return `${missingConfirmations} more confirmation${
        missingConfirmations > 1 ? "s" : ""
      } required`
    }
  }, [approvedSignersLength, multisig?.threshold])
  return <P3>{missingConfirmationsMessage}</P3>
}

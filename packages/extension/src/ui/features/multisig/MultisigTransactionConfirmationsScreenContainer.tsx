import { BarBackButton, H3, NavigationContainer, P2 } from "@argent/x-ui"
import { Box, Divider } from "@chakra-ui/react"
import { useMemo } from "react"

import type { Address } from "@argent/x-shared"
import { ensureArray, isEqualAddress, pluralise } from "@argent/x-shared"
import { Navigate } from "react-router-dom"
import { transformTransaction } from "../../../shared/activity/utils/transform"
import { getTransactionFromPendingMultisigTransaction } from "../../../shared/activity/utils/transform/transaction/transformers/pendingMultisigTransactionAdapter"
import { multisigPendingTransactionView } from "../../../shared/multisig/pendingTransactionsStore"
import { routes } from "../../../shared/ui/routes"
import {
  useRouteRequestId,
  useRouteTransactionType,
} from "../../hooks/useRoute"
import { activityForTransactionHashView } from "../../views/activityCache"
import { useView } from "../../views/implementation/react"
import type { Multisig } from "./Multisig"
import { multisigView } from "./multisig.state"
import { MultisigTransactionConfirmationsScreen } from "./MultisigTransactionConfirmationsScreen"
import { useRouteWalletAccount } from "../smartAccount/useRouteWalletAccount"
import { isMultisigTransactionRejectedAndNonceNotConsumed } from "../../../shared/multisig/utils/getMultisigTransactionType"

export const MultisigTransactionConfirmationsScreenContainer = () => {
  const selectedAccount = useRouteWalletAccount()
  const multisig = useView(multisigView(selectedAccount))

  const requestId = useRouteRequestId()
  const txType = useRouteTransactionType()

  const isPendingTx = txType === "pending"

  const pendingTransaction = useView(
    multisigPendingTransactionView(isPendingTx ? requestId : undefined),
  )

  const isRejectedTx =
    pendingTransaction &&
    isMultisigTransactionRejectedAndNonceNotConsumed(pendingTransaction.state)

  const activity = useView(
    activityForTransactionHashView({
      account: selectedAccount,
      hash: !isPendingTx ? requestId : undefined,
    }),
  )

  const transactionTransformed = useMemo(() => {
    if (!pendingTransaction || !selectedAccount) {
      return
    }

    return transformTransaction({
      transaction: getTransactionFromPendingMultisigTransaction(
        pendingTransaction,
        selectedAccount,
      ),
      accountAddress: selectedAccount.address,
    })
  }, [pendingTransaction, selectedAccount])

  const signers = useMemo(() => {
    if (isRejectedTx) {
      return {
        approvedSigners: [],
        nonApprovedSigners: ensureArray(multisig?.signers),
      }
    } else if (isPendingTx) {
      return {
        approvedSigners: ensureArray(pendingTransaction?.approvedSigners),
        nonApprovedSigners: ensureArray(pendingTransaction?.nonApprovedSigners),
      }
    } else {
      const approvedSigners: Address[] = ensureArray(
        activity?.multisigDetails?.signers,
      )
      const nonApprovedSigners = ensureArray(
        multisig?.signers.filter((signer) => {
          return !approvedSigners.find((as) => isEqualAddress(signer, as))
        }),
      )
      return {
        approvedSigners: approvedSigners,
        nonApprovedSigners: nonApprovedSigners,
      }
    }
  }, [
    activity?.multisigDetails?.signers,
    isPendingTx,
    isRejectedTx,
    multisig?.signers,
    pendingTransaction?.approvedSigners,
    pendingTransaction?.nonApprovedSigners,
  ])

  if (!selectedAccount || !requestId) {
    return <Navigate to={routes.accounts()} />
  }

  if (!pendingTransaction && !activity) {
    return <Navigate to={routes.accountActivity()} />
  }

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={transactionTransformed?.displayName}
    >
      <Box p={4}>
        {isPendingTx ? (
          <H3>Waiting for confirmations...</H3>
        ) : (
          <H3>{signers.approvedSigners.length} Confirmations</H3>
        )}
        {selectedAccount && (
          <TransactionConfirmationsScreenSubtitle
            multisig={multisig}
            approvedSignersLength={signers.approvedSigners.length}
            isPendingTx={isPendingTx}
          />
        )}
        <Divider my={4} color="neutrals.800" />
        <MultisigTransactionConfirmationsScreen
          account={selectedAccount}
          approvedSigners={signers.approvedSigners}
          nonApprovedSigners={signers.nonApprovedSigners}
        />
      </Box>
    </NavigationContainer>
  )
}

const TransactionConfirmationsScreenSubtitle = ({
  multisig,
  approvedSignersLength,
  isPendingTx,
}: {
  multisig?: Multisig
  approvedSignersLength: number
  isPendingTx: boolean
}) => {
  const missingConfirmationsMessage = useMemo(() => {
    if (isPendingTx) {
      if (multisig?.threshold) {
        const missingConfirmations = multisig?.threshold - approvedSignersLength
        return `${pluralise(missingConfirmations, "more confirmation")} required`
      }
    } else {
      return "No more confirmations required"
    }
  }, [approvedSignersLength, isPendingTx, multisig?.threshold])
  return <P2>{missingConfirmationsMessage}</P2>
}

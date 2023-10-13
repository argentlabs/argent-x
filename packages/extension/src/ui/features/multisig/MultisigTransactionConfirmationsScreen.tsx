import { BarBackButton, H4, NavigationContainer, P3 } from "@argent/ui"
import { Box, Divider } from "@chakra-ui/react"
import { useMemo } from "react"

import { routes, useRouteRequestId } from "../../routes"
import { transformTransaction } from "../accountActivity/transform"
import { getTransactionFromPendingMultisigTransaction } from "../accountActivity/transform/transaction/transformers/pendingMultisigTransactionAdapter"
import { Account } from "../accounts/Account"
import {
  useEncodedPublicKey,
  useEncodedPublicKeys,
  usePublicKey,
} from "../accounts/usePublicKey"
import { useRouteAccount } from "../shield/useRouteAccount"
import { useMultisig } from "./multisig.state"
import { useMultisigPendingTransaction } from "./multisigTransactions.state"
import { num } from "starknet"
import { isEqualAddress } from "@argent/shared"
import { MultisigOwner } from "./MultisigOwner"
import { useView } from "../../views/implementation/react"
import { creatorMultisigMetadataView } from "../../views/multisig"
import { Navigate } from "react-router-dom"

export const MultisigTransactionConfirmationsScreen = () => {
  const selectedAccount = useRouteAccount()

  const requestId = useRouteRequestId()
  const pendingTransaction = useMultisigPendingTransaction(requestId)
  const publicKey = usePublicKey()
  const encodedPubKey = useEncodedPublicKey(publicKey)

  const multisig = useMultisig(selectedAccount)
  const multisigMetadata = useView(creatorMultisigMetadataView(multisig))

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
  const approvedSignersPublicKey = useEncodedPublicKeys(
    pendingTransaction?.approvedSigners ?? [],
  )

  if (!selectedAccount || !requestId) {
    return <Navigate to={routes.accounts()} />
  }

  if (!pendingTransaction) {
    // This means that there was a requestId with pendingTransaction in the past, but now it's submitted.
    // In this case, we should redirect to the account activity screen.
    return <Navigate to={routes.accountActivity()} />
  }

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
        {publicKey && (
          <MultisigOwner
            owner={publicKey}
            signerMetadata={multisigMetadata?.signers?.find((signerMetadata) =>
              isEqualAddress(publicKey, signerMetadata.key),
            )}
            approved={approvedSignersPublicKey.some(
              (key) => key === encodedPubKey,
            )}
          />
        )}
        <P3 color="neutrals.300" mb={3}>
          Other owners
        </P3>
        {pendingTransaction?.approvedSigners
          .filter((signer) => {
            if (!publicKey) {
              return false
            }
            return num.toBigInt(signer) !== num.toBigInt(publicKey)
          })
          .map((signer) => (
            <MultisigOwner
              owner={signer}
              key={signer}
              signerMetadata={multisigMetadata?.signers?.find(
                (signerMetadata) => isEqualAddress(signer, signerMetadata.key),
              )}
              approved
            />
          ))}
        {pendingTransaction?.nonApprovedSigners
          .filter((signer) => {
            if (!publicKey) {
              return false
            }
            return num.toBigInt(signer) !== num.toBigInt(publicKey)
          })
          .map((signer) => (
            <MultisigOwner
              owner={signer}
              key={signer}
              signerMetadata={multisigMetadata?.signers?.find(
                (signerMetadata) => isEqualAddress(signer, signerMetadata.key),
              )}
            />
          ))}
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
  const multisig = useMultisig(account)

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
